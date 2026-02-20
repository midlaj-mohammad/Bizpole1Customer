import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, Building2, MapPin, FileText, CheckCircle2, Upload, Edit, Download, Share2, Link, X } from 'lucide-react';
import { getSecureItem } from '../utils/secureStorage';
import axiosInstance from '../api/axiosInstance';
import { getAssociateById, getAssociateDocuments, uploadAssociateDocuments } from '../api/AssociateApi';
import { getDistrictsByState } from '../utils/constants';
import Select from "react-select"

const AssociateProfile = () => {
    const user = getSecureItem("partnerUser");
    const URL = import.meta.env.VITE_URL

    const [userData, setUserData] = useState();
    const [documents, setDocuments] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        AssociateID: "",
        AssociateName: '',
        Email: '',
        Mobile: '',
        District: '',
        Profession: '',
        State: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    console.log({ userData });
    console.log({ user });

    const fileInputRef = useRef(null);
    const [selectedDocType, setSelectedDocType] = useState(null);
    const [uploading, setUploading] = useState(false);

    const profileData = {
        fullName: userData?.AssociateName || "John Doe",
        email: userData?.Email || "john.doe@example.com",
        phone: userData?.Mobile || "+91 98765 43210",
        companyName: "ABC Business Solutions",
        businessType: "Private Limited",
        city: "Mumbai",
        kycStatus: "Verified",
        memberSince: "January 2024",
        assignedManager: "Rajesh Sharma",
        Profession: userData?.Profession,
        State: userData?.State,
        District: userData?.District,
        stats: {
            totalLeads: 156,
            activeDeals: 34,
            completedOrders: 89
        }
    };

    async function fetchUserData() {
        try {
            if (user.id) {
                const userDataResponse = await getAssociateById(user.id);
                setUserData(userDataResponse.data);

                console.log({ userDataResponse });

                const docsResponse = await getAssociateDocuments(user.id);
                setDocuments(docsResponse.data || []);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, []);

    // Open edit modal and populate form
    const handleEditClick = () => {
        setEditFormData({
            AssociateID: user.id,
            AssociateName: userData?.AssociateName || '',
            Email: userData?.Email || '',
            Mobile: userData?.Mobile || '',
            District: userData?.District || '',
            Profession: userData?.Profession || '',
            State: userData?.State || ''
        });
        setIsEditModalOpen(true);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'State' && { District: '' })
        }));
    };

    // Save profile changes
    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Call your update API endpoint
            const response = await axiosInstance.put(`/associate/${user.id}`, editFormData);

            // Update local state with new data
            setUserData(response.data);

            alert("Profile updated successfully!");
            setIsEditModalOpen(false);

            // Refresh data from server
            await fetchUserData();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadClick = (type) => {
        setSelectedDocType(type);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedDocType) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('associateId', user.id);
        formData.append(selectedDocType.toLowerCase(), file);

        try {
            await uploadAssociateDocuments(formData);
            await new Promise(res => setTimeout(res, 500));
            await fetchUserData();
            alert("Document uploaded successfully!");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload document.");
        } finally {
            setUploading(false);
            setSelectedDocType(null);
            e.target.value = '';
        }
    };

    const requiredDocuments = [
        { type: "PAN", name: "PAN Card", icon: FileText },
        { type: "AADHAAR", name: "Aadhaar Card", icon: FileText },
        { type: "GST", name: "GST Certificate", icon: FileText }
    ];

    const getDocumentStatus = (type) => {
        const foundDoc = documents.find(
            d => d.DocumentType.toLowerCase() === type.toLowerCase()
        );

        if (foundDoc) {
            return {
                status: "Verified",
                date: new Date(foundDoc.CreatedAt).toISOString().split('T')[0],
                found: true,
                url: foundDoc.FileUrl
            };
        }

        return {
            status: "Not uploaded",
            date: null,
            found: false,
            url: null
        };
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
            />

            {/* Edit Modal */}
            {/* Edit Modal */}
            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        name="AssociateName"
                                        value={editFormData.AssociateName}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009068] focus:border-transparent"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={editFormData.Email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009068] focus:border-transparent"
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="Mobile"
                                        value={editFormData.Mobile}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009068] focus:border-transparent"
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        State
                                    </label>

                                    <Select
                                        options={[
                                            "Andhra Pradesh",
                                            "Arunachal Pradesh",
                                            "Assam",
                                            "Bihar",
                                            "Chhattisgarh",
                                            "Goa",
                                            "Gujarat",
                                            "Haryana",
                                            "Himachal Pradesh",
                                            "Jharkhand",
                                            "Karnataka",
                                            "Kerala",
                                            "Madhya Pradesh",
                                            "Maharashtra",
                                            "Manipur",
                                            "Meghalaya",
                                            "Mizoram",
                                            "Nagaland",
                                            "Odisha",
                                            "Punjab",
                                            "Rajasthan",
                                            "Sikkim",
                                            "Tamil Nadu",
                                            "Telangana",
                                            "Tripura",
                                            "Uttar Pradesh",
                                            "Uttarakhand",
                                            "West Bengal",
                                            "Andaman and Nicobar Islands",
                                            "Chandigarh",
                                            "Dadra and Nagar Haveli and Daman and Diu",
                                            "Delhi",
                                            "Jammu and Kashmir",
                                            "Ladakh",
                                            "Lakshadweep",
                                            "Puducherry",
                                        ].map((state) => ({
                                            value: state,
                                            label: state,
                                        }))}
                                        value={
                                            editFormData.State
                                                ? { value: editFormData.State, label: editFormData.State }
                                                : null
                                        }
                                        onChange={(selected) =>
                                            setEditFormData({
                                                ...editFormData,
                                                State: selected ? selected.value : "",
                                                District: "",
                                            })
                                        }
                                        placeholder="Select State"
                                        isSearchable
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                padding: "4px",
                                                borderRadius: "0.5rem", // rounded-lg
                                                borderColor: "#cbd5e1", // slate-300
                                                boxShadow: state.isFocused
                                                    ? "0 0 0 2px #009068"
                                                    : "none",
                                                "&:hover": {
                                                    borderColor: "#009068",
                                                },
                                            }),
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        District
                                    </label>

                                    <Select
                                        options={getDistrictsByState(editFormData.State).map(
                                            (district) => ({
                                                value: district,
                                                label: district,
                                            })
                                        )}
                                        value={
                                            editFormData.District
                                                ? { value: editFormData.District, label: editFormData.District }
                                                : null
                                        }
                                        onChange={(selected) =>
                                            setEditFormData({
                                                ...editFormData,
                                                District: selected ? selected.value : "",
                                            })
                                        }
                                        placeholder="Select District"
                                        isSearchable
                                        isDisabled={!editFormData.State}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                padding: "4px",
                                                borderRadius: "0.5rem",
                                                borderColor: "#cbd5e1",
                                                backgroundColor: !editFormData.State
                                                    ? "#f1f5f9" // disabled look
                                                    : "white",
                                                boxShadow: state.isFocused
                                                    ? "0 0 0 2px #009068"
                                                    : "none",
                                                "&:hover": {
                                                    borderColor: "#009068",
                                                },
                                            }),
                                        }}
                                    />
                                </div>


                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Profession</label>
                                    <input
                                        type="text"
                                        name="Profession"
                                        value={editFormData.Profession}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009068] focus:border-transparent"
                                        placeholder="Enter profession"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="bg-[#009068] hover:bg-[#007a58] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
                    <p className="text-slate-500">Manage your account and KYC documents</p>
                </div>
                <button
                    onClick={handleEditClick}
                    className="bg-[#009068] hover:bg-[#007a58] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                </button>
            </div>

            {/* Rest of your existing code... */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Personal Info & Documents */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-slate-700" />
                            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.fullName}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.email}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.phone}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">District</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.District}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Profession</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.Profession}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">State</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.State}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KYC Documents */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <FileText className="w-5 h-5 text-slate-700" />
                            <h2 className="text-lg font-bold text-slate-900">KYC Documents</h2>
                        </div>

                        <div className="space-y-4">
                            {requiredDocuments.map((docType, index) => {
                                const statusInfo = getDocumentStatus(docType.type);
                                return (
                                    <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${statusInfo.found ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                <docType.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{docType.name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {statusInfo.found ? `Uploaded: ${statusInfo.date}` : 'Not uploaded'}
                                                </p>
                                            </div>
                                        </div>

                                        {statusInfo.found ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Done</span>
                                                </div>

                                                <button
                                                    onClick={() => window.open(statusInfo.url, "_blank")}
                                                    className="flex items-center gap-2 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleUploadClick(docType.type)}
                                                disabled={uploading}
                                                className="flex items-center gap-2 bg-[#009068] hover:bg-[#007a58] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                <Upload className="w-4 h-4" />
                                                {uploading && selectedDocType === docType.type ? 'Uploading...' : 'Upload'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column - Status & Stats */}
                <div className="space-y-6">
                    {/* QR Code Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">My QR Code</h2>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${URL}?ref=${user.id}`}
                                    alt="Associate QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                            <p className="text-sm text-slate-500 text-center">
                                Share this QR code to refer customers directly.
                            </p>
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${URL}?ref=${user.id}`);
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `associate-qr-${user.id}.png`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        } catch (error) {
                                            console.error('Download failed:', error);
                                        }
                                    }}
                                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 hover:text-[#4b49ac]"
                                >
                                    <Download className="w-5 h-5" />
                                    <span className="text-xs font-medium">Download</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'My Associate Profile',
                                                text: 'Check out my associate profile on Bizpole',
                                                url: `${URL}?ref=${user.id}`
                                            }).catch(console.error);
                                        } else {
                                            alert("Share not supported on this device/browser");
                                        }
                                    }}
                                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 hover:text-[#4b49ac]"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-xs font-medium">Share</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${URL}?ref=${user.id}`);
                                        alert("Link copied to clipboard!");
                                    }}
                                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 hover:text-[#4b49ac]"
                                >
                                    <Link className="w-5 h-5" />
                                    <span className="text-xs font-medium">Copy Link</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Active Deals</span>
                                <span className="text-xl font-bold text-slate-900">{profileData.stats.activeDeals}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Completed Orders</span>
                                <span className="text-xl font-bold text-slate-900">{profileData.stats.completedOrders}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociateProfile;