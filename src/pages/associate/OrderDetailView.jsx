import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Loader2, Calendar, Hash, Building2, User,
    Briefcase, Activity, Clock, FileText, IndianRupee,
    AlertCircle, CheckCircle2, MoreVertical, MessageSquare,
    ListChecks, FolderOpen, Receipt, FileStack, LayoutDashboard, History
} from 'lucide-react';
import { getOrderById } from '../../api/Orders/Order';
import { format, differenceInDays } from 'date-fns';

const OrderDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Summary');

    const tabs = [
        { name: 'Summary', icon: LayoutDashboard },
        { name: 'Services', icon: ListChecks },
        { name: 'Files', icon: FolderOpen },
        { name: 'Receipts', icon: Receipt },
        { name: 'Invoice', icon: FileStack },
        { name: 'Notes', icon: FileText },
        // { name: 'Event Logs', icon: History },
        // { name: 'Tasks', icon: Activity },
        // { name: 'Chat', icon: MessageSquare },
    ];

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const response = await getOrderById(id);
                if (response.success) {
                    setOrder(response.data);
                }
            } catch (err) {
                console.error("fetchOrderDetails error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#4b49ac]" />
                <p className="text-slate-500 font-medium">Fetching order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-12 text-center">
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
                    <p className="text-slate-500 mb-6">We couldn't find the order details you're looking for.</p>
                    <button
                        onClick={() => navigate('/associate/orders')}
                        className="px-6 py-2 bg-[#4b49ac] text-white rounded-xl font-medium"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const aging = order.OrderCreatedAt ? differenceInDays(new Date(), new Date(order.OrderCreatedAt)) : 0;

    return (
        <div className="bg-slate-50/50 min-h-screen">
            {/* Header Banner */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-[1600px] mx-auto p-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                        {/* Title & Code */}
                        <div className="flex items-start gap-4">
                            <button
                                onClick={() => navigate('/associate/orders')}
                                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all mt-1"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-slate-900">Order Status: {order.OrderStatus || 'N/A'}</h1>
                                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-bold border border-orange-100 uppercase uppercase">
                                        {order.OrderStatus || 'Draft'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1 uppercase">Order Code: <span className="text-slate-900 font-mono font-bold tracking-wider">{order.OrderCodeId || '--'}</span></p>
                            </div>
                        </div>

                        {/* Middle Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 max-w-2xl px-4">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Creator</p>
                                <p className="text-sm font-bold text-slate-800">{order.QuoteCRE_EmployeeName || '--'}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-1">Customer</p>
                                <p className="text-sm font-bold text-slate-800">{order.CustomerName || '--'}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-1">Company</p>
                                <p className="text-sm font-bold text-slate-800 truncate" title={order.CompanyName}>{order.CompanyName || '--'}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Value</p>
                                <p className="text-sm font-bold text-emerald-600">₹{(order.TotalAmount || 0).toLocaleString()}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-1">Received</p>
                                <p className="text-sm font-bold text-[#4b49ac]">₹{(order.ReceivedAmount || 0).toLocaleString()}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-1">Due</p>
                                <p className="text-sm font-bold text-red-500">₹{(order.PendingAmount || 0).toLocaleString()}</p>
                            </div>

                            <div className="flex items-start justify-end">
                                <span className="text-sm font-bold text-slate-600">Aging: <span className="text-slate-900">{aging} days</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-8 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === tab.name
                                    ? 'bg-[#fffbeb] text-[#4b49ac] border-[#4b49ac]'
                                    : 'text-slate-400 border-transparent hover:text-slate-600'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-[1600px] mx-auto p-6 lg:px-8">
                {activeTab === 'Summary' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Basic Information */}
                        <div className="bg-white rounded-2xl border border-amber-200 border-opacity-50 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="border-b border-amber-100 bg-amber-50/30 px-6 py-4 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-amber-600" />
                                <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    <InfoItem label="Order Date" value={order.OrderCreatedAt ? format(new Date(order.OrderCreatedAt), 'd/MM/yyyy') : '--'} />
                                    <InfoItem label="Order ID" value={order.OrderCodeId || '--'} isBold />
                                    <InfoItem label="Company" value={order.CompanyName || '--'} isLink />
                                    <InfoItem label="Customer" value={order.CustomerName || '--'} isLink />
                                    <InfoItem label="Order CRE" value={order.QuoteCRE_EmployeeName || '--'} />
                                    <InfoItem label="Source of Sale" value={order.SourceOfSale || 'Website'} />
                                    <InfoItem label="Service Count" value={order.ServiceDetails?.length || '0'} />
                                    <InfoItem label="Order Status" value={order.OrderStatus || 'Pending'} isStatus />
                                    <InfoItem
                                        label="Created On / Updated On"
                                        value={`${order.OrderCreatedAt ? format(new Date(order.OrderCreatedAt), 'd/MM/yyyy, p') : '--'} / ${order.OrderUpdatedAt ? format(new Date(order.OrderUpdatedAt), 'd/MM/yyyy, p') : '--'}`}
                                    />
                                    <InfoItem label="Created By / Updated By" value={`${order.CreatedBy || '--'} / ${order.UpdatedBy || '--'}`} />
                                    <InfoItem label="Remarks" value={order.Remarks || '-'} />
                                    <InfoItem label="Connected Quote" value={order.QuoteIDCode || order.QuoteID} isLink />
                                </div>
                            </div>
                        </div>

                        {/* Pricing Information */}
                        <div className="bg-white rounded-2xl border border-amber-200 border-opacity-50 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="border-b border-amber-100 bg-amber-50/30 px-6 py-4 flex items-center gap-3">
                                <IndianRupee className="w-5 h-5 text-amber-600" />
                                <h2 className="text-lg font-bold text-slate-900">Pricing Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    <PriceItem label="Professional Fee (Total)" value={order.totals?.ProfessionalFee || 0} />
                                    <PriceItem label="Contractor Fee (Total)" value={order.totals?.ContractorFee || 0} />
                                    <PriceItem label="Vendor Fee (Total)" value={order.totals?.VendorFee || 0} />
                                    <PriceItem label="Govt. Fee (Total)" value={order.totals?.GovFee || 0} />
                                    <PriceItem label="GST (Total)" value={order.totals?.GST || 0} />
                                    <PriceItem label="Grand Total" value={order.totals?.grandTotal || 0} isGrandTotal />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab !== 'Summary' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{activeTab} Section</h3>
                        <p className="text-slate-500">This section is currently being updated with real-time data.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, isBold, isLink, isStatus, colSpan2 }) => (
    <div className={`${colSpan2 ? 'md:col-span-2' : ''} space-y-1`}>
        <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider font-semibold">{label}</p>
        <p className={`text-sm ${isBold ? 'font-bold text-slate-900' : 'text-slate-600'} ${isLink ? 'text-blue-600 font-medium hover:underline cursor-pointer' : ''}`}>
            {value}
        </p>
    </div>
);

const PriceItem = ({ label, value, isGrandTotal }) => (
    <div className="space-y-1">
        <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider font-semibold">{label}</p>
        <p className={`text-lg ${isGrandTotal ? 'font-black text-slate-900 text-xl' : 'font-bold text-slate-700'}`}>
            ₹{Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
    </div>
);

export default OrderDetailView;
