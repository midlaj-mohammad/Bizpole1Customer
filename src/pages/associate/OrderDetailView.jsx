import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Loader2, Calendar, Hash, Building2, User,
    Briefcase, Activity, Clock, FileText, IndianRupee,
    AlertCircle, CheckCircle2, MessageSquare, ListChecks,
    FolderOpen, Receipt, FileStack, LayoutDashboard, History,
    PieChart, Target
} from 'lucide-react';
import { getOrderById } from '../../api/Orders/Order';
import { format } from 'date-fns';

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
    ];

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return;
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
                <p className="text-slate-500 font-medium tracking-tight">Accessing order records...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-12 text-center">
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
                    <p className="text-slate-500 mb-6 font-medium">The order you are looking for could not be found or you don't have access.</p>
                    <button
                        onClick={() => navigate('/associate/orders')}
                        className="px-6 py-2 bg-[#4b49ac] text-white rounded-xl font-bold hover:bg-[#3f3da0] transition-colors"
                    >
                        Return to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50/50 min-h-screen">
            {/* Header & Sticky Tabs */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-[1600px] mx-auto p-4 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <button
                            onClick={() => navigate('/associate/orders')}
                            className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back to Orders
                        </button>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.OrderStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {order.OrderStatus || 'In Progress'}
                            </span>
                            <span className="text-slate-400 font-bold text-xs">{order.OrderCodeId}</span>
                        </div>
                    </div>

                    <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-transparent">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-[11px] font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === tab.name
                                        ? 'bg-slate-50 text-[#4b49ac] border-[#4b49ac]'
                                        : 'text-slate-400 border-transparent hover:text-slate-600 bg-white mr-1'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="max-w-[1600px] mx-auto p-6 lg:px-8">
                {activeTab === 'Summary' ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 1. Basic Information */}
                        <InfoCard icon={<FileText className="w-4 h-4" />} title="Basic Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <DataItem label="Order ID" value={order.OrderCodeId} />
                                <DataItem label="Order Date" value={order.OrderCreatedAt ? format(new Date(order.OrderCreatedAt), 'dd MMM yyyy HH:mm:ss') : '--'} />
                                <DataItem label="Order Status" value={order.OrderStatus || 'pending'} />
                                <DataItem label="Order Source" value={order.SourceOfSale || 'Associate'} />
                                <DataItem label="Company Name" value={order.CompanyName} isBold />
                                <DataItem label="Customer Name" value={order.CustomerName} isBold />
                                <DataItem label="Order CRE" value={order.QuoteCRE_EmployeeName || 'admin'} />
                                <DataItem label="Connected Quote" value={order.QuoteIDCode || '-'} />
                            </div>
                        </InfoCard>

                        {/* 2. Financial Summary */}
                        <InfoCard icon={<IndianRupee className="w-4 h-4" />} title="Pricing Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <PriceItem label="Professional Fee" value={order.totals?.ProfessionalFee || 0} />
                                <PriceItem label="Vendor Fee" value={order.totals?.VendorFee || 0} />
                                <PriceItem label="Contractor Fee" value={order.totals?.ContractorFee || 0} />
                                <PriceItem label="Govt. Fee" value={order.totals?.GovFee || 0} />
                                <PriceItem label="GST Amount" value={order.totals?.GST || 0} />
                                <PriceItem label="Discount Applied" value={order.Discount || 0} />
                                <PriceItem label="Order Value" value={order.TotalAmount || 0} isTotal />
                                <PriceItem label="Amount Received" value={order.ReceivedAmount || 0} />
                                <PriceItem label="Amount Pending" value={order.PendingAmount || 0} />
                            </div>
                        </InfoCard>

                        {/* 3. Associated Services */}
                        <div className="xl:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <ListChecks className="w-4 h-4 text-[#4b49ac]" />
                                        Associated Services ({order.ServiceDetails?.length || 0})
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-tighter font-bold text-slate-400">
                                                <th className="px-6 py-3">Service Name</th>
                                                <th className="px-6 py-3">Category</th>
                                                <th className="px-6 py-3 text-right">Total Price</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">TAT Days</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(order.ServiceDetails || []).map((service, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-slate-700">{service.ServiceName}</td>
                                                    <td className="px-6 py-4 text-slate-500 italic">{service.ServiceCategory || '--'}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-700">₹{(service.Total || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-500 uppercase font-bold text-[9px]">{service.ServiceStatus || 'pending'}</td>
                                                    <td className="px-6 py-4 text-slate-400">{service.TotalTAT || 0} Days</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center animate-in fade-in duration-500">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{activeTab} Section</h3>
                        <p className="text-slate-400 text-sm font-medium">Real-time data for this section is being aggregated.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoCard = ({ icon, title, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2.5">
            <span className="text-[#4b49ac]">{icon}</span>
            <h3 className="text-[11px] font-black text-slate-800 tracking-tight uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-7 flex-1">
            {children}
        </div>
    </div>
);

const DataItem = ({ label, value, isLink, isBold }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-[12px] ${isBold ? 'font-bold' : 'font-medium'} ${isLink ? 'text-blue-500 cursor-pointer hover:underline' : 'text-slate-600'}`}>
            {value}
        </p>
    </div>
);

const PriceItem = ({ label, value, isTotal }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-[12px] font-bold ${isTotal ? 'text-emerald-600 text-[14px]' : 'text-slate-700'}`}>
            ₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
    </div>
);

export default OrderDetailView;
