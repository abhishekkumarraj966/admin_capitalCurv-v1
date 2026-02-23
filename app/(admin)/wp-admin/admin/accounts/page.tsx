'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function AdminAccounts() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Get token directly from storage since context doesn't expose it
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem('adminAccessToken'));
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/trading/admin/accounts`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit: 10, search, status: statusFilter }
            });
            if (response.data.success) {
                setAccounts(response.data.result.data);
                setTotalPages(response.data.result.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Failed to fetch accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAccounts();
    }, [token, page, search, statusFilter]);

    const handleBlock = async (accountId: string) => {
        if (!confirm('Are you sure you want to block this account?')) return;
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/trading/admin/block/${accountId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Account blocked');
                fetchAccounts();
            }
        } catch (error) {
            toast.error('Failed to block account');
        }
    };

    const handleUnblock = async (accountId: string) => {
        if (!confirm('Are you sure you want to unblock this account?')) return;
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/trading/admin/unblock/${accountId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Account unblocked');
                fetchAccounts();
            }
        } catch (error) {
            toast.error('Failed to unblock account');
        }
    };

    return (
        <div className="min-h-screen text-white p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Trade Accounts</h1>
                    <p className="text-gray-400 mt-1">Manage all trader accounts and their status</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search Account No..."
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#009867]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#009867]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                    <option value="Blocked">Blocked</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-[#000F0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Account No</th>
                                <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                                <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Balance</th>
                                <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading accounts...</td></tr>
                            ) : accounts.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No accounts found</td></tr>
                            ) : (
                                accounts.map((account) => (
                                    <tr key={account._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-sm">{account.accountNo}</td>
                                        <td className="p-4">
                                            <div className="text-xs text-gray-500">{account.userId?.email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">{account.accountType} - Step {account.step}</td>
                                        <td className="p-4 text-sm text-gray-300">Phase {account.step}</td>
                                        <td className="p-4 text-sm font-mono text-[#009867]">₹{account.accountSize.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase
                                                ${account.status === 'Active' ? 'bg-[#009867]/20 text-[#009867]' :
                                                    account.status === 'Blocked' ? 'bg-red-500/20 text-red-400' :
                                                        account.status === 'Passed' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-gray-500/20 text-gray-400'}`}>
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {account.status === 'Blocked' ? (
                                                <button
                                                    onClick={() => handleUnblock(account._id)}
                                                    className="text-xs bg-[#009867]/20 text-[#009867] px-3 py-1 rounded hover:bg-[#009867]/30 transition-colors"
                                                >
                                                    Unblock
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlock(account._id)}
                                                    className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30 transition-colors"
                                                >
                                                    Block
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
