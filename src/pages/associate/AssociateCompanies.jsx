import React, { useState, useEffect } from 'react';
import { MoreVertical, Search, Filter, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as DealsApi from '../../api/DealsApi';
import { getSecureItem } from '../../utils/secureStorage';
import { format } from 'date-fns';

const AssociateCompanies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const user = getSecureItem("partnerUser") || {};
            const result = await DealsApi.listAssociateCompanies({
                page,
                limit: pageSize,
                AssociateID: user.id || null
            });
            if (result.success) {
                setCompanies(result.data);
                setTotal(result.total);
            } else {
                setError(result.message || 'Failed to fetch companies');
            }
        } catch (err) {
            setError(err.message || 'Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [page, pageSize]);

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Companies</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b49ac] focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Created</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Origin</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Due</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created On</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated On</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array(13).fill(0).map((_, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : companies.length > 0 ? (
                                companies.map((company, index) => (
                                    <tr key={company.CompanyID} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-gray-600">{(page - 1) * pageSize + index + 1}</td>
                                        <td
                                            className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer hover:text-[#4b49ac]"
                                            onClick={() => navigate(`/associate/companies/${company.CompanyID}`)}
                                        >
                                            {company.CompanyCode || 'N/A'}
                                        </td>
                                        <td
                                            className="px-6 py-4 text-sm text-gray-900 font-medium cursor-pointer hover:text-[#4b49ac]"
                                            onClick={() => navigate(`/associate/companies/${company.CompanyID}`)}
                                        >
                                            {company.BusinessName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{company.CreatedByName || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium text-[#4b49ac] hover:underline cursor-pointer">
                                            {company.PrimaryCustomerID ? `F${company.FranchiseID}/C${String(company.PrimaryCustomerID).padStart(7, "0")}` : 'null'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#4b49ac] font-medium hover:underline cursor-pointer">
                                            {company.PrimaryCustomerName?.trim()
                                                ? company.PrimaryCustomerName
                                                : company.BusinessName || '-'}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">{company.Origin || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">{company.activeOrders || 0}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">{company.totalOrders || 0}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{company.AmountDue ? `₹${company.AmountDue}` : '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {company.CreatedAt ? format(new Date(company.CreatedAt), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {company.UpdatedAt ? format(new Date(company.UpdatedAt), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="13" className="px-6 py-12 text-center text-gray-500">
                                        No companies found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing page {page} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (page <= 3) pageNum = i + 1;
                            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = page - 2 + i;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pageNum
                                        ? 'bg-[#4b49ac] text-white'
                                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociateCompanies;
