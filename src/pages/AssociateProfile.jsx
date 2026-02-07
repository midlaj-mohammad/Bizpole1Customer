import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, Building2, MapPin, FileText, CheckCircle2, Upload, Edit, Download, Share2, Link } from 'lucide-react';
import { getSecureItem } from '../utils/secureStorage';
import axiosInstance from '../api/axiosInstance';
import { getAssociateById, getAssociateDocuments, uploadAssociateDocuments } from '../api/AssociateApi';

const AssociateProfile = () => {
    const user = getSecureItem("partnerUser") ;

    const URL = import.meta.env.VITE_URL

    
    const [userData, setUserData] = useState();
    const [documents, setDocuments] = useState([]);

    console.log({user});
    
    const fileInputRef = useRef(null);
    const [selectedDocType, setSelectedDocType] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Mock data for display - to be replaced with real data later
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

        // small delay for backend processing
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
                url: foundDoc.FileUrl // 👈 add this
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
                    <p className="text-slate-500">Manage your account and KYC documents</p>
                </div>
                <button className="bg-[#009068] hover:bg-[#007a58] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    Edit Profile
                </button>
            </div>

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
                                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.companyName}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Business Type</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.businessType}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">City</label>
                                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {profileData.city}
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
                                <span className="text-slate-500 font-medium">Total Leads</span>
                                <span className="text-xl font-bold text-slate-900">{profileData.stats.totalLeads}</span>
                            </div>
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
