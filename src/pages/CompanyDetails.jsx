import React, { useEffect, useState } from "react";
import { Building2, Mail, Phone, MapPin, Globe, FileText, Users, Calendar, CheckCircle, XCircle, Eye, Download, Share2, Edit3 } from "lucide-react";
import { getCompanyById, getCompanyDetails } from "../api/CompanyApi";
import { getSecureItem, setSecureItem } from "../utils/secureStorage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompanyDetails = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(getSecureItem("CompanyId") || "");

  // Get companies from user object in secure storage
  useEffect(() => {
    const user = getSecureItem("user");
    if (user && user.Companies) {
      setCompanies(user.Companies);
      // If no selectedCompanyId, default to first company
      if (!selectedCompanyId && user.Companies.length > 0) {
        setSelectedCompanyId(user.Companies[0].CompanyID.toString());
        setSecureItem("CompanyId", user.Companies[0].CompanyID.toString());
      }
    }
  }, []);

  // Fetch company details when selectedCompanyId changes
  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const response = await getCompanyDetails(selectedCompanyId);

        if (response.success) {
          const companyData = response.data;
          setCompany(companyData);
        } else {
          setError("Failed to fetch company details. Please try again.");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching company details:", error);
        setError("Failed to fetch company details. Please try again.");
        setLoading(false);
      }
    };

    if (selectedCompanyId) {
      fetchCompany();
    }
  }, [selectedCompanyId]);

  // Handle company switch
  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);
    setSecureItem("CompanyId", companyId);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 text-lg font-medium">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-amber-200">
          <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Defensive: If no company data, show a message
  if (!company) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-amber-200">
          <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No company data found</h3>
          <p className="text-slate-600 mb-6">Please check your company selection or try again.</p>
        </div>
      </div>
    );
  }

  const InfoCard = ({ icon: Icon, label, value, span = false, className = "" }) => (
    <div className={`bg-white rounded-xl p-4 border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all duration-200 ${span ? 'col-span-2' : ''} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-50 rounded-lg">
          <Icon className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-sm text-slate-900 font-medium break-words">{value || "Not provided"}</p>
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      status === 'Active' 
        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
        : 'bg-red-100 text-red-700 border border-red-200'
    }`}>
      {status}
    </span>
  );

  const renderOrders = (orders) => {
    return orders.map((order) => (
      <div key={order.OrderID} className="bg-white rounded-xl p-4 border border-amber-200 mb-4">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Order ID: {order.OrderID}</h3>
        <p className="text-sm text-slate-600">Status: {order.OrderStatus}</p>
        <p className="text-sm text-slate-600">Package: {order.PackageName || "N/A"}</p>
        <div className="mt-2">
          <h4 className="text-sm font-semibold text-slate-800">Services:</h4>
          <ul className="list-disc list-inside">
            {order.Services.map((service) => (
              <li key={service.ServiceDetailID} className="text-sm text-slate-600">
                {service.ItemName} - ₹{service.Total}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ));
  };

  const renderCustomers = (customers) => {
    return customers.map((customer) => (
      <div key={customer.CustomerID} className="bg-white rounded-xl p-4 border border-amber-200 mb-4">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {customer.FirstName} {customer.LastName}
        </h3>
        <p className="text-sm text-slate-600">Email: {customer.Email}</p>
        <p className="text-sm text-slate-600">Mobile: {customer.Mobile}</p>
      </div>
    ));
  };

  // Adjust the logic to handle the provided response structure
  const getPrimaryCustomerMobile = (customers) => {
    if (!customers || customers.length === 0) return "Not provided";
    const primaryCustomer = customers.find((customer) => customer.PrimaryCustomer === 1);
    return primaryCustomer ? primaryCustomer.Mobile : "Not provided";
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-amber-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {company?.BusinessName || "Company Name"}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold border border-amber-200">
                    {company?.ConstitutionCategory || "N/A"}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                    {company?.Sector || "N/A"}
                  </span>
                  <StatusBadge status={company?.IsActive === 1 ? "Active" : "Inactive"} />
                </div>
                <p className="text-slate-600">
                  Company ID: <span className="font-semibold text-amber-700">{company?.CompanyID}</span>
                </p>
                {/* Company Switcher Dropdown */}
                {companies.length > 1 && (
                  <div className="mt-4">
                    <label htmlFor="company-switcher" className="block text-sm font-medium text-amber-700 mb-1">Switch Company:</label>
                    <select
                      id="company-switcher"
                      value={selectedCompanyId}
                      onChange={handleCompanyChange}
                      className="px-3 py-2 rounded-xl border border-amber-300 focus:outline-none focus:ring focus:ring-amber-200"
                    >
                      {companies.map((c) => (
                        <option key={c.CompanyID} value={c.CompanyID}>{c.BusinessName || `Company #${c.CompanyID}`}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            {/* ...existing code... */}
          </div>
        </div>

        {/* Navigation Tabs */}
        {/* <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 border border-amber-200">
          <div className="flex space-x-1">
            {['overview', 'customers', 'documents', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition duration-200 ${
                  activeTab === tab
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div> */}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Location */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Mail className="w-5 h-5 text-amber-600" />
                </div>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard
                  icon={Mail}
                  label="Company Email"
                  value={company?.Customers?.length > 0 ? company.Customers[0].Email : "Not provided"}
                  span
                />
                <InfoCard
                  icon={Phone}
                  label="Company Mobile"
                        value={company?.Customers?.length > 0 ? company.Customers[0].Mobile : "Not provided"}
                  span
                />
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                Location Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard icon={MapPin} label="City" value={company?.City} />
                <InfoCard icon={MapPin} label="State" value={company?.State} />
                <InfoCard icon={MapPin} label="Country" value={company?.Country} />
                <InfoCard icon={MapPin} label="Pin Code" value={company?.PinCode} />
                <InfoCard icon={Globe} label="Website" value={company?.Website} />
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                Business Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard icon={FileText} label="Business Nature" value={company?.BusinessNature} />
                <InfoCard icon={FileText} label="Customer Category" value={company?.CustomerCategory} />
                <InfoCard icon={FileText} label="Origin" value={company?.Origin} />
              </div>
            </div>
          </div>

          {/* Right Column - Legal & System Info */}
          <div className="space-y-6">
            {/* Legal Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                Legal Details
              </h2>
              <div className="space-y-4">
                <InfoCard icon={FileText} label="Company ID" value={company?.CompanyID} />
                <InfoCard icon={FileText} label="CIN" value={company?.CIN} />
                <InfoCard icon={FileText} label="PAN" value={company?.CompanyPAN} />
                <InfoCard icon={FileText} label="GST Number" value={company?.GSTNumber} />
                {/* <InfoCard icon={FileText} label="Franchise ID" value={company?.FranchiseID} /> */}
              </div>
            </div>

            {/* System Information */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                System Information
              </h2>
              <div className="space-y-4">
                <InfoCard 
                  icon={Calendar} 
                  label="Created At" 
                  value={company?.CreatedAt ? new Date(company.CreatedAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : "N/A"} 
                />
                <InfoCard icon={Users} label="Created By" value={company?.CreatedBy} />
                <InfoCard 
                  icon={Calendar} 
                  label="Updated At" 
                  value={company?.UpdatedAt ? new Date(company.UpdatedAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : "N/A"} 
                />
              </div>
            </div> */}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                
                  <Users className="w-8 h-8 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Customers</p>
                    <p className="text-2xl font-bold">{company?.Customers?.length || 0}</p>
                  </div>
                  <Users className="w-8 h-8 opacity-80" />
                </div>
              </div>
            </div>

            {/* Quick Status */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Primary Company</span>
                  <StatusBadge status={company?.PrimaryCompany === 1 ? "Yes" : "No"} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Status</span>
                  <StatusBadge status={company?.IsActive === 1 ? "Active" : "Inactive"} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Amount</span>
                  <span className="text-sm font-semibold text-amber-700">
                    {company?.Amount ? `₹${company.Amount}` : "Not set"}
                  </span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;