import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import locationData from "../../utils/statesAndDistricts.json";
import AssociateApi from "../../api/AssociateApi";
import { getSecureItem, setSecureItem } from "../../utils/secureStorage";
import { useNavigate } from "react-router-dom";
import Select from "react-select";


const PartnerSignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        associateName: "",
        mobile: "",
        email: "",
        state: "",
        district: "",
        language: "",
        address: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        country: "",
        profession: "",
    });
    const [step, setStep] = useState(1);
    const [kycFiles, setKycFiles] = useState({
        pan: null,
        aadhaar: null,
        gst: null,
    });
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiSuccess, setApiSuccess] = useState(false);
    const [createdAssociateId, setCreatedAssociateId] = useState(null);
    const [otpValues, setOtpValues] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(30);
    const [isVerifying, setIsVerifying] = useState(false);

    // Timer countdown for OTP
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.associateName.trim()) newErrors.associateName = "Associate name is required";
        if (!formData.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
            newErrors.mobile = "Please enter a valid 10-digit mobile number";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!formData.profession) newErrors.profession = "Profession is required";
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.district) newErrors.district = "District is required";
        if (!formData.language) newErrors.language = "Preferred language is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    useEffect(() => {
        if (formData.state) {
            const selectedState = locationData.states.find(
                (s) => s.stateName === formData.state
            );
            setAvailableDistricts(selectedState ? selectedState.districts : []);
            setFormData((prev) => ({ ...prev, district: "" })); // Reset district when state changes
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name] || errors.api) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                delete updated.api;
                return updated;
            });
        }
    };


    const handleFileChange = (type, e) => {
        const file = e.target.files[0];
        if (file) {
            setKycFiles((prev) => ({ ...prev, [type]: file }));
        }
    };

    const handleUploadClick = (id) => {
        document.getElementById(id).click();
    };

    const handleNextStep = async (e) => {
        e.preventDefault();

        if (!validateStep1()) return;

        setIsSubmitting(true);

        try {
            const userObj = getSecureItem("partnerUser") || {};

            // ✅ Combine address fields into ONE string
            const fullAddress = [
                formData.addressLine1,
                formData.addressLine2,
                formData.postalCode,
                formData.country,
            ]
                .filter(Boolean)
                .join(", ");

            const payload = {
                AssociateName: formData.associateName,
                Mobile: formData.mobile,
                Email: formData.email,
                Address: fullAddress, // ✅ single combined string
                State: formData.state,
                District: formData.district,
                PreferredLanguage: formData.language,
                CreatedBy: userObj.EmployeeID || null,
                EmployeeID: userObj.EmployeeID || null,
                FranchiseeID: userObj.FranchiseeID || null,
                Profession: formData.profession,
            };

            const response = await AssociateApi.createAssociate(payload);

            if (response.success) {
                setCreatedAssociateId(response.data.AssociateID);

                // Request OTP after associate creation
                try {
                    await AssociateApi.requestAssociateEmailOtp(formData.email);
                    setStep(2);
                    setTimer(30);
                    setOtpValues(["", "", "", ""]);
                } catch (otpErr) {
                    console.error("OTP request error during signup:", otpErr);
                    setErrors((prev) => ({
                        ...prev,
                        api: "Associate created but failed to send OTP. Please try login or contact support.",
                    }));
                }
            } else {
                setErrors((prev) => ({
                    ...prev,
                    api: response.message || "Failed to create associate",
                }));
            }
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                api:
                    error.response?.data?.message ||
                    "An error occurred while creating associate",
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackStep = () => {
        if (step === 2) setStep(1);
        else if (step === 3) setStep(2);
    };

    const handleOtpChange = async (index, value) => {
        if (value.length <= 1) {
            const newOtpValues = [...otpValues];
            newOtpValues[index] = value;
            setOtpValues(newOtpValues);

            // Auto focus next input
            if (value && index < 3) {
                const nextInput = document.getElementById(`signup-otp-${index + 1}`);
                nextInput?.focus();
            }

            // If all OTP fields are filled, verify OTP
            if (index === 3 && value && newOtpValues.every((v) => v.length === 1)) {
                setIsVerifying(true);
                setErrors({});
                try {
                    const otp = newOtpValues.join("");
                    const response = await AssociateApi.verifyAssociateEmailOtp(formData.email, otp);

                    if (response.success) {
                        // Store token and user
                        if (response.token && response.user) {
                            localStorage.setItem('partnerToken', response.token);
                            localStorage.setItem('EmployeeID', response.user.EmployeeID);
                            localStorage.setItem('FranchiseeID', response.user.FranchiseeID);
                            localStorage.setItem('AssociateID', response.user.id);
                            setSecureItem("partnerUser", response.user);
                        }
                        setStep(3); // Move to KYC
                    } else {
                        setErrors({ otp: response.message || "Invalid OTP" });
                    }
                } catch (err) {
                    setErrors({ otp: err.response?.data?.message || "OTP verification failed" });
                } finally {
                    setIsVerifying(false);
                }
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`signup-otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (timer === 0) {
            setIsSubmitting(true);
            try {
                await AssociateApi.requestAssociateEmailOtp(formData.email);
                setTimer(30);
                setOtpValues(["", "", "", ""]);
                setErrors({});
            } catch (err) {
                setErrors({ api: "Failed to resend OTP" });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleFinalSubmit = async () => {
        if (!createdAssociateId) {
            alert("Associate ID not found. Please complete the first step again.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('associateId', createdAssociateId);

            if (kycFiles.pan) formData.append('pan', kycFiles.pan);
            if (kycFiles.aadhaar) formData.append('aadhaar', kycFiles.aadhaar);
            if (kycFiles.gst) formData.append('gst', kycFiles.gst);

            // Only upload if there are files
            if (kycFiles.pan || kycFiles.aadhaar || kycFiles.gst) {
                // Log FormData entries for debugging
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ', ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
                }

                await AssociateApi.uploadAssociateDocuments(formData);
            }

            setApiSuccess(true);
            setTimeout(() => {
                onClose();
                // Redirect to associate dashboard
                navigate("/associate/dashboard");

                // Reset state
                setStep(1);
                setApiSuccess(false);
                setFormData({
                    associateName: "",
                    mobile: "",
                    email: "",
                    businessType: "",
                    state: "",
                    district: "",
                    language: "",
                    address: "",
                    addressLine1: "",
                    addressLine2: "",
                    postalCode: "",
                    country: "",
                    profession: "",
                });
                setKycFiles({
                    pan: null,
                    aadhaar: null,
                    gst: null,
                });
            }, 2000);
        } catch (error) {
            console.error("KYC upload error:", error);
            alert(error.response?.data?.message || "An error occurred during KYC upload");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        handleFinalSubmit();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-[#1e293b]">Add New Associate</h2>
                    <button
                        onClick={onClose}
                        lassName="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>


                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="form-step"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-8"
                        >
                            <form onSubmit={handleNextStep} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {errors.api && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="md:col-span-2 bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        <p className="text-sm font-medium text-red-800">{errors.api}</p>
                                    </motion.div>
                                )}
                                {/* Associate Name */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        <span className="text-red-500 mr-1">*</span> Associate Name
                                    </label>
                                    <input
                                        type="text"
                                        name="associateName"
                                        value={formData.associateName}
                                        onChange={handleChange}
                                        placeholder="Enter name"
                                        className={`w-full px-4 py-3 rounded-2xl border ${errors.associateName ? 'border-red-400 focus:ring-red-100' : 'border-yellow-400 focus:ring-yellow-100'} focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300`}
                                    />
                                    {errors.associateName && <span className="text-xs text-red-500 ml-2">{errors.associateName}</span>}
                                </div>

                                {/* Mobile */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        <span className="text-red-500 mr-1">*</span> Mobile
                                    </label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="Enter mobile number"
                                        className={`w-full px-4 py-3 rounded-2xl border ${errors.mobile ? 'border-red-400 focus:ring-red-100' : 'border-yellow-400 focus:ring-yellow-100'} focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300`}
                                    />
                                    {errors.mobile && <span className="text-xs text-red-500 ml-2">{errors.mobile}</span>}
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        <span className="text-red-500 mr-1">*</span> Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                        className={`w-full px-4 py-3 rounded-2xl border ${errors.email ? 'border-red-400 focus:ring-red-100' : 'border-yellow-400 focus:ring-yellow-100'} focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300`}
                                    />
                                    {errors.email && <span className="text-xs text-red-500 ml-2">{errors.email}</span>}
                                </div>

                                {/* Profession */}
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-sm font-semibold text-gray-700">
                                        <span className="text-red-500 mr-1">*</span> Select Profession
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="profession"
                                            value={formData.profession || ""}
                                            onChange={handleChange}
                                            className={`w-full appearance-none px-4 py-3 rounded-2xl border ${errors.profession ? 'border-red-400 focus:ring-red-100' : 'border-yellow-400 focus:ring-yellow-100'} focus:outline-none focus:ring-2 transition-all text-gray-600 bg-white`}
                                        >
                                            <option value="" disabled>Select profession...</option>
                                            <option value="lawyer">Lawyer</option>
                                            <option value="consultant">Consultant</option>
                                            <option value="engineer">Engineer</option>
                                            <option value="doctor">Doctor</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    {errors.profession && <span className="text-xs text-red-500 ml-2">{errors.profession}</span>}
                                </div>

                                {/* State */}
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-sm font-semibold text-gray-700">
                                        <span className="text-red-500 mr-1">*</span> State
                                    </label>

                                    <Select
                                        options={locationData.states.map((state) => ({
                                            value: state.stateName,
                                            label: state.stateName,
                                        }))}
                                        value={
                                            formData.state
                                                ? { value: formData.state, label: formData.state }
                                                : null
                                        }
                                        onChange={(selected) =>
                                            setFormData({
                                                ...formData,
                                                state: selected ? selected.value : "",
                                                district: "",
                                            })
                                        }
                                        placeholder="Select state..."
                                        isSearchable
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderRadius: "1rem", // rounded-2xl
                                                padding: "4px",
                                                borderColor: errors.state
                                                    ? "#f87171" // red-400
                                                    : "#facc15", // yellow-400
                                                boxShadow: state.isFocused
                                                    ? errors.state
                                                        ? "0 0 0 2px #fee2e2" // red-100
                                                        : "0 0 0 2px #fef9c3" // yellow-100
                                                    : "none",
                                                "&:hover": {
                                                    borderColor: errors.state ? "#f87171" : "#facc15",
                                                },
                                            }),
                                        }}
                                    />


                                    {errors.state && (
                                        <span className="text-xs text-red-500 ml-2">
                                            {errors.state}
                                        </span>
                                    )}
                                </div>

                                {/* District */}
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-sm font-semibold text-gray-700">
                                        <span className="text-red-500 mr-1">*</span> District
                                    </label>

                                    <Select
                                        options={availableDistricts.map((district) => ({
                                            value: district.districtName,
                                            label: district.districtName,
                                        }))}
                                        value={
                                            formData.district
                                                ? { value: formData.district, label: formData.district }
                                                : null
                                        }
                                        onChange={(selected) =>
                                            setFormData({
                                                ...formData,
                                                district: selected ? selected.value : "",
                                            })
                                        }
                                        placeholder={
                                            formData.state ? "Select district..." : "Select state first"
                                        }
                                        isSearchable
                                        isDisabled={!formData.state}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderRadius: "1rem",
                                                padding: "4px",
                                                backgroundColor: !formData.state ? "#f9fafb" : "white",
                                                borderColor: errors.district
                                                    ? "#f87171"
                                                    : "#facc15",
                                                boxShadow: state.isFocused
                                                    ? errors.district
                                                        ? "0 0 0 2px #fee2e2"
                                                        : "0 0 0 2px #fef9c3"
                                                    : "none",
                                                "&:hover": {
                                                    borderColor: errors.district ? "#f87171" : "#facc15",
                                                },
                                            }),
                                        }}
                                    />


                                    {errors.district && (
                                        <span className="text-xs text-red-500 ml-2">
                                            {errors.district}
                                        </span>
                                    )}
                                </div>

                                {/* Preferred Language */}
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-sm font-semibold text-gray-700">
                                        <span className="text-red-500 mr-1">*</span> Preferred Language
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="language"
                                            value={formData.language}
                                            onChange={handleChange}
                                            className={`w-full appearance-none px-4 py-3 rounded-2xl border ${errors.language ? 'border-red-400 focus:ring-red-100' : 'border-yellow-400 focus:ring-yellow-100'} focus:outline-none focus:ring-2 transition-all text-gray-600 bg-white`}
                                        >
                                            <option value="" disabled>Select...</option>
                                            <option value="english">English</option>
                                            <option value="hindi">Hindi</option>
                                            <option value="malayalam">Malayalam</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    {errors.language && <span className="text-xs text-red-500 ml-2">{errors.language}</span>}
                                </div>

                                {/* Address Line 1 */}
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Address Line 1 (House No, Building, Street)</label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        value={formData.addressLine1 || ""}
                                        onChange={handleChange}
                                        placeholder="Enter Address Line 1"
                                        className="w-full px-4 py-3 rounded-2xl border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Address Line 2 */}
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Address Line 2 (Area, Apartment, Landmark – optional)</label>
                                    <input
                                        type="text"
                                        name="addressLine2"
                                        value={formData.addressLine2 || ""}
                                        onChange={handleChange}
                                        placeholder="Enter Address Line 2"
                                        className="w-full px-4 py-3 rounded-2xl border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Postal Code / ZIP Code */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Postal Code / ZIP Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode || ""}
                                        onChange={handleChange}
                                        placeholder="Enter Postal Code / ZIP Code"
                                        className="w-full px-4 py-3 rounded-2xl border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Country */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country || ""}
                                        onChange={handleChange}
                                        placeholder="Enter Country"
                                        className="w-full px-4 py-3 rounded-2xl border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Next Button */}
                                <div className="mt-4 flex justify-center md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-yellow-400 text-black px-12 py-4 rounded-full font-bold shadow-lg hover:bg-yellow-500 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Submit"
                                        )}
                                    </button>
                                </div>
                                <div className="mt-6 text-center md:col-span-2">
                                    <p className="text-gray-600">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={onSwitchToLogin}
                                            className="text-black font-bold underline underline-offset-4 hover:text-yellow-600 transition-colors"
                                        >
                                            Sign in
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    ) : step === 2 ? (
                        <motion.div
                            key="otp-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 flex flex-col items-center"
                        >
                            <button
                                onClick={() => setStep(1)}
                                className="self-start flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-6 group"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-1 transition-transform">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to Form
                            </button>

                            <h3 className="text-2xl font-bold text-[#1e293b] mb-4">OTP Verification</h3>
                            <p className="text-center text-gray-500 mb-8 max-w-sm">
                                We've sent a 4-digit verification code to <br />
                                <span className="font-bold text-gray-800">{formData.email}</span>
                            </p>

                            <div className="flex gap-4 mb-8">
                                {[0, 1, 2, 3].map((index) => (
                                    <input
                                        key={index}
                                        id={`signup-otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={otpValues[index]}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-16 h-16 border-2 border-yellow-400 rounded-2xl text-center text-2xl font-bold outline-none focus:ring-4 focus:ring-yellow-100 transition-all"
                                    />
                                ))}
                            </div>

                            <div className="text-lg font-mono text-gray-600 mb-4">
                                {`00:${timer.toString().padStart(2, "0")}`}
                            </div>

                            <p className="text-sm text-gray-500 mb-8">
                                Didn't receive code?{" "}
                                <button
                                    onClick={handleResendOtp}
                                    disabled={timer > 0 || isSubmitting}
                                    className="text-yellow-600 font-bold hover:text-yellow-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                                >
                                    Resend OTP
                                </button>
                            </p>

                            {isVerifying && (
                                <div className="flex items-center gap-2 text-yellow-600 font-semibold mb-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </div>
                            )}

                            {errors.otp && (
                                <div className="flex items-center gap-1 text-sm text-red-500 font-medium mb-4">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.otp}</span>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="kyc-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8"
                        >
                            <button
                                onClick={handleBackStep}
                                className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-6 group"
                            >
                                <motion.div
                                    whileHover={{ x: -3 }}
                                    className="mr-2"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                </motion.div>
                                Back to Verification
                            </button>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">KYC & Document Upload</h3>
                                <p className="text-gray-500">Upload your documents for verification. You can skip this step and complete it later.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                {[
                                    { id: "pan", title: "PAN Card", desc: "PDF or Image" },
                                    { id: "aadhaar", title: "Aadhaar Card", desc: "PDF or Image" },
                                    { id: "gst", title: "GST Certificate", desc: "Optional", optional: true }
                                ].map((doc) => (
                                    <div key={doc.id} className="flex flex-col gap-3">
                                        <label className="text-sm font-semibold text-gray-700">
                                            {doc.title} {doc.optional && <span className="text-gray-400 text-xs font-normal">(Optional)</span>}
                                        </label>
                                        <input
                                            type="file"
                                            id={`${doc.id}-upload`}
                                            className="hidden"
                                            onChange={(e) => handleFileChange(doc.id, e)}
                                        />
                                        <div
                                            onClick={() => handleUploadClick(`${doc.id}-upload`)}
                                            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all h-40 ${kycFiles[doc.id]
                                                ? "border-green-400 bg-green-50"
                                                : "border-yellow-400 hover:bg-yellow-50"
                                                }`}
                                        >
                                            {kycFiles[doc.id] ? (
                                                <div className="text-center">
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs font-medium text-green-700 truncate max-w-[120px]">
                                                        {kycFiles[doc.id].name}
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-2 text-yellow-600">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m14-7-5-5-5 5m5-5v12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-600">Click to upload</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{doc.desc}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4 max-w-md mx-auto">
                                <button
                                    onClick={handleFinalSubmit}
                                    className="w-full bg-yellow-400 text-black py-4 rounded-full font-bold shadow-lg hover:bg-yellow-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {apiSuccess ? <CheckCircle2 className="w-5 h-5" /> : null}
                                    {apiSuccess ? "Success!" : "Submit"}
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="w-full bg-white text-gray-500 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all border border-gray-100"
                                >
                                    Skip for Now
                                </button>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default PartnerSignupModal;
