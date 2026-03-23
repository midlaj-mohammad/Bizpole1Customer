import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText,
  FiChevronRight,
  FiPlus,
  FiMinus,
  FiDownload,
  FiEye,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { getCompanyInvoices } from '../api/Companyinvoice';
import { getSecureItem } from '../utils/secureStorage';
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';

const InvoiceProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
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
        setInvoices(response.data);
        calculateStats(response.data);
      } else {
        setInvoices([]);
        calculateStats([]);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to fetch invoices. Please try again.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };
  // const handleOrderChange = async (orderId) => {
  //   setSelectedOrderId(orderId);
  //   setLoading(true);
  //   try {
  //     const fetchedInvoices = await getInvoicesForOrder(orderId);
  //     setInvoices(fetchedInvoices);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const calculateStats = (invoiceData) => {
    const totalInvoices = invoiceData.length;
    const totalAmount = invoiceData.reduce((sum, inv) => {
      const amount = parseFloat(inv.InvoiceValue || inv.OrderValue || inv.InvoiceTotal || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const paidInvoices = invoiceData.filter(inv => 
      inv.InvoiceStatus?.toLowerCase() === 'paid' || 
      inv.Status?.toLowerCase() === 'paid'
    ).length;
    
    const pendingInvoices = invoiceData.filter(inv => 
      inv.InvoiceStatus?.toLowerCase() === 'pending' || 
      inv.Status?.toLowerCase() === 'pending'
    ).length;
    
    const overdueInvoices = invoiceData.filter(inv => 
      inv.InvoiceStatus?.toLowerCase() === 'overdue' || 
      inv.Status?.toLowerCase() === 'overdue'
    ).length;

    setStats({
      totalInvoices,
      totalAmount,
      paidInvoices,
      pendingInvoices,
      overdueInvoices
    });
  };

  const handleViewInvoice = (invoice) => {
    try {
      const secret = import.meta.env.VITE_QUOTE_LINK_SECRET || "default_secret";
      const orderId = invoice.OrderID || invoice.id;
      
      if (!orderId) {
        console.error("No Order ID found for invoice");
        return;
      }

      const encryptedOrderId = encodeURIComponent(
        CryptoJS.AES.encrypt(String(orderId), secret).toString()
      );
      
      // Pass invoice data via state
      navigate(`/profile/invoice-preview/${encryptedOrderId}`, {
        state: { invoiceData: invoice }
      });
    } catch (error) {
      console.error("Error encrypting order ID:", error);
    }
  };

  const handleDownloadInvoice = (invoice) => {
    // Implement download functionality
    console.log("Download invoice:", invoice);
  };

  const faqs = [
    {
      question: 'How are seats billed?',
      answer: 'Seats are billed monthly based on your subscription plan. You can add or remove seats at any time.'
    },
    {
      question: 'What are available seats?',
      answer: 'Available seats are the number of users that can access your account. Additional seats can be purchased as needed.'
    },
    {
      question: 'When will I receive my invoice?',
      answer: 'Invoices are generated on the 1st of each month and are due by the 8th of the same month.'
    },
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
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
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

  const getNextInvoice = () => {
    if (!invoices.length) return null;
    
    const now = new Date();
    const futureInvoices = invoices
      .filter(inv => {
        const invDate = new Date(inv.InvoiceDate || inv.OrderDate);
        return invDate > now && inv.InvoiceStatus?.toLowerCase() !== 'paid';
      })
      .sort((a, b) => new Date(a.InvoiceDate) - new Date(b.InvoiceDate));
    
    return futureInvoices[0] || invoices[0];
  };

  const nextInvoice = getNextInvoice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Invoice Management
            </h1>
            <p className="text-gray-600">
              Manage and view all invoices for your company
            </p>
          </div>
          
          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchInvoices}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-yellow-100"
            disabled={loading}
          >
            <FiRefreshCw className={`w-5 h-5 text-yellow-600 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: FiEye },
            { id: 'invoices', label: 'Invoices', icon: FiFileText },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/30'
                : 'bg-white text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 border-2 border-yellow-100'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-full bg-yellow-400 -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'invoices' && (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              variants={containerVariants}

            >
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-3xl p-6 border-2 border-yellow-100 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full">
                      <FiFileText className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-3xl p-6 border-2 border-yellow-100 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.totalAmount)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <FiDollarSign className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-3xl p-6 border-2 border-yellow-100 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Paid Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.paidInvoices}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <FiCheckCircle className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="bg-white rounded-3xl p-6 border-2 border-yellow-100 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pending/Overdue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pendingInvoices + stats.overdueInvoices}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full">
                      <FiAlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Invoice Table */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-3xl shadow-xl border-2 border-yellow-100 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="inline-block w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600">Loading invoices...</p>
                    </div>
                  ) : error ? (
                    <div className="p-12 text-center">
                      <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <p className="text-red-600 mb-4">{error}</p>
                      <button
                        onClick={fetchInvoices}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                      >
                        Retry
                      </button>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="p-12 text-center">
                      <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No invoices found</p>
                      <p className="text-gray-400 text-sm">There are no invoices for this company yet.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-50 bg-yellow-50/50">
                          <th className="text-left py-5 px-6 text-sm font-semibold text-gray-700">Invoice Code</th>
                          <th className="text-left py-5 px-6 text-sm font-semibold text-gray-700">Invoice Date</th>
                          <th className="text-left py-5 px-6 text-sm font-semibold text-gray-700">Company Name</th>
                          <th className="text-left py-5 px-6 text-sm font-semibold text-gray-700">Customer</th>
                          <th className="text-left py-5 px-6 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-left py-5 px-6 text-sm font-semibold text-gray-700">Total Amount</th>
                          <th className="text-right py-5 px-6 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice, index) => (
                          <motion.tr
                            key={invoice.InvoiceID || invoice.id || index}
                            variants={itemVariants}
                            className="border-b border-gray-100 hover:bg-yellow-50/30 transition-colors"
                          >
                            <td className="py-5 px-6">
                              <span className="text-sm font-medium text-gray-900">
                                {invoice.InvoiceCode || invoice.invoiceCode || 'N/A'}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                  <FiCalendar className="w-4 h-4 text-yellow-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatDate(invoice.InvoiceDate || invoice.invoiceDate)}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span className="text-sm text-gray-700">
                                {invoice.CompanyName || invoice.companyName || '-'}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <span className="text-sm text-gray-700">
                                {invoice.PrimaryCustomer || invoice.customerName || '-'}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(invoice.InvoiceStatus || invoice.Status)}`}>
                                {invoice.InvoiceStatus || invoice.Status || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(invoice.InvoiceValue || invoice.OrderValue || invoice.InvoiceTotal || invoice.amount)}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewInvoice(invoice)}
                                  className="p-2 hover:bg-yellow-100 rounded-full transition-colors group"
                                  title="View Invoice"
                                >
                                  <FiEye className="w-4 h-4 text-gray-600 group-hover:text-yellow-600" />
                                </button>
                                <button 
                                  onClick={() => handleDownloadInvoice(invoice)}
                                  className="p-2 hover:bg-yellow-100 rounded-full transition-colors group"
                                  title="Download Invoice"
                                >
                                  <FiDownload className="w-4 h-4 text-gray-600 group-hover:text-yellow-600" />
                                </button>
                                <button 
                                  onClick={() => handleViewInvoice(invoice)}
                                  className="p-2 hover:bg-yellow-100 rounded-full transition-colors group"
                                  title="View Details"
                                >
                                  <FiChevronRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-600" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Next Invoice Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                variants={itemVariants}
                className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl shadow-xl p-8 text-white"
              >
                {nextInvoice ? (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-white/90 mb-2">Next Invoice</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">
                            {formatCurrency(nextInvoice.InvoiceValue || nextInvoice.OrderValue || nextInvoice.InvoiceTotal)}
                          </span>
                          <span className="text-sm text-white/80">
                            due {formatDate(nextInvoice.InvoiceDate || nextInvoice.OrderDate)}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 mt-2">
                          {nextInvoice.InvoiceCode || nextInvoice.invoiceCode || 'Invoice'}
                        </p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-full">
                        <FiCalendar className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/20">
                      <span className="text-sm">Preview invoice details</span>
                      <button 
                        onClick={() => handleViewInvoice(nextInvoice)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-yellow-600 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                      >
                        Preview <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                    <FiFileText className="w-12 h-12 text-white/60 mb-3" />
                    <span className="text-white/80 text-lg">No upcoming invoices</span>
                    <p className="text-white/60 text-sm mt-2">All invoices are paid and up to date</p>
                  </div>
                )}
              </motion.div>

              {/* Plan Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                variants={itemVariants}
                className="bg-white rounded-3xl shadow-xl border-2 border-yellow-100 p-8"
              >
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">👑</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">You're on the Plus Plan</h3>
                    <p className="text-sm text-gray-600">Premium features with priority support</p>
                  </div>
                  <button className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full border-2 border-yellow-300 transition-colors">
                    View Plans
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Monthly Billing</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalAmount / 12)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Active Invoices</p>
                    <p className="text-lg font-bold text-gray-900">{stats.pendingInvoices}</p>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Frequently Asked Questions</h4>
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="border-2 border-yellow-100 rounded-2xl overflow-hidden hover:border-yellow-200 transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-yellow-50/30 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                        <motion.div
                          animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {expandedFaq === index ? (
                            <FiMinus className="text-yellow-500" />
                          ) : (
                            <FiPlus className="text-yellow-500" />
                          )}
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {expandedFaq === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 text-sm text-gray-600">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download All Button */}
        {activeTab === 'invoices' && invoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <FiDownload className="w-5 h-5" />
              Download All Invoices
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InvoiceProfile;