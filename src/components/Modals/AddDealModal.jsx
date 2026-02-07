import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Loader2, Calendar } from "lucide-react";
import locationData from "../../utils/statesAndDistricts.json";
import DealsApi from "../../api/DealsApi";
import { getSecureItem } from "../../utils/secureStorage";

const AddDealModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [errors, setErrors] = useState({});

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
        followupNote: "",
        closureDate: "",
        // Service Details
        serviceCategory: "",
        serviceState: "", // State where you need service
        selectedServices: [], // Array of selected service IDs
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


    console.log({formData});
    

    const [availableCompanyDistricts, setAvailableCompanyDistricts] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [availableStates, setAvailableStates] = useState([]); // States for service location
    const [servicePricing, setServicePricing] = useState([]); // Pricing data for selected services

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (formData.state) {
            const selectedState = locationData.states.find(
                (s) => s.stateName === formData.state
            );
            setAvailableDistricts(selectedState ? selectedState.districts : []);
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.state]);

    useEffect(() => {
        if (formData.companyState) {
            const selectedState = locationData.states.find(
                (s) => s.stateName === formData.companyState
            );
            setAvailableCompanyDistricts(selectedState ? selectedState.districts : []);
        } else {
            setAvailableCompanyDistricts([]);
        }
    }, [formData.companyState]);

    // Fetch service categories on component mount
    useEffect(() => {
        const fetchServiceCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/service-category?page=1&limit=100`, {
                    headers: {
                        'Authorization': `Bearer ${getSecureItem('partnerToken')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setServiceCategories(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching service categories:', error);
            }
        };

        if (isOpen) {
            fetchServiceCategories();
        }
    }, [isOpen]);

    // Fetch services when service category changes
    useEffect(() => {
        const fetchServices = async () => {
            if (!formData.serviceCategory) {
                setAvailableServices([]);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/service-categories/${formData.serviceCategory}?limit=100`, {
                    headers: {
                        'Authorization': `Bearer ${getSecureItem('partnerToken')}`
                    }
                });
                const data = await response.json();
                if (data.success && data.data) {
                    setAvailableServices(data.data.Services || []);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
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
                console.error('Error fetching states:', error);
            }
        };

        if (isOpen) {
            fetchStates();
        }
    }, [isOpen]);

    // Fetch service pricing when state and services are selected
    useEffect(() => {
        const fetchServicePricing = async () => {
            if (!formData.serviceState || !formData.selectedServices || formData.selectedServices.length === 0) {
                setServicePricing([]);
                return;
            }

            try {
                const selectedState = availableStates.find(s => s.state_name === formData.serviceState);
                if (!selectedState) {
                    console.log('State not found:', formData.serviceState);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/service-price-currency?StateName=Kerala&ServiceID=256`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getSecureItem('partnerToken')}`
                    },
                    body: JSON.stringify({
                        StateID: selectedState.ID,
                        ServiceIDs: formData.selectedServices,
                        isIndividual: 1,
                        packageId: null,
                        yearly: 0
                    })
                });

                const data = await response.json();
                if (data.success) {
                    console.log('Service pricing fetched:', data.data);
                    setServicePricing(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching service pricing:', error);
                setServicePricing([]);
            }
        };

        fetchServicePricing();
    }, [formData.serviceState, formData.selectedServices, availableStates]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleServiceChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
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
        if (!formData.companyName.trim()) newErrors.companyName = "Required";
        if (!formData.companyState) newErrors.companyState = "Required";
        if (!formData.companyDistrict) newErrors.companyDistrict = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setIsSubmitting(true);
        try {
            const user = getSecureItem("partnerUser") || {};

            // Map selected services with their pricing details
            const servicesPayload = formData.selectedServices.map(serviceId => {
                const service = availableServices.find(s => s.ServiceID === serviceId);
                const pricing = servicePricing.find(p => p.ServiceID === serviceId);

                // Find the selected state ID
                const selectedState = availableStates.find(s => s.state_name === formData.serviceState);

                return {
                    ServiceID: serviceId,
                    ServiceName: service?.ServiceName || pricing?.ServiceName || '',
                    CategoryID: formData.serviceCategory,
                    StateID: selectedState?.ID || null,
                    StateName: formData.serviceState || null,
                    ProfessionalFee: pricing?.ProfessionalFee || 0,
                    VendorFee: pricing?.VendorFee || 0,
                    ContractFee: pricing?.ContractFee || 0,
                    GovernmentFee: pricing?.GovernmentFee || 0,
                    TotalFee: pricing?.TotalFee || pricing?.Total || 0
                };
            });

            const payload = {
                leadId: 10, // Since it's a new deal creation not from a lead, we might need a dummy or the backend should handle it
                customer: {
                    name: formData.customerName,
                    mobile: formData.mobile,
                    email: formData.email,
                    country: formData.country,
                    pincode: formData.pincode,
                    state: formData.state,
                    district: formData.district,
                    preferredLanguage: formData.preferredLanguage,
                    followupNote: formData.followupNote,
                    closureDate: formData.closureDate,
                    isAssociate: true
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
                    isAssociate: true
                },
                services: servicesPayload, // Add services to payload
                franchiseeId: user.FranchiseeID || 1,
                employeeId: user.EmployeeID || 9,
                isAssociate: true,
                AssociateID: user.id || null
            };


            console.log("payload", payload);


            const response = await DealsApi.convertToDeal(payload);
            if (response.success) {
                onSuccess && onSuccess();
                onClose();
            } else {
                setErrors({ api: response.message || "Failed to create deal" });
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
                        {/* <h2 className="text-xl font-bold text-gray-900">
                            This lead is qualified. You must create a Deal to proceed.
                        </h2> */}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Customer Name</label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter customer name"
                                    />
                                    {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Mobile</label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter mobile number"
                                    />
                                    {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Pincode</label>
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
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                        >
                                            <option value="">Select State</option>
                                            {locationData.states.map((s) => (
                                                <option key={s.stateId} value={s.stateName}>{s.stateName}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                    </div>
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">District</label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            disabled={!formData.state}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none disabled:bg-gray-50"
                                        >
                                            <option value="">Select District</option>
                                            {availableDistricts.map((d) => (
                                                <option key={d.districtId} value={d.districtName}>{d.districtName}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                        {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Preferred Language</label>
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

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Follow-up Note</label>
                                    <textarea
                                        name="followupNote"
                                        value={formData.followupNote}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent min-h-[100px]"
                                        placeholder="Add note..."
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Closure Date (required)</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="closureDate"
                                            value={formData.closureDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                        />
                                    </div>
                                    {errors.closureDate && <p className="text-xs text-red-500 mt-1">{errors.closureDate}</p>}
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Service Category</label>
                                    <select
                                        name="serviceCategory"
                                        value={formData.serviceCategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                    >
                                        <option value="">Select Service Category</option>
                                        {serviceCategories.map((category) => (
                                            <option key={category.CategoryID} value={category.CategoryID}>
                                                {category.CategoryName}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                    {errors.serviceCategory && <p className="text-xs text-red-500 mt-1">{errors.serviceCategory}</p>}
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">State where you need Service *</label>
                                    <select
                                        name="serviceState"
                                        value={formData.serviceState}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                    >
                                        <option value="">Select State</option>
                                        {availableStates.map((state) => (
                                            <option key={state.ID} value={state.state_name}>
                                                {state.state_name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                    {errors.serviceState && <p className="text-xs text-red-500 mt-1">{errors.serviceState}</p>}
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Services (Hold Ctrl/Cmd to select multiple)</label>
                                    <select
                                        multiple
                                        name="selectedServices"
                                        value={formData.selectedServices}
                                        onChange={handleServiceChange}
                                        disabled={!formData.serviceCategory}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] min-h-[120px] disabled:bg-gray-50"
                                    >
                                        {availableServices.map((service) => (
                                            <option key={service.ServiceID} value={service.ServiceID}>
                                                {service.ServiceName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.selectedServices && <p className="text-xs text-red-500 mt-1">{errors.selectedServices}</p>}
                                    {!formData.serviceCategory && <p className="text-xs text-gray-500 mt-1">Please select a service category first</p>}
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
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Company Details Fields */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Name</label>
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
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Company GST</label>
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
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Company Mobile</label>
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
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Company Email</label>
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
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Country</label>
                                    <input
                                        type="text"
                                        name="companyCountry"
                                        value={formData.companyCountry}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                                        <select
                                            name="companyState"
                                            value={formData.companyState}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none"
                                        >
                                            <option value="">Select State</option>
                                            {locationData.states.map((s) => (
                                                <option key={s.stateId} value={s.stateName}>{s.stateName}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                        {errors.companyState && <p className="text-xs text-red-500 mt-1">{errors.companyState}</p>}
                                    </div>
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 block mb-1">District</label>
                                        <select
                                            name="companyDistrict"
                                            value={formData.companyDistrict}
                                            onChange={handleChange}
                                            disabled={!formData.companyState}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] appearance-none disabled:bg-gray-50"
                                        >
                                            <option value="">Select District</option>
                                            {availableCompanyDistricts.map((d) => (
                                                <option key={d.districtId} value={d.districtName}>{d.districtName}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
                                        {errors.companyDistrict && <p className="text-xs text-red-500 mt-1">{errors.companyDistrict}</p>}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Preferred Language</label>
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

                                {errors.api && <p className="text-sm text-red-500 text-center">{errors.api}</p>}

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
                                        className="bg-[#4b49ac] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#3f3da0] transition-colors flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Convert
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
