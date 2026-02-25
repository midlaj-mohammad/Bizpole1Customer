import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Loader2, Eye, Phone, PhoneOff, Tag, FileText, CheckCircle, Users, Building2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import locationData from "../../utils/statesAndDistricts.json";
import DealsApi from "../../api/DealsApi";
import { getSecureItem } from "../../utils/secureStorage";
import Select, { components } from "react-select";

// â”€â”€â”€ Existing Entity Dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ExistingEntityDropdown = ({ type, onSelect, onClose, apiBaseUrl }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const dropdownRef = useRef(null);
    const searchTimeout = useRef(null);

    const fetchEntities = useCallback(async (searchQuery, pageNum = 1, append = false) => {
        setIsLoading(true);
        try {
            const endpoint = type === "customer"
                ? `${apiBaseUrl}/customers?search=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=10`
                : `${apiBaseUrl}/companies?search=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=10`;

            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${getSecureItem("partnerToken")}` },
            });
            const data = await response.json();
            if (data.success) {
                const newResults = data.data || [];
                setResults(prev => append ? [...prev, ...newResults] : newResults);
                setHasMore(newResults.length === 10);
            }
        } catch (err) {
            console.error(`Error fetching ${type}s:`, err);
        } finally {
            setIsLoading(false);
        }
    }, [type, apiBaseUrl]);

    useEffect(() => {
        fetchEntities("", 1, false);
    }, []);

    useEffect(() => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setPage(1);
            fetchEntities(query, 1, false);
        }, 300);
        return () => clearTimeout(searchTimeout.current);
    }, [query]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [onClose]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchEntities(query, nextPage, true);
    };

    return (
        <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 bg-white border border-indigo-100 rounded-2xl shadow-xl shadow-indigo-100/40 overflow-hidden"
        >
            {/* Search Bar */}
            <div className="p-2.5 border-b border-gray-100 bg-gray-50/70">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#4b49ac] focus-within:ring-2 focus-within:ring-[#4b49ac]/10 transition-all">
                    <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search ${type === "customer" ? "customers" : "companies"}â€¦`}
                        className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-h-56 overflow-y-auto">
                {isLoading && results.length === 0 ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loadingâ€¦</span>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        {type === "customer"
                            ? <Users className="w-8 h-8 mb-1.5 opacity-30" />
                            : <Building2 className="w-8 h-8 mb-1.5 opacity-30" />}
                        <p className="text-sm font-medium">No {type === "customer" ? "customers" : "companies"} found</p>
                    </div>
                ) : (
                    <>
                        {results.map((item, idx) => (
                            <motion.button
                                key={item.id || item.CustomerID || item.CompanyID || idx}
                                type="button"
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => onSelect(item)}
                                className="w-full px-4 py-3 text-left hover:bg-indigo-50/70 transition-colors border-b border-gray-50 last:border-0 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#4b49ac]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4b49ac]/15 transition-colors">
                                        {type === "customer"
                                            ? <Users className="w-3.5 h-3.5 text-[#4b49ac]" />
                                            : <Building2 className="w-3.5 h-3.5 text-[#4b49ac]" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {type === "customer"
                                                ? (item.name || item.Name || item.CustomerName)
                                                : (item.name || item.Name || item.CompanyName)}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {type === "customer"
                                                ? (item.mobile || item.Mobile || item.email || item.Email || "")
                                                : (item.gst || item.GST || item.CompanyGST || item.email || item.Email || "")}
                                        </p>
                                    </div>
                                    {(item.state || item.State) && (
                                        <span className="ml-auto text-[10px] font-bold text-[#4b49ac]/60 bg-[#4b49ac]/5 px-2 py-0.5 rounded-full flex-shrink-0">
                                            {item.state || item.State}
                                        </span>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                        {hasMore && (
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="w-full py-2.5 text-xs font-semibold text-[#4b49ac] hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                {isLoading ? "Loadingâ€¦" : "Load more"}
                            </button>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

// â”€â”€â”€ If Existing Toggle Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const IfExistingButton = ({ active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl transition-all duration-200
            ${active
                ? "bg-[#4b49ac] text-white shadow-sm shadow-[#4b49ac]/30"
                : "bg-[#4b49ac]/8 text-[#4b49ac] hover:bg-[#4b49ac]/15"}`}
    >
        <Search className="w-3 h-3" />
        {active ? "New Entry" : "If Existing"}
    </button>
);

// â”€â”€â”€ Service Details Popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ServiceDetailsPopup = ({ category, services, onClose }) => {
    if (!category) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#4b49ac] to-[#6e6dd4] px-6 pt-6 pb-8">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-2xl">
                            <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Service Category</p>
                            <h3 className="text-white text-lg font-bold leading-tight">{category.label}</h3>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {services.length} {services.length === 1 ? "Service" : "Services"} available
                        </span>
                    </div>
                </div>

                {/* Services List */}
                <div className="px-6 py-4 max-h-[360px] overflow-y-auto">
                    {services.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <FileText className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-sm font-medium">No services found</p>
                            <p className="text-xs mt-1">This category has no services listed yet.</p>
                        </div>
                    ) : (
                        <ul className="space-y-2.5">
                            {services.map((service, idx) => (
                                <motion.li
                                    key={service.ServiceID || idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-indigo-50/60 border border-transparent hover:border-indigo-100 transition-all duration-200 group"
                                >
                                    <div className="mt-0.5 p-1 rounded-lg bg-[#4b49ac]/10 text-[#4b49ac] group-hover:bg-[#4b49ac]/20 transition-colors flex-shrink-0">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 leading-tight">
                                            {service.ServiceName}
                                        </p>

                                        {service.Description && (
                                            <div className="mt-0.5 max-h-20 overflow-y-auto pr-1">
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    {service.Description}
                                                </p>
                                            </div>
                                        )}

                                        {service.ServiceCode && (
                                            <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#4b49ac]/8 text-[#4b49ac] px-2 py-0.5 rounded-md">
                                                {service.ServiceCode}
                                            </span>
                                        )}
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-[#4b49ac] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#3f3da0] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// â”€â”€â”€ Main Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AddDealModal = ({ isOpen = true, onClose, onSuccess, deal, initialData }) => {
    const navigate = useNavigate();
    console.log("AddDealModal deal prop:", deal);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [errors, setErrors] = useState({});
    const [dealType, setDealType] = useState("Individual");

    // "If Existing" toggle state
    const [useExistingCustomer, setUseExistingCustomer] = useState(false);
    const [useExistingCompany, setUseExistingCompany] = useState(false);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [selectedExistingCustomer, setSelectedExistingCustomer] = useState(null);
    const [selectedExistingCompany, setSelectedExistingCompany] = useState(null);

    // Associate-scoped lists
    const [associateCompanies, setAssociateCompanies] = useState([]);
    const [associateCustomersForCompany, setAssociateCustomersForCompany] = useState([]);
    const [isFetchingCompanies, setIsFetchingCompanies] = useState(false);
    const [isFetchingCustomers, setIsFetchingCustomers] = useState(false);
    const [companySearch, setCompanySearch] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");

    // Service Details Popup state
    const [servicePopup, setServicePopup] = useState({ open: false, category: null });

    console.log("AddDealModal isOpen:", isOpen);

    const [formData, setFormData] = useState({
        customerName: "",
        mobile: "",
        email: "",
        country: "India",
        pincode: "",
        state: "",
        district: "",
        preferredLanguage: "",
        closureDate: "",
        communication: false,
        serviceType: "individual",
        serviceCategory: "",
        serviceState: "",
        selectedServices: [],
        selectedPackage: null,
        billingPeriod: "monthly",
        companyName: "",
        companyGST: "",
        companyMobile: "",
        companyEmail: "",
        companyCountry: "India",
        companyState: "",
        companyDistrict: "",
        companyPreferredLanguage: "",
    });

    console.log({ formData });

    const [availableCompanyDistricts, setAvailableCompanyDistricts] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);
    const [servicePricing, setServicePricing] = useState([]);
    const [availablePackages, setAvailablePackages] = useState([]);

    // Cache: categoryId -> services[]
    const [categoryServicesCache, setCategoryServicesCache] = useState({});

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (formData.state) {
            const selectedState = locationData.states.find((s) => s.stateName === formData.state);
            setAvailableDistricts(selectedState ? selectedState.districts : []);
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.state]);

    useEffect(() => {
        if (formData.companyState) {
            const selectedState = locationData.states.find((s) => s.stateName === formData.companyState);
            setAvailableCompanyDistricts(selectedState ? selectedState.districts : []);
        } else {
            setAvailableCompanyDistricts([]);
        }
    }, [formData.companyState]);

    // Fetch associate companies on open
    useEffect(() => {
        const fetchAssociateCompanies = async () => {
            if (!isOpen) return;
            setIsFetchingCompanies(true);
            try {
                const user = getSecureItem("partnerUser") || {};
                const associateId = user.id || null;
                const response = await fetch(`${API_BASE_URL}/company/associate-list`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ AssociateID: associateId, page: 1, limit: 100 }),
                });
                const data = await response.json();
                if (data.success) setAssociateCompanies(data.data || []);
            } catch (err) {
                console.error("Error fetching associate companies:", err);
            } finally {
                setIsFetchingCompanies(false);
            }
        };
        fetchAssociateCompanies();
    }, [isOpen]);

    // Fetch customers for selected company
    const fetchCustomersForCompany = async (companyId) => {
        if (!companyId) { setAssociateCustomersForCompany([]); return; }
        setIsFetchingCustomers(true);
        try {
            const companyDetailResp = await fetch(`${API_BASE_URL}/company/get-details`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getSecureItem("partnerToken")}`,
                },
                body: JSON.stringify({ CompanyId: companyId }),
            });
            const companyDetailData = await companyDetailResp.json();
            if (companyDetailData.success && companyDetailData.data) {
                setAssociateCustomersForCompany(companyDetailData.data.Customers || []);
            } else {
                // Fallback to all associate customers if company specific list fails
                const user = getSecureItem("partnerUser") || {};
                const associateId = user.id || null;
                const response = await fetch(`${API_BASE_URL}/customer/associate-list`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ AssociateID: associateId, page: 1, limit: 100 }),
                });
                const data = await response.json();
                if (data.success) setAssociateCustomersForCompany(data.data || []);
            }
        } catch (err) {
            console.error("Error fetching customers for company:", err);
            setAssociateCustomersForCompany([]);
        } finally {
            setIsFetchingCustomers(false);
        }
    };

    useEffect(() => {
        const fetchServiceCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/service-category?page=1&limit=100`, {
                    headers: { Authorization: `Bearer ${getSecureItem("partnerToken")}` },
                });
                const data = await response.json();
                if (data.success) setServiceCategories(data.data || []);
            } catch (error) {
                console.error("Error fetching service categories:", error);
            }
        };
        if (isOpen) fetchServiceCategories();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchFullDealDetails = async () => {
            if (deal && deal.id) {
                try {
                    const result = await DealsApi.getDealById(deal.id);
                    if (result.success && result.data) {
                        const d = result.data;
                        setFormData({
                            customerName: d.name || "",
                            mobile: d.mobile || "",
                            email: d.email || "",
                            country: d.country || "India",
                            pincode: d.PinCode || d.pincode || "",
                            state: d.state || "",
                            district: d.district || d.District || "",
                            preferredLanguage: d.PreferredLanguage || d.preferredLanguage || "",
                            closureDate: d.ClosureDate ? d.ClosureDate.split('T')[0] : "",
                            serviceType: d.dealType?.toLowerCase() || "individual",
                            serviceCategory: d.serviceCategoryId || d.services?.[0]?.serviceCategoryId || "",
                            serviceState: d.StateService || d.state || "",
                            selectedServices: d.services?.map(s => s.serviceId || s.ServiceID).filter(id => id) || [],
                            selectedPackage: d.packageId || null,
                            billingPeriod: d.billingPeriod || "monthly",
                            companyName: d.CompanyName || "",
                            companyGST: d.CompanyGST || d.gst || "",
                            companyMobile: d.CompanyMobile || d.mobile || "",
                            companyEmail: d.CompanyEmail || d.email || "",
                            companyCountry: d.CompanyCountry || "India",
                            companyState: d.CompanyState || d.state || "",
                            companyDistrict: d.CompanyDistrict || d.district || "",
                            companyPreferredLanguage: d.CompanyPreferredLanguage || "",
                            communication: d.communication === 1 || d.communication === true || false,
                        });
                        setDealType(d.dealType || "Individual");
                    }
                } catch (err) {
                    console.error("Error fetching full deal details", err);
                }
            } else if (!deal) {
                if (initialData && Object.keys(initialData).length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        serviceType: initialData.serviceType || "individual",
                        serviceCategory: initialData.serviceCategory || "",
                        serviceState: initialData.serviceState || "",
                        selectedServices: initialData.selectedServices || [],
                    }));
                    setDealType(initialData.serviceType === "package" ? "Package" : "Individual");
                    setStep(1);
                } else {
                    setFormData({
                        customerName: "", mobile: "", email: "", country: "India",
                        pincode: "", state: "", district: "", preferredLanguage: "",
                        closureDate: "", communication: false, serviceType: "individual",
                        serviceCategory: "", serviceState: "", selectedServices: [],
                        selectedPackage: null, billingPeriod: "monthly", companyName: "",
                        companyGST: "", companyMobile: "", companyEmail: "",
                        companyCountry: "India", companyState: "", companyDistrict: "",
                        companyPreferredLanguage: "",
                    });
                    setDealType("Individual");
                    setStep(1);
                }
            }
        };
        fetchFullDealDetails();
    }, [isOpen, deal, initialData]);

    useEffect(() => {
        const fetchServices = async () => {
            if (!formData.serviceCategory) { setAvailableServices([]); return; }
            try {
                const response = await fetch(
                    `${API_BASE_URL}/service-categories/${formData.serviceCategory}?limit=100`,
                    { headers: { Authorization: `Bearer ${getSecureItem("partnerToken")}` } }
                );
                const data = await response.json();
                if (data.success && data.data) {
                    const svcs = data.data.Services || [];
                    setAvailableServices(svcs);
                    setCategoryServicesCache(prev => ({ ...prev, [formData.serviceCategory]: svcs }));
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                setAvailableServices([]);
            }
        };
        fetchServices();
    }, [formData.serviceCategory]);

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/states`);
                const data = await response.json();
                if (data.success) setAvailableStates(data.data || []);
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        };
        if (isOpen) fetchStates();
    }, [isOpen]);

    useEffect(() => {
        const fetchServicePricing = async () => {
            if (!formData.serviceState || !formData.selectedServices || formData.selectedServices.length === 0) {
                setServicePricing([]); return;
            }
            try {
                const selectedState = availableStates.find((s) => s.state_name === formData.serviceState);
                if (!selectedState) return;
                const response = await fetch(
                    `${API_BASE_URL}/service-price-currency?StateName=Kerala&ServiceID=256`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getSecureItem("partnerToken")}`,
                        },
                        body: JSON.stringify({
                            StateID: selectedState.ID,
                            ServiceIDs: formData.selectedServices,
                            isIndividual: 1,
                            packageId: null,
                            yearly: 0,
                        }),
                    }
                );
                const data = await response.json();
                if (data.success) setServicePricing(data.data || []);
            } catch (error) {
                console.error("Error fetching service pricing:", error);
                setServicePricing([]);
            }
        };
        fetchServicePricing();
    }, [formData.serviceState, formData.selectedServices, availableStates]);

    useEffect(() => {
        const fetchPackages = async () => {
            if (formData.serviceType !== "package" || !formData.serviceState) {
                setAvailablePackages([]); return;
            }
            try {
                const selectedState = availableStates.find((s) => s.state_name === formData.serviceState);
                if (!selectedState) return;
                const response = await fetch(`${API_BASE_URL}/getPackage?isActive=1&limit=100`, {
                    headers: { Authorization: `Bearer ${getSecureItem("partnerToken")}` },
                });
                const data = await response.json();
                if (data.data) setAvailablePackages(data.data || []);
            } catch (error) {
                console.error("Error fetching packages:", error);
                setAvailablePackages([]);
            }
        };
        fetchPackages();
    }, [formData.serviceType, formData.serviceState, availableStates]);

    // â”€â”€ Fetch services for popup (uses cache or fetches fresh) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleOpenServicePopup = async (categoryOption) => {
        const catId = categoryOption.value;

        if (categoryServicesCache[catId]) {
            setServicePopup({ open: true, category: categoryOption, services: categoryServicesCache[catId] });
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/service-categories/${catId}?limit=100`,
                { headers: { Authorization: `Bearer ${getSecureItem("partnerToken")}` } }
            );
            const data = await response.json();
            const svcs = (data.success && data.data) ? (data.data.Services || []) : [];
            setCategoryServicesCache(prev => ({ ...prev, [catId]: svcs }));
            setServicePopup({ open: true, category: categoryOption, services: svcs });
        } catch {
            setServicePopup({ open: true, category: categoryOption, services: [] });
        }
    };

    // â”€â”€ Handle selecting an existing customer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleSelectExistingCustomer = async (customer) => {
        const customerId = customer.CustomerID || customer.id || customer.ID;
        if (!customerId) return;

        setSelectedExistingCustomer(customer);
        setShowCustomerDropdown(false);

        try {
            const response = await fetch(`${API_BASE_URL}/customer/get`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getSecureItem("partnerToken")}`,
                },
                body: JSON.stringify({ CustomerID: customerId }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                const c = data.data;
                const combinedName = c.CustomerName || c.name || c.Name ||
                    ((c.FirstName || c.LastName) ? `${c.FirstName || ''} ${c.LastName || ''}`.trim() : "");

                setFormData(prev => ({
                    ...prev,
                    customerName: combinedName,
                    mobile: c.Mobile || c.mobile || "",
                    email: c.Email || c.email || "",
                    country: c.Country || c.country || "India",
                    pincode: c.PinCode || c.Pincode || c.pincode || "",
                    state: c.State || c.state || "",
                    district: c.District || c.district || "",
                    preferredLanguage: c.PreferredLanguage || c.preferredLanguage || "",
                    communication: c.communication === 1 || c.communication === true || false,
                }));
            } else {
                // Fallback to existing object
                const fallbackName = customer.CustomerName || customer.name || customer.Name ||
                    ((customer.FirstName || customer.LastName) ? `${customer.FirstName || ''} ${customer.LastName || ''}`.trim() : "");

                setFormData(prev => ({
                    ...prev,
                    customerName: fallbackName,
                    mobile: customer.Mobile || customer.mobile || "",
                    email: customer.Email || customer.email || "",
                    country: customer.Country || customer.country || "India",
                    pincode: customer.PinCode || customer.Pincode || customer.pincode || "",
                    state: customer.State || customer.state || "",
                    district: customer.District || customer.district || "",
                    preferredLanguage: customer.PreferredLanguage || customer.preferredLanguage || "",
                    communication: customer.communication === 1 || customer.communication === true || false,
                }));
            }
        } catch (err) {
            console.error("Error fetching full customer details:", err);
        }
    };

    // â”€â”€ Handle selecting an existing company â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleSelectExistingCompany = async (company) => {
        const companyId = company.CompanyID || company.id || company.ID;
        if (!companyId) return;

        setSelectedExistingCompany(company);
        setShowCompanyDropdown(false);

        try {
            const response = await fetch(`${API_BASE_URL}/company/get-details`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getSecureItem("partnerToken")}`,
                },
                body: JSON.stringify({ CompanyId: companyId }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                const c = data.data;
                setFormData(prev => ({
                    ...prev,
                    companyName: c.BusinessName || c.CompanyName || c.name || c.Name || "",
                    companyGST: c.GSTNumber || c.CompanyGST || c.gst || c.GST || "",
                    companyMobile: c.CompanyMobile || c.Mobile || c.mobile || "",
                    companyEmail: c.CompanyEmail || c.Email || c.email || "",
                    companyCountry: c.Country || c.country || "India",
                    companyState: c.State || c.state || "",
                    companyDistrict: c.District || c.district || "",
                    companyPreferredLanguage: c.PreferredLanguage || c.preferredLanguage || "",
                }));
                // Set customers directly from the company details response
                setAssociateCustomersForCompany(c.Customers || []);
                if (c.Customers && c.Customers.length > 0) {
                    setUseExistingCustomer(true);
                    setShowCustomerDropdown(true);
                }
            } else {
                // Fallback to existing object and separate fetch
                setFormData(prev => ({
                    ...prev,
                    companyName: company.BusinessName || company.CompanyName || company.name || company.Name || "",
                    companyGST: company.GSTNumber || company.CompanyGST || company.gst || company.GST || "",
                    companyMobile: company.CompanyMobile || company.Mobile || company.mobile || "",
                    companyEmail: company.CompanyEmail || company.Email || company.email || "",
                    companyCountry: company.Country || company.country || "India",
                    companyState: company.State || company.state || "",
                    companyDistrict: company.District || company.district || "",
                    companyPreferredLanguage: company.PreferredLanguage || company.preferredLanguage || "",
                }));
                fetchCustomersForCompany(companyId);
            }
        } catch (err) {
            console.error("Error fetching full company details:", err);
            fetchCustomersForCompany(companyId);
        }

        // Reset customer selection
        setSelectedExistingCustomer(null);
    };

    // â”€â”€ Toggle existing customer mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const toggleExistingCustomer = () => {
        if (useExistingCustomer) {
            // Switching back to new entry â€” clear autofilled data
            setUseExistingCustomer(false);
            setShowCustomerDropdown(false);
            setSelectedExistingCustomer(null);
            setFormData(prev => ({
                ...prev,
                customerName: "", mobile: "", email: "", country: "India",
                pincode: "", state: "", district: "", preferredLanguage: "",
                communication: false,
            }));
        } else {
            setUseExistingCustomer(true);
            setShowCustomerDropdown(true);
        }
    };

    // â”€â”€ Toggle existing company mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const toggleExistingCompany = () => {
        if (useExistingCompany) {
            setUseExistingCompany(false);
            setShowCompanyDropdown(false);
            setSelectedExistingCompany(null);
            setFormData(prev => ({
                ...prev,
                companyName: "", companyGST: "", companyMobile: "", companyEmail: "",
                companyCountry: "India", companyState: "", companyDistrict: "",
                companyPreferredLanguage: "",
            }));
        } else {
            setUseExistingCompany(true);
            setShowCompanyDropdown(true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedData = { ...prev, [name]: value };
            if (name === "serviceType") {
                updatedData.dealType = value === "individual" ? "Individual" : "Package";
            }
            return updatedData;
        });
        if (errors[name]) {
            setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const handleServiceChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => parseInt(option.value));
        setFormData((prev) => ({ ...prev, selectedServices: selectedOptions }));
        if (errors.selectedServices) {
            setErrors((prev) => { const n = { ...prev }; delete n.selectedServices; return n; });
        }
    };

    // Step 1 = Company, Step 2 = Services, Step 3 = Customer
    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.companyName.trim()) newErrors.companyName = "Required";
        if (!formData.companyState) newErrors.companyState = "Required";
        if (!formData.companyDistrict) newErrors.companyDistrict = "Required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.serviceState) newErrors.serviceState = "Required";
        if (formData.serviceType === "individual") {
            if (!formData.serviceCategory) newErrors.serviceCategory = "Required";
            if (!formData.selectedServices || formData.selectedServices.length === 0)
                newErrors.selectedServices = "Please select at least one service";
        } else if (formData.serviceType === "package") {
            if (!formData.selectedPackage) newErrors.selectedPackage = "Required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.customerName.trim()) newErrors.customerName = "Required";
        if (!formData.mobile.trim()) newErrors.mobile = "Required";
        if (!formData.email.trim()) newErrors.email = "Required";
        if (!formData.state) newErrors.state = "Required";
        if (!formData.district) newErrors.district = "Required";
        if (!formData.closureDate) newErrors.closureDate = "Required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const handleBack = () => {
        if (step === 3) setStep(2);
        else if (step === 2) setStep(1);
    };

    const handleSubmit = async () => {
        if (!validateStep3()) return; // step3 is now customer
        setIsSubmitting(true);
        try {
            const user = getSecureItem("partnerUser") || {};
            const selectedState = availableStates.find((s) => s.state_name === formData.serviceState);
            const selectedCategory = serviceCategories.find(c => c.CategoryID === parseInt(formData.serviceCategory));

            let servicesPayload = [];

            if (formData.serviceType === "individual") {
                servicesPayload = formData.selectedServices.map((serviceId) => {
                    const service = availableServices.find((s) => s.ServiceID === serviceId);
                    const pricing = servicePricing.find((p) => p.ServiceID === serviceId);
                    return {
                        serviceId,
                        serviceName: service?.ServiceName || pricing?.ServiceName || "",
                        serviceCategoryId: formData.serviceCategory,
                        serviceCategory: selectedCategory?.CategoryName || "",
                        professionalFee: pricing?.ProfessionalFee || 0,
                        vendorFee: pricing?.VendorFee || 0,
                        contractorFee: pricing?.ContractFee || 0,
                        govtFee: pricing?.GovernmentFee || 0,
                        total: pricing?.TotalFee || pricing?.Total || 0,
                        dealType: "Individual",
                    };
                });
            } else if (formData.serviceType === "package") {
                const selectedPackage = availablePackages.find((pkg) => pkg.PackageID === parseInt(formData.selectedPackage));
                if (selectedPackage?.services?.length > 0) {
                    servicesPayload = selectedPackage.services.map((s) => ({
                        serviceId: s.ServiceID || s.serviceId,
                        serviceName: s.ServiceName || s.name || "",
                        packageId: selectedPackage.PackageID,
                        packageName: selectedPackage.PackageName,
                        billingPeriod: formData.billingPeriod,
                        professionalFee: formData.billingPeriod === "yearly" ? (s.ProfessionalFeeYearly || 0) : (s.ProfessionalFeeMonthly || 0),
                        vendorFee: formData.billingPeriod === "yearly" ? (s.VendorFeeYearly || 0) : (s.VendorFeeMonthly || 0),
                        govtFee: formData.billingPeriod === "yearly" ? (s.GovernmentFeeYearly || 0) : (s.GovernmentFeeMonthly || 0),
                        total: formData.billingPeriod === "yearly" ? (s.TotalFeeYearly || 0) : (s.TotalFeeMonthly || 0),
                        dealType: "Package",
                    }));
                }
            }

            if (deal && deal.id) {
                const payload = {
                    id: deal.id, name: formData.customerName, mobile: formData.mobile,
                    email: formData.email, state: formData.state,
                    franchiseId: user.FranchiseeID || 1, employeeId: user.EmployeeID || 9,
                    converted_at: deal.converted_at || new Date().toISOString(),
                    CompanyID: deal.CompanyID, CustomerID: deal.CustomerID,
                    ClosureDate: formData.closureDate,
                    serviceCategoryId: formData.serviceCategory,
                    serviceCategory: selectedCategory?.CategoryName || "",
                    quoteCRE: deal.quoteCRE || 9, sourceOfSale: deal.sourceOfSale || "Direct",
                    dealType: formData.serviceType === "individual" ? "Individual" : "Package",
                    isIndividual: formData.serviceType === "individual" ? 1 : 0,
                    services: servicesPayload,
                    packageName: formData.serviceType === "package" ? servicesPayload[0]?.packageName : null,
                    packageId: formData.serviceType === "package" ? servicesPayload[0]?.packageId : null,
                    billingPeriod: formData.billingPeriod,
                    StateService: formData.serviceState,
                    AssociateID: user.id || null, communication: formData.communication,
                };
                const response = await DealsApi.updateDeal(payload);
                if (response.success) { onSuccess?.(); onClose(); }
                else setErrors({ api: response.message || "Failed to update deal" });
            } else {
                const payload = {
                    leadId: null,
                    customer: {
                        name: formData.customerName, mobile: formData.mobile, email: formData.email,
                        country: formData.country, pincode: formData.pincode, state: formData.state,
                        district: formData.district, preferredLanguage: formData.preferredLanguage,
                        closureDate: formData.closureDate, communication: formData.communication,
                        isAssociate: true,
                        ...(selectedExistingCustomer && { existingCustomerId: selectedExistingCustomer.id || selectedExistingCustomer.CustomerID }),
                        services: servicesPayload.map(s => ({
                            ...s, ServiceID: s.serviceId, ServiceName: s.serviceName,
                            CategoryID: s.serviceCategoryId, CategoryName: s.serviceCategory,
                            TotalFee: s.total, ProfessionalFee: s.professionalFee,
                            VendorFee: s.vendorFee, GovernmentFee: s.govtFee, ContractFee: s.contractorFee,
                        })),
                    },
                    company: {
                        name: formData.companyName, gst: formData.companyGST, mobile: formData.companyMobile,
                        email: formData.companyEmail, country: formData.companyCountry, state: formData.companyState,
                        district: formData.companyDistrict, preferredLanguage: formData.companyPreferredLanguage,
                        isAssociate: true,
                        ...(selectedExistingCompany && { existingCompanyId: selectedExistingCompany.id || selectedExistingCompany.CompanyID }),
                    },
                    dealType: formData.serviceType === "individual" ? "Individual" : "Package",
                    isIndividual: formData.serviceType === "individual" ? 1 : 0,
                    serviceType: formData.serviceType,
                    franchiseeId: user.FranchiseeID || 1, employeeId: user.EmployeeID || 9,
                    isAssociate: true, AssociateID: user.id || null,
                };
                const response = await DealsApi.convertToDeal(payload);
                if (response.success) { onSuccess?.(); onClose(); }
                else setErrors({ api: response.message || "Failed to create deal" });
            }
        } catch (error) {
            setErrors({ api: error.response?.data?.message || "An error occurred" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // â”€â”€ Custom Option with Eye button that opens popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const CategoryOption = (props) => {
        return (
            <components.Option {...props}>
                <div className="flex items-center justify-between w-full">
                    <span>{props.data.label}</span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenServicePopup(props.data);
                        }}
                        className="p-1 hover:bg-[#4b49ac]/10 rounded-md transition-colors text-[#4b49ac] flex items-center justify-center"
                        title="View services in this category"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </components.Option>
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* â”€â”€ Service Details Popup â”€â”€ */}
            <AnimatePresence>
                {servicePopup.open && (
                    <ServiceDetailsPopup
                        category={servicePopup.category}
                        services={servicePopup.services || []}
                        onClose={() => setServicePopup({ open: false, category: null })}
                    />
                )}
            </AnimatePresence>

            {/* â”€â”€ Main Modal â”€â”€ */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {deal ? "Edit Deal" : "Add New Deal"}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

                                    {/* â”€â”€ Company Name with "If Existing" â”€â”€ */}
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm font-medium text-gray-700">Company Name</label>
                                            {!selectedExistingCompany && <IfExistingButton active={useExistingCompany} onClick={toggleExistingCompany} />}
                                        </div>

                                        {useExistingCompany ? (
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCompanyDropdown(v => !v)}
                                                    className={`w-full px-4 py-2 bg-white border rounded-lg text-left flex items-center justify-between transition-all
                                                        ${selectedExistingCompany
                                                            ? "border-[#4b49ac] ring-2 ring-[#4b49ac]/10"
                                                            : "border-gray-200 hover:border-[#4b49ac]/40"}`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Building2 className="w-4 h-4 text-[#4b49ac] flex-shrink-0" />
                                                        <span className={`text-sm truncate ${selectedExistingCompany ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                                            {selectedExistingCompany
                                                                ? (selectedExistingCompany.BusinessName || selectedExistingCompany.name || selectedExistingCompany.CompanyName)
                                                                : (isFetchingCompanies ? "Loading companiesâ€¦" : "Select existing companyâ€¦")}
                                                        </span>
                                                    </div>
                                                    {isFetchingCompanies
                                                        ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
                                                        : <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${showCompanyDropdown ? "rotate-180" : ""}`} />}
                                                </button>

                                                <AnimatePresence>
                                                    {showCompanyDropdown && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-50 w-full mt-1 bg-white border border-indigo-100 rounded-2xl shadow-xl shadow-indigo-100/40 overflow-hidden"
                                                        >
                                                            {/* Search Bar */}
                                                            <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                                                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-[#4b49ac] focus-within:ring-2 focus-within:ring-[#4b49ac]/10 transition-all">
                                                                    <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                                    <input
                                                                        type="text"
                                                                        value={companySearch}
                                                                        onChange={(e) => setCompanySearch(e.target.value)}
                                                                        placeholder="Search company..."
                                                                        className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                                                                    />
                                                                    {companySearch && (
                                                                        <button onClick={() => setCompanySearch("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="max-h-56 overflow-y-auto">
                                                                {associateCompanies.filter(c => (c.BusinessName || c.CompanyName || "").toLowerCase().includes(companySearch.toLowerCase()) || (c.GSTNumber || c.CompanyGST || "").toLowerCase().includes(companySearch.toLowerCase())).length === 0 ? (
                                                                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                                                        <Building2 className="w-8 h-8 mb-1.5 opacity-30" />
                                                                        <p className="text-sm font-medium">No companies found</p>
                                                                    </div>
                                                                ) : (
                                                                    associateCompanies
                                                                        .filter(c => (c.BusinessName || c.CompanyName || "").toLowerCase().includes(companySearch.toLowerCase()) || (c.GSTNumber || c.CompanyGST || "").toLowerCase().includes(companySearch.toLowerCase()))
                                                                        .map((company, idx) => (
                                                                            <motion.button
                                                                                key={company.CompanyID || idx}
                                                                                type="button"
                                                                                initial={{ opacity: 0, x: -6 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: idx * 0.03 }}
                                                                                onClick={() => { handleSelectExistingCompany(company); setShowCompanyDropdown(false); setCompanySearch(""); }}
                                                                                className="w-full px-4 py-3 text-left hover:bg-indigo-50/70 transition-colors border-b border-gray-50 last:border-0 group"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-xl bg-[#4b49ac]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4b49ac]/15 transition-colors">
                                                                                        <Building2 className="w-3.5 h-3.5 text-[#4b49ac]" />
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                        <p className="text-sm font-semibold text-gray-800 truncate">{company.BusinessName || company.CompanyName}</p>
                                                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{company.GSTNumber || company.CompanyGST || company.CompanyCode || ""}</p>
                                                                                    </div>
                                                                                    <span className="ml-auto text-[10px] font-bold text-[#4b49ac]/60 bg-[#4b49ac]/5 px-2 py-0.5 rounded-full flex-shrink-0">
                                                                                        ID: {company.CompanyID}
                                                                                    </span>
                                                                                </div>
                                                                            </motion.button>
                                                                        ))
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {selectedExistingCompany && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-2 px-3 py-2 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="w-3.5 h-3.5 text-[#4b49ac]" />
                                                            <span className="text-xs text-[#4b49ac] font-semibold">Company details autofilled</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedExistingCompany(null);
                                                                setAssociateCustomersForCompany([]);
                                                                setSelectedExistingCustomer(null);
                                                                setShowCompanyDropdown(true);
                                                            }}
                                                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            Change
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                                placeholder="Enter company name" />
                                        )}
                                        {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Company GST</label>
                                        <input type="text" name="companyGST" value={formData.companyGST} onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter GST number" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">Company Mobile</label>
                                            <input type="text" name="companyMobile" value={formData.companyMobile} onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                                placeholder="Enter mobile number" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">Company Email</label>
                                            <input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                                placeholder="Enter email address" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Company Country</label>
                                        <input type="text" name="companyCountry" value={formData.companyCountry} onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                                            <Select
                                                options={locationData.states.map((s) => ({ value: s.stateName, label: s.stateName }))}
                                                value={formData.companyState ? { value: formData.companyState, label: formData.companyState } : null}
                                                onChange={(selected) => setFormData({ ...formData, companyState: selected ? selected.value : "", companyDistrict: "" })}
                                                placeholder="Search or select state" isSearchable
                                                className="react-select-container" classNamePrefix="react-select"
                                            />
                                            {errors.companyState && <p className="text-xs text-red-500 mt-1">{errors.companyState}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">District</label>
                                            <Select
                                                options={availableCompanyDistricts.map((d) => ({ value: d.districtName, label: d.districtName }))}
                                                value={formData.companyDistrict ? { value: formData.companyDistrict, label: formData.companyDistrict } : null}
                                                onChange={(selected) => setFormData({ ...formData, companyDistrict: selected ? selected.value : "" })}
                                                placeholder="Search or select district" isSearchable isDisabled={!formData.companyState}
                                                className="react-select-container" classNamePrefix="react-select"
                                            />
                                            {errors.companyDistrict && <p className="text-xs text-red-500 mt-1">{errors.companyDistrict}</p>}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Company Preferred Language</label>
                                        <select name="companyPreferredLanguage" value={formData.companyPreferredLanguage} onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none">
                                            <option value="">Select Language</option>
                                            <option value="Malayalam">Malayalam</option>
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Tamil">Tamil</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button onClick={handleNext} className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors">
                                            Next
                                        </button>
                                    </div>
                                </motion.div>

                            ) : step === 2 ? (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">State where you need Service *</label>
                                        <Select
                                            options={availableStates.map((state) => ({ value: state.state_name, label: state.state_name }))}
                                            value={formData.serviceState ? { value: formData.serviceState, label: formData.serviceState } : null}
                                            onChange={(selected) => setFormData({ ...formData, serviceState: selected ? selected.value : "" })}
                                            placeholder="Search or select state" isSearchable
                                            className="react-select-container" classNamePrefix="react-select"
                                        />
                                        {errors.serviceState && <p className="text-xs text-red-500 mt-1">{errors.serviceState}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">Individual / Package Service</label>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="serviceType" value="individual"
                                                    checked={formData.serviceType === "individual"} onChange={handleChange}
                                                    disabled={!formData.serviceState} className="w-4 h-4 text-[#4b49ac] focus:ring-[#4b49ac] disabled:opacity-50" />
                                                <span className={`text-sm ${!formData.serviceState ? "text-gray-400" : "text-gray-700"}`}>Individual Service</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="serviceType" value="package"
                                                    checked={formData.serviceType === "package"} onChange={handleChange}
                                                    disabled={!formData.serviceState} className="w-4 h-4 text-[#4b49ac] focus:ring-[#4b49ac] disabled:opacity-50" />
                                                <span className={`text-sm ${!formData.serviceState ? "text-gray-400" : "text-gray-700"}`}>Package</span>
                                            </label>
                                        </div>
                                        {!formData.serviceState && <p className="text-xs text-gray-500 mt-1">Please select a state first</p>}
                                    </div>

                                    {formData.serviceType === "individual" ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-1">Service Category *</label>
                                                <Select
                                                    options={serviceCategories.map((category) => ({
                                                        value: category.CategoryID,
                                                        label: category.CategoryName,
                                                    }))}
                                                    value={formData.serviceCategory ? {
                                                        value: formData.serviceCategory,
                                                        label: serviceCategories.find((c) => parseInt(c.CategoryID) === parseInt(formData.serviceCategory))?.CategoryName || "Selected Category",
                                                    } : null}
                                                    onChange={(selected) => setFormData({ ...formData, serviceType: "individual", serviceCategory: selected ? selected.value : "" })}
                                                    placeholder="Search or select service category" isSearchable
                                                    isDisabled={!formData.serviceState}
                                                    className="react-select-container" classNamePrefix="react-select"
                                                    components={{ Option: CategoryOption }}
                                                />
                                                {errors.serviceCategory && <p className="text-xs text-red-500 mt-1">{errors.serviceCategory}</p>}
                                                {!formData.serviceState && <p className="text-xs text-gray-500 mt-1">Please select a state first</p>}
                                            </div>

                                            <div className="relative">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-sm font-medium text-gray-700 block">
                                                        Services (Hold Ctrl/Cmd to select multiple)
                                                    </label>
                                                </div>
                                                <select multiple name="selectedServices" value={formData.selectedServices}
                                                    onChange={handleServiceChange}
                                                    disabled={!formData.serviceState || !formData.serviceCategory}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] min-h-[120px] disabled:bg-gray-50 disabled:cursor-not-allowed">
                                                    {availableServices.map((service) => (
                                                        <option key={service.ServiceID} value={service.ServiceID}>{service.ServiceName}</option>
                                                    ))}
                                                </select>
                                                {errors.selectedServices && <p className="text-xs text-red-500 mt-1">{errors.selectedServices}</p>}
                                                {!formData.serviceCategory && <p className="text-xs text-gray-500 mt-1">Please select a service category first</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-sm font-medium text-gray-700 block">Package Name *</label>
                                                    <button type="button" onClick={() => { onClose(); navigate('/associate/explore-services'); }}
                                                        className="text-[#4b49ac] hover:text-[#3f3da0] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#4b49ac]/5 px-2.5 py-1.5 rounded-xl transition-all hover:bg-[#4b49ac]/10 group">
                                                        <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                        Explore Services
                                                    </button>
                                                </div>
                                                <select name="selectedPackage" value={formData.selectedPackage || ""} onChange={handleChange}
                                                    disabled={!formData.serviceState}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed">
                                                    <option value="">Select Package</option>
                                                    {availablePackages.map((pkg) => (
                                                        <option key={pkg.PackageID} value={pkg.PackageID}>{pkg.PackageName}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                                {errors.selectedPackage && <p className="text-xs text-red-500 mt-1">{errors.selectedPackage}</p>}
                                                {!formData.serviceState && <p className="text-xs text-gray-500 mt-1">Please select a state first</p>}
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">Billing Period</label>
                                                <div className="flex items-center gap-6">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="radio" name="billingPeriod" value="monthly"
                                                            checked={formData.billingPeriod === "monthly"} onChange={handleChange}
                                                            disabled={!formData.selectedPackage} className="w-4 h-4 text-[#4b49ac] focus:ring-[#4b49ac] disabled:opacity-50" />
                                                        <span className={`text-sm ${!formData.selectedPackage ? "text-gray-400" : "text-gray-700"}`}>Monthly</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="radio" name="billingPeriod" value="yearly"
                                                            checked={formData.billingPeriod === "yearly"} onChange={handleChange}
                                                            disabled={!formData.selectedPackage} className="w-4 h-4 text-[#4b49ac] focus:ring-[#4b49ac] disabled:opacity-50" />
                                                        <span className={`text-sm ${!formData.selectedPackage ? "text-gray-400" : "text-gray-700"}`}>Yearly</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between pt-4">
                                        <button onClick={handleBack} className="bg-gray-100 text-gray-700 px-8 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">Back</button>
                                        <button onClick={handleNext} className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors">Next</button>
                                    </div>
                                </motion.div>

                            ) : (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

                                    {/* Direct Contact Toggle */}
                                    <div className="bg-gray-50/50 p-4 rounded-[20px] flex items-center justify-between border border-gray-100 hover:shadow-md hover:border-indigo-100/50 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl transition-all duration-500 ${formData.communication ? 'bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-100 rotate-0' : 'bg-gray-200 text-gray-400 shadow-sm shadow-gray-100 -rotate-12'}`}>
                                                {formData.communication ? <Phone className="w-5 h-5 animate-pulse" /> : <PhoneOff className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="text-[15px] font-bold text-gray-900 tracking-tight">Direct Contact</h4>
                                                <p className="text-[12px] leading-relaxed text-gray-500 mt-0.5 font-medium">
                                                    {formData.communication ? 'Client can directly contact the organisation' : 'No direct contact between client and organisation'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3.5">
                                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${formData.communication ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {formData.communication ? 'Enabled' : 'Disabled'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, communication: !prev.communication }))}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500/20 ${formData.communication ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-500 ease-out ${formData.communication ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* â”€â”€ Customer Name with "If Existing" â”€â”€ */}
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm font-medium text-gray-700">Customer Name</label>
                                            {!selectedExistingCustomer && <IfExistingButton active={useExistingCustomer} onClick={toggleExistingCustomer} />}
                                        </div>

                                        {useExistingCustomer ? (
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomerDropdown(v => !v)}
                                                    className={`w-full px-4 py-2 bg-white border rounded-lg text-left flex items-center justify-between transition-all
                                                        ${selectedExistingCustomer
                                                            ? "border-[#4b49ac] ring-2 ring-[#4b49ac]/10"
                                                            : "border-gray-200 hover:border-[#4b49ac]/40"}`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Users className="w-4 h-4 text-[#4b49ac] flex-shrink-0" />
                                                        <span className={`text-sm truncate ${selectedExistingCustomer ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                                            {selectedExistingCustomer
                                                                ? (selectedExistingCustomer.CustomerName || selectedExistingCustomer.name || selectedExistingCustomer.Name ||
                                                                    ((selectedExistingCustomer.FirstName || selectedExistingCustomer.LastName) ? `${selectedExistingCustomer.FirstName || ''} ${selectedExistingCustomer.LastName || ''}`.trim() : ""))
                                                                : (isFetchingCustomers ? "Loading customers…" : selectedExistingCompany ? "Select customer for this company…" : "Select existing customer…")}
                                                        </span>
                                                    </div>
                                                    {isFetchingCustomers
                                                        ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
                                                        : <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${showCustomerDropdown ? "rotate-180" : ""}`} />}
                                                </button>

                                                <AnimatePresence>
                                                    {showCustomerDropdown && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-50 w-full mt-1 bg-white border border-indigo-100 rounded-2xl shadow-xl shadow-indigo-100/40 overflow-hidden"
                                                        >
                                                            {/* Search Bar */}
                                                            <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                                                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-[#4b49ac] focus-within:ring-2 focus-within:ring-[#4b49ac]/10 transition-all">
                                                                    <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                                    <input
                                                                        type="text"
                                                                        value={customerSearch}
                                                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                                                        placeholder="Search customer..."
                                                                        className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                                                                    />
                                                                    {customerSearch && (
                                                                        <button onClick={() => setCustomerSearch("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="max-h-56 overflow-y-auto">
                                                                {associateCustomersForCompany.filter(cust =>
                                                                    (cust.CustomerName || cust.name || cust.FirstName || cust.LastName || "").toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                                    (cust.Email || cust.email || "").toLowerCase().includes(customerSearch.toLowerCase())
                                                                ).length === 0 ? (
                                                                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                                                        <Users className="w-8 h-8 mb-1.5 opacity-30" />
                                                                        <p className="text-sm font-medium">No customers found</p>
                                                                    </div>
                                                                ) : (
                                                                    associateCustomersForCompany
                                                                        .filter(cust =>
                                                                            (cust.CustomerName || cust.name || cust.FirstName || cust.LastName || "").toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                                            (cust.Email || cust.email || "").toLowerCase().includes(customerSearch.toLowerCase())
                                                                        )
                                                                        .map((customer, idx) => (
                                                                            <motion.button
                                                                                key={customer.CustomerID || idx}
                                                                                type="button"
                                                                                initial={{ opacity: 0, x: -6 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: idx * 0.03 }}
                                                                                onClick={() => { handleSelectExistingCustomer(customer); setShowCustomerDropdown(false); setCustomerSearch(""); }}
                                                                                className="w-full px-4 py-3 text-left hover:bg-indigo-50/70 transition-colors border-b border-gray-50 last:border-0 group"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-xl bg-[#4b49ac]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4b49ac]/15 transition-colors">
                                                                                        <Users className="w-3.5 h-3.5 text-[#4b49ac]" />
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                                                                            {customer.CustomerName || customer.name ||
                                                                                                ((customer.FirstName || customer.LastName) ? `${customer.FirstName || ''} ${customer.LastName || ''}`.trim() : "")}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{customer.CustomerCode || customer.Email || ""}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.button>
                                                                        ))
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {selectedExistingCustomer && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-2 px-3 py-2 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="w-3.5 h-3.5 text-[#4b49ac]" />
                                                            <span className="text-xs text-[#4b49ac] font-semibold">Customer details autofilled</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedExistingCustomer(null);
                                                                setShowCustomerDropdown(true);
                                                            }}
                                                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            Change
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <input type="text" name="customerName" value={formData.customerName} onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                                placeholder="Enter customer name" />
                                        )}
                                        {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Mobile</label>
                                        <input type="text" name="mobile" value={formData.mobile} onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter mobile number" />
                                        {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter email address" />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">Country</label>
                                            <input type="text" name="country" value={formData.country} onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">Pincode</label>
                                            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                                placeholder="Enter pincode" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                                            <Select
                                                options={locationData.states.map((s) => ({ value: s.stateName, label: s.stateName }))}
                                                value={formData.state ? { value: formData.state, label: formData.state } : null}
                                                onChange={(selected) => setFormData({ ...formData, state: selected ? selected.value : "", district: "" })}
                                                placeholder="Search or select state" isSearchable
                                                className="react-select-container" classNamePrefix="react-select"
                                            />
                                            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">District</label>
                                            <Select
                                                options={availableDistricts.map((d) => ({ value: d.districtName, label: d.districtName }))}
                                                value={formData.district ? { value: formData.district, label: formData.district } : null}
                                                onChange={(selected) => setFormData({ ...formData, district: selected ? selected.value : "" })}
                                                placeholder="Search or select district" isSearchable isDisabled={!formData.state}
                                                className="react-select-container" classNamePrefix="react-select"
                                            />
                                            {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Preferred Language</label>
                                        <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none">
                                            <option value="">Select Language</option>
                                            <option value="Malayalam">Malayalam</option>
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Tamil">Tamil</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Closure Date (required)</label>
                                        <input type="date" name="closureDate" value={formData.closureDate} onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent" />
                                        {errors.closureDate && <p className="text-xs text-red-500 mt-1">{errors.closureDate}</p>}
                                    </div>

                                    {errors.api && <p className="text-sm text-red-500 text-center">{errors.api}</p>}

                                    <div className="flex justify-between pt-4">
                                        <button onClick={handleBack} className="bg-gray-100 text-gray-700 px-8 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">Back</button>
                                        <button onClick={handleSubmit} disabled={isSubmitting}
                                            className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors disabled:opacity-50 flex items-center gap-2">
                                            {isSubmitting ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" />{deal ? "Updating..." : "Submitting..."}</>
                                            ) : (deal ? "Update Deal" : "Create Deal")}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default AddDealModal;
