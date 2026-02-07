import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Loader2, Eye, Download, Plus } from 'lucide-react';
import { getSecureItem } from '../../utils/secureStorage';
import { format } from 'date-fns';
import axiosInstance from '../../api/axiosInstance';

const AssociateQuotes = () => {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const user = getSecureItem("partnerUser") || {};
            const companyId = user.Companies?.[0]?.CompanyID || null;
            const AssociateID = localStorage.getItem("AssociateID");

            // Fetch quotes using the getLatestQuotes endpoint
            const response = await axiosInstance.post('/getLatestQuotes', {
                CompanyID: companyId,
                AssociateID: AssociateID,
                isAssociate: true
                // Add more filters as needed
            });
            console.log("response", response.data);

            if (response.data?.data) {
                setQuotes(response.data.data || []);
            }
        } catch (err) {
            console.error("fetchQuotes error", err);
            setError("An error occurred while fetching quotes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('draft')) return 'bg-gray-50 text-gray-600 border-gray-200';
        if (s.includes('sent')) return 'bg-blue-50 text-blue-600 border-blue-200';
        if (s.includes('approved')) return 'bg-green-50 text-green-600 border-green-200';
        if (s.includes('rejected')) return 'bg-red-50 text-red-600 border-red-200';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const filteredQuotes = quotes.filter(quote =>
        quote.QuoteCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.QuoteName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">Quotes</h1>
                    <p className="text-sm text-slate-500 mt-1">View and manage your quotes</p>
                </div>
                <button
                    onClick={() => navigate('/associate/deals')}
                    className="flex items-center gap-2 bg-[#4b49ac] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3f3da0] transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Quote from Deal
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search quotes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b49ac]/20 focus:border-[#4b49ac] transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Quotes Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">S.No</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quote Code</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quote Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Services</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-[#4b49ac] animate-spin" />
                                            <p className="text-slate-500 font-medium">Loading quotes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm">
                                                {error}
                                            </div>
                                            <button
                                                onClick={fetchQuotes}
                                                className="text-[#4b49ac] font-semibold text-sm hover:underline"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredQuotes.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 grayscale opacity-60">
                                            <Search className="w-12 h-12 text-slate-300" />
                                            <p className="text-slate-500 font-medium text-lg">No quotes found</p>
                                            <p className="text-slate-400 text-sm">Create your first quote from a deal</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotes.map((quote, index) => (
                                    <tr key={quote.QuoteID} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-mono tracking-tight">{quote.QuoteCode || "--"}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900">
                                                {quote.PackageName || quote.QuoteName || "--"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(quote.QuoteStatus)}`}>
                                                {quote.QuoteStatus || "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{quote.CompanyName || "--"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                                            {quote.Services && quote.Services.length > 0
                                                ? quote.Services.map(s => s.ServiceName || s.ItemName).join(", ")
                                                : "--"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {quote.TotalAmount ? `₹${Number(quote.TotalAmount).toLocaleString('en-IN')}` : "--"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {quote.CreatedAt ? format(new Date(quote.CreatedAt), 'dd-MM-yyyy') : "--"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-[#4b49ac] hover:bg-slate-100 rounded-lg transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer/Pagination */}
                {!loading && filteredQuotes.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing <span className="text-slate-900">{filteredQuotes.length}</span> quotes
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all disabled:opacity-50" disabled>
                                Prev
                            </button>
                            <button className="px-3 py-1.5 bg-white text-[#4b49ac] border border-slate-200 rounded-lg text-xs font-bold shadow-sm">1</button>
                            <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all disabled:opacity-50" disabled>
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssociateQuotes;
