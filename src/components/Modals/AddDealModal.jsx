import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Loader2, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import locationData from "../../utils/statesAndDistricts.json";
import DealsApi from "../../api/DealsApi";
import { getSecureItem } from "../../utils/secureStorage";
import Select from "react-select";

const AddDealModal = ({ isOpen = true, onClose, onSuccess, deal, initialData }) => {
    const navigate = useNavigate();
    console.log("AddDealModal deal prop:", deal);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [errors, setErrors] = useState({});
    const [dealType, setDealType] = useState("Individual");

    console.log("AddDealModal isOpen:", isOpen);


    const [formData, setFormData] = useState({
        // Customer Details
        customerName: "",
        mobile: "",
        email: "",
        country: "India",
        pincode: "",
        state: "",
        district: "",
        preferredLanguage: "",
        // followupNote: "",
        closureDate: "",
        // Service Details
        serviceType: "individual", // "individual" or "package"
        serviceCategory: "",
        serviceState: "", // State where you need service
        selectedServices: [], // Array of selected service IDs
        selectedPackage: null, // Package ID for package selection
        billingPeriod: "monthly", // "monthly" or "yearly"
        // Company Details
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

    const [availableCompanyDistricts, setAvailableCompanyDistricts] = useState(
        [],
    );
    const [serviceCategories, setServiceCategories] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [availableStates, setAvailableStates] = useState([]); // States for service location
    const [servicePricing, setServicePricing] = useState([]); // Pricing data for selected services
    const [availablePackages, setAvailablePackages] = useState([]); // Available packages

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (formData.state) {
            const selectedState = locationData.states.find(
                (s) => s.stateName === formData.state,
            );
            setAvailableDistricts(selectedState ? selectedState.districts : []);
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.state]);

    useEffect(() => {
        if (formData.companyState) {
            const selectedState = locationData.states.find(
                (s) => s.stateName === formData.companyState,
            );
            setAvailableCompanyDistricts(
                selectedState ? selectedState.districts : [],
            );
        } else {
            setAvailableCompanyDistricts([]);
        }
    }, [formData.companyState]);

    // Fetch service categories on component mount
    useEffect(() => {
        const fetchServiceCategories = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/service-category?page=1&limit=100`,
                    {
                        headers: {
                            Authorization: `Bearer ${getSecureItem("partnerToken")}`,
                        },
                    },
                );
                const data = await response.json();
                if (data.success) {
                    setServiceCategories(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching service categories:", error);
            }
        };

        if (isOpen) {
            fetchServiceCategories();
        }
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
                        });
                        setDealType(d.dealType || "Individual");
                    }
                } catch (err) {
                    console.error("Error fetching full deal details", err);
                }
            } else if (!deal) {
                // Reset form for fresh create
                if (initialData && Object.keys(initialData).length > 0) {
                    console.log("Initializing modal with initialData:", initialData);

                    setFormData(prev => ({
                        ...prev,
                        serviceType: initialData.serviceType || "individual",
                        serviceCategory: initialData.serviceCategory || "",
                        serviceState: initialData.serviceState || "",
                        selectedServices: initialData.selectedServices || [],
                    }));
                    setDealType(initialData.serviceType === "package" ? "Package" : "Individual");
                    setStep(2); // Jump to service selection as data is pre-filled
                } else {
                    console.log("Initializing modal for fresh create (no initialData)");
                    setFormData({
                        customerName: "",
                        mobile: "",
                        email: "",
                        country: "India",
                        pincode: "",
                        state: "",
                        district: "",
                        preferredLanguage: "",
                        closureDate: "",
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
                    setDealType("Individual");
                    setStep(1);
                }
            }
        };

        fetchFullDealDetails();
    }, [isOpen, deal, initialData]);

    // Fetch services when service category changes
    useEffect(() => {
        const fetchServices = async () => {
            if (!formData.serviceCategory) {
                setAvailableServices([]);
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/service-categories/${formData.serviceCategory}?limit=100`,
                    {
                        headers: {
                            Authorization: `Bearer ${getSecureItem("partnerToken")}`,
                        },
                    },
                );
                const data = await response.json();
                if (data.success && data.data) {
                    setAvailableServices(data.data.Services || []);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                setAvailableServices([]);
            }
        };

        fetchServices();
    }, [formData.serviceCategory]);

    // Fetch states on component mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/states`);
                const data = await response.json();
                if (data.success) {
                    setAvailableStates(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        };

        if (isOpen) {
            fetchStates();
        }
    }, [isOpen]);

    // Fetch service pricing when state and services are selected
    useEffect(() => {
        const fetchServicePricing = async () => {
            if (
                !formData.serviceState ||
                !formData.selectedServices ||
                formData.selectedServices.length === 0
            ) {
                setServicePricing([]);
                return;
            }

            try {
                const selectedState = availableStates.find(
                    (s) => s.state_name === formData.serviceState,
                );
                if (!selectedState) {
                    console.log("State not found:", formData.serviceState);
                    return;
                }

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
                    },
                );

                const data = await response.json();
                if (data.success) {
                    console.log("Service pricing fetched:", data.data);
                    setServicePricing(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching service pricing:", error);
                setServicePricing([]);
            }
        };

        fetchServicePricing();
    }, [formData.serviceState, formData.selectedServices, availableStates]);

    // Fetch packages when service type is "package" and state is selected
    useEffect(() => {
        const fetchPackages = async () => {
            if (formData.serviceType !== "package" || !formData.serviceState) {
                setAvailablePackages([]);
                return;
            }

            try {
                const selectedState = availableStates.find(
                    (s) => s.state_name === formData.serviceState,
                );
                if (!selectedState) {
                    console.log("State not found for packages:", formData.serviceState);
                    return;
                }

                // Fetch packages - using the getPackage endpoint with filters
                const response = await fetch(
                    `${API_BASE_URL}/getPackage?isActive=1&limit=100`,
                    {
                        headers: {
                            Authorization: `Bearer ${getSecureItem("partnerToken")}`,
                        },
                    },
                );

                const data = await response.json();
                if (data.data) {
                    setAvailablePackages(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching packages:", error);
                setAvailablePackages([]);
            }
        };

        fetchPackages();
    }, [formData.serviceType, formData.serviceState, availableStates]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedData = { ...prev, [name]: value };

            // 👇 If serviceType changes, also update dealType
            if (name === "serviceType") {
                updatedData.dealType =
                    value === "individual" ? "Individual" : "Package";
            }

            return updatedData;
        });




        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleServiceChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
            parseInt(option.value),
        );
        setFormData((prev) => ({ ...prev, selectedServices: selectedOptions }));
        if (errors.selectedServices) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.selectedServices;
                return newErrors;
            });
        }
    };




    const validateStep1 = () => {
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

    const validateStep2 = () => {
        const newErrors = {};

        // Service validation
        if (!formData.serviceState) newErrors.serviceState = "Required";

        if (formData.serviceType === "individual") {
            if (!formData.serviceCategory) newErrors.serviceCategory = "Required";
            if (
                !formData.selectedServices ||
                formData.selectedServices.length === 0
            ) {
                newErrors.selectedServices = "Please select at least one service";
            }
        } else if (formData.serviceType === "package") {
            if (!formData.selectedPackage) newErrors.selectedPackage = "Required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.companyName.trim()) newErrors.companyName = "Required";
        if (!formData.companyState) newErrors.companyState = "Required";
        if (!formData.companyDistrict) newErrors.companyDistrict = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step === 3) {
            setStep(2);
        } else if (step === 2) {
            setStep(1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep3()) return;

        setIsSubmitting(true);
        try {
            const user = getSecureItem("partnerUser") || {};
            const selectedState = availableStates.find(
                (s) => s.state_name === formData.serviceState,
            );

            const selectedCategory = serviceCategories.find(c => c.CategoryID === parseInt(formData.serviceCategory));

            let servicesPayload = [];

            // Build services payload based on service type
            if (formData.serviceType === "individual") {
                servicesPayload = formData.selectedServices.map((serviceId) => {
                    const service = availableServices.find(
                        (s) => s.ServiceID === serviceId,
                    );
                    const pricing = servicePricing.find((p) => p.ServiceID === serviceId);

                    return {
                        serviceId: serviceId,
                        serviceName: service?.ServiceName || pricing?.ServiceName || "",
                        serviceCategoryId: formData.serviceCategory,
                        serviceCategory: selectedCategory?.Name || "",
                        professionalFee: pricing?.ProfessionalFee || 0,
                        vendorFee: pricing?.VendorFee || 0,
                        contractorFee: pricing?.ContractFee || 0,
                        govtFee: pricing?.GovernmentFee || 0,
                        total: pricing?.TotalFee || pricing?.Total || 0,
                        dealType: "Individual",
                    };
                });
            } else if (formData.serviceType === "package") {
                const selectedPackage = availablePackages.find(
                    (pkg) => pkg.PackageID === parseInt(formData.selectedPackage),
                );

                if (selectedPackage) {
                    if (selectedPackage.services && selectedPackage.services.length > 0) {
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
            }

            if (deal && deal.id) {
                // UPDATE FLOW
                const payload = {
                    id: deal.id,
                    name: formData.customerName,
                    mobile: formData.mobile,
                    email: formData.email,
                    state: formData.state,
                    franchiseId: user.FranchiseeID || 1,
                    employeeId: user.EmployeeID || 9,
                    converted_at: deal.converted_at || new Date().toISOString(),
                    CompanyID: deal.CompanyID,
                    CustomerID: deal.CustomerID,
                    ClosureDate: formData.closureDate,
                    serviceCategoryId: formData.serviceCategory,
                    serviceCategory: selectedCategory?.Name || "",
                    quoteCRE: deal.quoteCRE || 9, // Fallback if missing
                    sourceOfSale: deal.sourceOfSale || "Direct",
                    dealType: formData.serviceType === "individual" ? "Individual" : "Package",
                    isIndividual: formData.serviceType === "individual" ? 1 : 0,
                    services: servicesPayload,
                    packageName: formData.serviceType === "package" ? servicesPayload[0]?.packageName : null,
                    packageId: formData.serviceType === "package" ? servicesPayload[0]?.packageId : null,
                    billingPeriod: formData.billingPeriod,
                    StateService: formData.serviceState,
                    AssociateID: user.id || null,
                };
                const response = await DealsApi.updateDeal(payload);
                if (response.success) {
                    onSuccess && onSuccess();
                    onClose();
                } else {
                    setErrors({ api: response.message || "Failed to update deal" });
                }
            } else {
                // CREATE FLOW
                const payload = {
                    leadId: null,
                    customer: {
                        name: formData.customerName,
                        mobile: formData.mobile,
                        email: formData.email,
                        country: formData.country,
                        pincode: formData.pincode,
                        state: formData.state,
                        district: formData.district,
                        preferredLanguage: formData.preferredLanguage,
                        closureDate: formData.closureDate,
                        isAssociate: true,
                        services: servicesPayload.map(s => ({ ...s, ServiceID: s.serviceId, ServiceName: s.serviceName, CategoryID: s.serviceCategoryId, CategoryName: s.serviceCategory, TotalFee: s.total, ProfessionalFee: s.professionalFee, VendorFee: s.vendorFee, GovernmentFee: s.govtFee, ContractFee: s.contractorFee })),
                    },
                    company: {
                        name: formData.companyName,
                        gst: formData.companyGST,
                        mobile: formData.companyMobile,
                        email: formData.companyEmail,
                        country: formData.companyCountry,
                        state: formData.companyState,
                        district: formData.companyDistrict,
                        preferredLanguage: formData.companyPreferredLanguage,
                        isAssociate: true,
                    },
                    dealType: formData.serviceType === "individual" ? "Individual" : "Package",
                    isIndividual: formData.serviceType === "individual" ? 1 : 0,
                    serviceType: formData.serviceType,
                    franchiseeId: user.FranchiseeID || 1,
                    employeeId: user.EmployeeID || 9,
                    isAssociate: true,
                    AssociateID: user.id || null,
                };

                const response = await DealsApi.convertToDeal(payload);
                if (response.success) {
                    onSuccess && onSuccess();
                    onClose();
                } else {
                    setErrors({ api: response.message || "Failed to create deal" });
                }
            }
        } catch (error) {
            setErrors({ api: error.response?.data?.message || "An error occurred" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
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
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {/* Customer Details Fields */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter customer name"
                                    />
                                    {errors.customerName && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.customerName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Mobile
                                    </label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter mobile number"
                                    />
                                    {errors.mobile && (
                                        <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter pincode"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* State */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">
                                            State
                                        </label>

                                        <Select
                                            options={locationData.states.map((s) => ({
                                                value: s.stateName,
                                                label: s.stateName,
                                            }))}
                                            value={
                                                formData.state
                                                    ? { value: formData.state, label: formData.state }
                                                    : null
                                            }
                                            onChange={(selected) => {
                                                setFormData({
                                                    ...formData,
                                                    state: selected ? selected.value : "",
                                                    district: "",
                                                });
                                            }}
                                            placeholder="Search or select state"
                                            isSearchable
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />

                                        {errors.state && (
                                            <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                                        )}
                                    </div>

                                    {/* District */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">
                                            District
                                        </label>

                                        <Select
                                            options={availableDistricts.map((d) => ({
                                                value: d.districtName,
                                                label: d.districtName,
                                            }))}
                                            value={
                                                formData.district
                                                    ? { value: formData.district, label: formData.district }
                                                    : null
                                            }
                                            onChange={(selected) => {
                                                setFormData({
                                                    ...formData,
                                                    district: selected ? selected.value : "",
                                                });
                                            }}
                                            placeholder="Search or select district"
                                            isSearchable
                                            isDisabled={!formData.state}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />

                                        {errors.district && (
                                            <p className="text-xs text-red-500 mt-1">{errors.district}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Preferred Language
                                    </label>
                                    <select
                                        name="preferredLanguage"
                                        value={formData.preferredLanguage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                    >
                                        <option value="">Select Language</option>
                                        <option value="Malayalam">Malayalam</option>
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Tamil">Tamil</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                </div>

                                {/* <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Follow-up Note
                                    </label>
                                    <textarea
                                        name="followupNote"
                                        value={formData.followupNote}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent min-h-[100px]"
                                        placeholder="Add note..."
                                    />
                                </div> */}

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Closure Date (required)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="closureDate"
                                            value={formData.closureDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        />
                                    </div>
                                    {errors.closureDate && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.closureDate}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleNext}
                                        className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Service Selection Fields */}
                                {/* State where you need Service - MOVED BEFORE Service Category */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        State where you need Service *
                                    </label>

                                    <Select
                                        options={availableStates.map((state) => ({
                                            value: state.state_name,
                                            label: state.state_name,
                                        }))}
                                        value={
                                            formData.serviceState
                                                ? { value: formData.serviceState, label: formData.serviceState }
                                                : null
                                        }
                                        onChange={(selected) =>
                                            setFormData({
                                                ...formData,
                                                serviceState: selected ? selected.value : "",
                                            })
                                        }
                                        placeholder="Search or select state"
                                        isSearchable
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />

                                    {errors.serviceState && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.serviceState}
                                        </p>
                                    )}
                                </div>

                                {/* Service Type Selection - Individual or Package */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
                                        Individual / Package Service
                                    </label>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="serviceType"
                                                value="individual"
                                                checked={formData.serviceType === "individual"}
                                                onChange={handleChange}
                                                disabled={!formData.serviceState}
                                                className="w-4 h-4 text-[#4b49ac] focus:ring-[#4b49ac] disabled:opacity-50"
                                            />
                                            <span
                                                className={`text-sm ${!formData.serviceState ? "text-gray-400" : "text-gray-700"}`}
                                            >
                                                Individual Service
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="serviceType"
                                                value="package"
                                                checked={formData.serviceType === "package"}
                                                onChange={handleChange}
                                                disabled={!formData.serviceState}
                                                className="w-4 h-4 text-[#4b49ac] focus:ring-[#4b49ac] disabled:opacity-50"
                                            />
                                            <span
                                                className={`text-sm ${!formData.serviceState ? "text-gray-400" : "text-gray-700"}`}
                                            >
                                                Package
                                            </span>
                                        </label>
                                    </div>
                                    {!formData.serviceState && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Please select a state first
                                        </p>
                                    )}
                                </div>

                                {/* Conditional rendering based on service type */}
                                {formData.serviceType === "individual" ? (
                                    <>
                                        {/* Service Category - Only for Individual Services */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                                Service Category *
                                            </label>

                                            <Select
                                                options={serviceCategories.map((category) => ({
                                                    value: category.CategoryID,
                                                    label: category.CategoryName,
                                                }))}
                                                value={
                                                    formData.serviceCategory
                                                        ? {
                                                            value: formData.serviceCategory,
                                                            label:
                                                                serviceCategories.find(
                                                                    (c) => parseInt(c.CategoryID) === parseInt(formData.serviceCategory)
                                                                )?.CategoryName || "Selected Category",
                                                        }
                                                        : null
                                                }
                                                onChange={(selected) =>
                                                    setFormData({
                                                        ...formData,
                                                        serviceType: "individual", // Ensure individual is selected
                                                        serviceCategory: selected ? selected.value : "",
                                                    })
                                                }
                                                placeholder="Search or select service category"
                                                isSearchable
                                                isDisabled={!formData.serviceState}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />

                                            {errors.serviceCategory && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.serviceCategory}
                                                </p>
                                            )}

                                            {!formData.serviceState && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Please select a state first
                                                </p>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-sm font-medium text-gray-700 block">
                                                    Services (Hold Ctrl/Cmd to select multiple)
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onClose();
                                                        navigate('/associate/explore-services');
                                                    }}
                                                    className="text-[#4b49ac] hover:text-[#3f3da0] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#4b49ac]/5 px-2.5 py-1.5 rounded-xl transition-all hover:bg-[#4b49ac]/10 group"
                                                >
                                                    <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                    Explore Services
                                                </button>
                                            </div>
                                            <select
                                                multiple
                                                name="selectedServices"
                                                value={formData.selectedServices}
                                                onChange={handleServiceChange}
                                                disabled={
                                                    !formData.serviceState || !formData.serviceCategory
                                                }
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] min-h-[120px] disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            >
                                                {availableServices.map((service) => (
                                                    <option
                                                        key={service.ServiceID}
                                                        value={service.ServiceID}
                                                    >
                                                        {service.ServiceName}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.selectedServices && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.selectedServices}
                                                </p>
                                            )}
                                            {!formData.serviceCategory && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Please select a service category first
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-sm font-medium text-gray-700 block">
                                                    Package Name *
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onClose();
                                                        navigate('/associate/explore-services');
                                                    }}
                                                    className="text-[#4b49ac] hover:text-[#3f3da0] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#4b49ac]/5 px-2.5 py-1.5 rounded-xl transition-all hover:bg-[#4b49ac]/10 group"
                                                >
                                                    <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                    Explore Services
                                                </button>
                                            </div>
                                            <select
                                                name="selectedPackage"
                                                value={formData.selectedPackage || ""}
                                                onChange={handleChange}
                                                disabled={!formData.serviceState}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Select Package</option>
                                                {availablePackages.map((pkg) => (
                                                    <option key={pkg.PackageID} value={pkg.PackageID}>
                                                        {pkg.PackageName}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                            {errors.selectedPackage && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.selectedPackage}
                                                </p>
                                            )}
                                            {!formData.serviceState && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Please select a state first
                                                </p>
                                            )}
                                        </div>

                                        {/* Billing Period */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                                Billing Period
                                            </label>
                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="billingPeriod"
                                                        value="monthly"
                                                        checked={formData.billingPeriod === "monthly"}
                                                        onChange={handleChange}
                                                        disabled={!formData.selectedPackage}
                                                        className="w-4 h-4 text-[#4b49ac] focus:ring-[#4b49ac] disabled:opacity-50"
                                                    />
                                                    <span
                                                        className={`text-sm ${!formData.selectedPackage ? "text-gray-400" : "text-gray-700"}`}
                                                    >
                                                        Monthly
                                                    </span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="billingPeriod"
                                                        value="yearly"
                                                        checked={formData.billingPeriod === "yearly"}
                                                        onChange={handleChange}
                                                        disabled={!formData.selectedPackage}
                                                        className="w-4 h-4 text-[#4b49ac] focus:ring-[#4b49ac] disabled:opacity-50"
                                                    />
                                                    <span
                                                        className={`text-sm ${!formData.selectedPackage ? "text-gray-400" : "text-gray-700"}`}
                                                    >
                                                        Yearly
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={handleBack}
                                        className="bg-gray-100 text-gray-700 px-8 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Company Details Fields */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Company GST
                                    </label>
                                    <input
                                        type="text"
                                        name="companyGST"
                                        value={formData.companyGST}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter GST number"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">
                                            Company Mobile
                                        </label>
                                        <input
                                            type="text"
                                            name="companyMobile"
                                            value={formData.companyMobile}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter mobile number"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">
                                            Company Email
                                        </label>
                                        <input
                                            type="email"
                                            name="companyEmail"
                                            value={formData.companyEmail}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Company Country
                                    </label>
                                    <input
                                        type="text"
                                        name="companyCountry"
                                        value={formData.companyCountry}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                    />
                                </div>



                                {/* Company State */}
                                <div className="grid grid-cols-2 gap-4">

                                    {/* Company State */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">
                                            State
                                        </label>

                                        <Select
                                            options={locationData.states.map((s) => ({
                                                value: s.stateName,
                                                label: s.stateName,
                                            }))}
                                            value={
                                                formData.companyState
                                                    ? { value: formData.companyState, label: formData.companyState }
                                                    : null
                                            }
                                            onChange={(selected) =>
                                                setFormData({
                                                    ...formData,
                                                    companyState: selected ? selected.value : "",
                                                    companyDistrict: "", // reset district when state changes
                                                })
                                            }
                                            placeholder="Search or select state"
                                            isSearchable
                                        />

                                        {errors.companyState && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.companyState}
                                            </p>
                                        )}
                                    </div>

                                    {/* Company District */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">
                                            District
                                        </label>

                                        <Select
                                            options={availableCompanyDistricts.map((d) => ({
                                                value: d.districtName,
                                                label: d.districtName,
                                            }))}
                                            value={
                                                formData.companyDistrict
                                                    ? { value: formData.companyDistrict, label: formData.companyDistrict }
                                                    : null
                                            }
                                            onChange={(selected) =>
                                                setFormData({
                                                    ...formData,
                                                    companyDistrict: selected ? selected.value : "",
                                                })
                                            }
                                            placeholder="Search or select district"
                                            isSearchable
                                            isDisabled={!formData.companyState}

                                        />

                                        {errors.companyDistrict && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.companyDistrict}
                                            </p>
                                        )}
                                    </div>


                                </div>






                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                        Company Preferred Language
                                    </label>
                                    <select
                                        name="companyPreferredLanguage"
                                        value={formData.companyPreferredLanguage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                    >
                                        <option value="">Select Language</option>
                                        <option value="Malayalam">Malayalam</option>
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Tamil">Tamil</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                </div>

                                {errors.api && (
                                    <p className="text-sm text-red-500 text-center">
                                        {errors.api}
                                    </p>
                                )}

                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={handleBack}
                                        className="bg-gray-100 text-gray-700 px-8 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {deal ? "Updating..." : "Submitting..."}
                                            </>
                                        ) : (
                                            deal ? "Update Deal" : "Create Deal"
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AddDealModal;
