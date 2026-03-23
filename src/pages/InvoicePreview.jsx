import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getCompanyInvoices } from "../api/Companyinvoice";
import { getSecureItem } from "../utils/secureStorage";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import { 
  FiDownload, 
  FiArrowLeft, 
  FiPrinter,
  FiMail,
  FiFileText,
  FiAlertCircle
} from "react-icons/fi";

const InvoicePreview = () => {
  const { encrypted } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(location.state?.invoiceData || null);
  const [loading, setLoading] = useState(!location.state?.invoiceData);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Decrypt the encrypted orderId
  const decryptOrderId = () => {
    if (!encrypted) {
      console.error("Encrypted orderId is missing.");
      return null;
    }
    try {
      const secret = import.meta.env.VITE_QUOTE_LINK_SECRET || "default_secret";
      const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encrypted), secret);
      const decryptedOrderId = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedOrderId || encrypted;
    } catch (error) {
      console.error("Error decrypting orderId:", error);
      return encrypted;
    }
  };

  const orderId = decryptOrderId();

  useEffect(() => {
    // If we already have invoice data from state, no need to fetch
    if (invoice) {
      setLoading(false);
      return;
    }

    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const selectedCompany = getSecureItem("selectedCompany");
        const companyId = selectedCompany?.CompanyID;
        
        if (!companyId) {
          throw new Error("No company selected. Please select a company first.");
        }

        const response = await getCompanyInvoices({ 
          companyId, 
          limit: 50, 
          page: 1 
        });

        if (response.success && Array.isArray(response.data)) {
          const found = response.data.find(inv => 
            String(inv.OrderID) === String(orderId) || 
            String(inv.id) === String(orderId)
          );
          
          if (found) {
            setInvoice(found);
          } else {
            setError("Invoice not found for the specified order.");
          }
        } else {
          setError("Failed to fetch invoices.");
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError(err.message || "Failed to fetch invoice. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId, invoice]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        unit: "px",
        format: "a4",
        orientation: "portrait"
      });

      const element = document.getElementById("invoice-content");
      if (!element) {
        throw new Error("Invoice content not found");
      }

      // Hide download button during PDF generation
      const downloadBtn = document.querySelector(".download-btn");
      if (downloadBtn) {
        downloadBtn.style.display = "none";
      }

      await doc.html(element, {
        callback: function(doc) {
          // Restore download button
          if (downloadBtn) {
            downloadBtn.style.display = "flex";
          }
          doc.save(`invoice-${invoice?.InvoiceCode || 'download'}.pdf`);
          setDownloading(false);
        },
        x: 15,
        y: 15,
        width: 550,
        windowWidth: 1000,
        html2canvas: {
          scale: 0.5,
          useCORS: true,
          logging: false,
          allowTaint: false
        }
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setDownloading(false);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    // Implement email functionality
    window.location.href = `mailto:?subject=Invoice ${invoice?.InvoiceCode}&body=Please find the invoice details attached.`;
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const calculateTax = (amount, rate = 9) => {
    const numAmount = parseFloat(amount) || 0;
    return (numAmount * rate) / 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border-2 border-red-100"
        >
          <FiAlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Invoice</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border-2 border-yellow-100"
        >
          <FiFileText className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Invoice Found</h2>
          <p className="text-gray-600 mb-6">The requested invoice could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const subtotal = parseFloat(invoice.OrderValue || invoice.InvoiceValue || invoice.InvoiceTotal || 0);
  const sgst = calculateTax(subtotal, 9);
  const cgst = calculateTax(subtotal, 9);
  const total = subtotal + sgst + cgst;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Action Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-between items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all border-2 border-yellow-100"
          >
            <FiArrowLeft className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Back</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all border-2 border-yellow-100"
            >
              <FiPrinter className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Print</span>
            </button>
            
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all border-2 border-yellow-100"
            >
              <FiMail className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Email</span>
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="download-btn inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Invoice Content */}
        <motion.div
          id="invoice-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-yellow-100 print:shadow-none print:border-none"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-yellow-100 pb-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Bizpole
              </h1>
              <p className="text-sm text-gray-500 mt-1">Business Solutions</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-sm text-gray-500 mt-1">
                #{invoice.InvoiceCode || invoice.invoiceCode || 'N/A'}
              </p>
            </div>
          </div>

          {/* Company and Bill To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">FROM</h3>
              <p className="font-bold text-gray-800">Bizpole</p>
              <p className="text-sm text-gray-600 mt-1">2ND FLOOR, FALCON COMPLEX</p>
              <p className="text-sm text-gray-600">OPP HPCL PETROL BUNK, NURANI</p>
              <p className="text-sm text-gray-600">Palakkad City, Palakkad - 678014</p>
              <p className="text-sm text-gray-600">Kerala, India</p>
              <p className="text-sm text-gray-600 mt-2">+91 9707xxxxxx</p>
              <p className="text-sm text-gray-600">GST: 32ABCDE1234F1Z5</p>
            </div>
            
            <div className="md:text-right">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">BILL TO</h3>
              <p className="font-bold text-gray-800">{invoice.PrimaryCustomer || invoice.customerName || 'Customer Name'}</p>
              <p className="text-sm text-gray-600 mt-1">{invoice.CompanyName || invoice.companyName || 'Company Name'}</p>
              <p className="text-sm text-gray-600">Place of Supply: KARNATAKA (29)</p>
              <p className="text-sm text-gray-600 mt-4">GST: {invoice.CustomerGST || 'N/A'}</p>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-yellow-50 rounded-2xl p-6 mb-8">
            <div>
              <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
              <p className="font-semibold text-gray-800">{invoice.InvoiceCode || invoice.invoiceCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Invoice Date</p>
              <p className="font-semibold text-gray-800">{formatDate(invoice.InvoiceDate || invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Order Number</p>
              <p className="font-semibold text-gray-800">{invoice.OrderID || invoice.orderId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Due Date</p>
              <p className="font-semibold text-gray-800">{formatDate(invoice.DueDate || invoice.dueDate) || 'N/A'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Items</h3>
            <table className="w-full">
              <thead>
                <tr className="bg-yellow-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 rounded-l-lg">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 rounded-r-lg">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Sample item - you can map through actual items if available */}
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">
                    {invoice.InvoiceDescription || invoice.description || 'Service/Product Description'}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-700">1</td>
                  <td className="py-4 px-4 text-right text-gray-700">{formatCurrency(subtotal)}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-800">{formatCurrency(subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SGST @ 9%</span>
                  <span className="font-medium text-gray-800">{formatCurrency(sgst)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">CGST @ 9%</span>
                  <span className="font-medium text-gray-800">{formatCurrency(cgst)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-bold text-lg text-yellow-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {/* <div className="border-t-2 border-yellow-100 pt-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className={`text-lg font-semibold ${
                invoice.InvoiceStatus?.toLowerCase() === 'paid' ? 'text-green-600' : 
                invoice.InvoiceStatus?.toLowerCase() === 'pending' ? 'text-yellow-600' : 
                invoice.InvoiceStatus?.toLowerCase() === 'overdue' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {invoice.InvoiceStatus || invoice.Status || 'Pending'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="text-lg font-semibold text-green-600">
                {invoice.InvoiceStatus?.toLowerCase() === 'paid' ? formatCurrency(total) : '₹0.00'}
              </p>
            </div>
          </div> */}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
            <p>This is a computer generated invoice and does not require a physical signature.</p>
            <p className="mt-1">For any queries, please contact support@bizpole.com</p>
          </div>
        </motion.div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            body { background: white; }
            .print\\:shadow-none { box-shadow: none; }
            .print\\:border-none { border: none; }
            button { display: none; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InvoicePreview;