'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    ArrowUpRight,
    AlertCircle,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getWithdrawals, getWithdrawalStats, approveWithdrawal, rejectWithdrawal } from '@/services/withdrawalApi';

export default function WithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // pending, completed, failed, all
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchWithdrawals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getWithdrawals({
                page,
                limit,
                status: activeTab === 'all' ? undefined : activeTab,
                sortBy: 'createdAt',
                sortOrder: -1
            });
            const data = res.result?.data || res.result || [];
            setWithdrawals(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
            toast.error('Failed to load withdrawals');
        } finally {
            setLoading(false);
        }
    }, [page, limit, activeTab]);

    const fetchStats = async () => {
        try {
            const res = await getWithdrawalStats();
            setStats(res.result || res.data);
        } catch (error) {
            console.error('Failed to fetch withdrawal stats:', error);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
        fetchStats();
    }, [fetchWithdrawals]);

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to APPROVE this withdrawal? This will mark it as completed.')) return;

        setProcessingId(id);
        try {
            await approveWithdrawal(id, {
                transactionId: `TXN-${Date.now()}` // Mock bank ref
            });
            toast.success('Withdrawal approved successfully');
            fetchWithdrawals();
            fetchStats();
        } catch (error: any) {
            console.error('Approve failed:', error);
            toast.error(error.response?.data?.message || 'Failed to approve withdrawal');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Please enter a rejection reason:');
        if (reason === null) return; // Cancelled
        if (!reason.trim()) return alert('Reason is required');

        setProcessingId(id);
        try {
            await rejectWithdrawal(id, { reason });
            toast.success('Withdrawal rejected and refunded');
            fetchWithdrawals();
            fetchStats();
        } catch (error: any) {
            console.error('Reject failed:', error);
            toast.error(error.response?.data?.message || 'Failed to reject withdrawal');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredWithdrawals = withdrawals.filter((w: any) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const userName = `${w.userId?.firstName || ''} ${w.userId?.lastName || ''}`.toLowerCase();
        const userEmail = (w.userId?.email || '').toLowerCase();
        const txnId = (w.transactionId || '').toLowerCase();
        return userName.includes(q) || userEmail.includes(q) || txnId.includes(q);
    });

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Withdrawal Requests</h1>
                    <p className="text-gray-500 font-bold text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={14} className="text-[#0F8235]" />
                        Manage Payouts & Transfers
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#021F17] text-white rounded-xl text-xs font-bold uppercase transition-all hover:bg-[#032F24]">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-[2.5rem] bg-white dark:bg-[#021F17] border border-gray-100 dark:border-[#0F8235]/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock size={80} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Requests</p>
                    <p className="text-3xl font-black text-amber-500 mt-2">{stats?.pendingRequests || 0}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">Value: ₹{stats?.pendingAmount?.toLocaleString() || 0}</p>
                </div>

                <div className="p-6 rounded-[2.5rem] bg-white dark:bg-[#021F17] border border-gray-100 dark:border-[#0F8235]/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckCircle2 size={80} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved (All Time)</p>
                    <p className="text-3xl font-black text-emerald-500 mt-2">{stats?.approvedRequests || 0}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">Paid: ₹{stats?.totalPaidOut?.toLocaleString() || 0}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-[#021F17] rounded-[2.5rem] border border-gray-100 dark:border-[#0F8235]/20 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                {/* Search & Tabs */}
                <div className="p-6 border-b border-gray-100 dark:border-[#0F8235]/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex p-1 bg-gray-100 dark:bg-[#000F0A] rounded-xl w-full md:w-auto">
                        {['pending', 'completed', 'failed', 'all'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab
                                    ? 'bg-[#0F8235] text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0F8235] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search by User, ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#000F0A]/30 border border-transparent focus:border-[#0F8235]/30 rounded-2xl outline-none transition-all font-bold text-xs"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-[#000F0A]/50">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Request Info</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">User Details</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
                            ) : filteredWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-[#000F0A] rounded-full flex items-center justify-center text-gray-400">
                                                <CreditCard size={32} />
                                            </div>
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No withdrawal requests found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredWithdrawals.map((w: any) => (
                                    <tr key={w._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="text-xs font-black text-gray-900 dark:text-white">{w.transactionId}</div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-1 truncate max-w-[150px]">{w.description}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs font-bold text-gray-900 dark:text-white">{w.userId?.firstName} {w.userId?.lastName}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">{w.userId?.userId || 'N/A'}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-sm font-black text-gray-900 dark:text-white">₹{w.amount?.toLocaleString()}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                                {format(new Date(w.createdAt), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {format(new Date(w.createdAt), 'HH:mm')}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            {w.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleReject(w._id)}
                                                        disabled={processingId === w._id}
                                                        className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(w._id)}
                                                        disabled={processingId === w._id}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-50"
                                                    >
                                                        {processingId === w._id ? 'Processing...' : 'Approve'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-100 dark:border-[#0F8235]/10 flex justify-between items-center">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#000F0A]"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-bold text-gray-500">Page {page}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={withdrawals.length < limit}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#000F0A]"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
