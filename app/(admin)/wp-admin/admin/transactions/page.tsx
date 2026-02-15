'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getTransactions, getTransactionStats, exportTransactions } from '@/services/transactionApi';
import { format } from 'date-fns';
import {
    Search,
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    CheckCircle2,
    XCircle,
    Filter,
    MoreHorizontal,
    ShoppingBag
} from 'lucide-react';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [activeTab, setActiveTab] = useState('all');

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await getTransactionStats();
            setStats(res.result || res.data || res);
        } catch (error) {
            console.error('Failed to fetch transaction stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            // Mapping UI tabs to API status values: completed, failed, pending, cancelled
            const statusMap: { [key: string]: string | undefined } = {
                'all': undefined,
                '1': 'completed',
                '3': 'failed'
            };
            const status = statusMap[activeTab];
            const res = await getTransactions({ page, limit, status });
            // API might return result.data or similar
            const data = res.result?.data || res.result || res.data || [];
            setTransactions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, activeTab]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchTransactions();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchTransactions]);

    const handleExport = async () => {
        try {
            const blob = await exportTransactions();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export transactions:', error);
            alert('Failed to export transitions.');
        }
    };

    const filteredTransactions = useMemo(() => {
        if (!searchQuery) return transactions;
        const q = searchQuery.toLowerCase();
        return transactions.filter((t: any) => {
            const userName = `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.toLowerCase();
            const txnId = (t.transactionId || t._id || '').toLowerCase();
            return userName.includes(q) || txnId.includes(q);
        });
    }, [transactions, searchQuery]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Transactions</h1>
                    <p className="text-gray-500 font-bold text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-[#0F8235]" />
                        Financial Movement Logs
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExport}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[#021F17] text-gray-700 dark:text-gray-200 rounded-2xl border border-gray-100 dark:border-[#021F17] font-black text-xs hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Download size={16} />
                        EXPORT CSV
                    </button>
                    <button className="p-3 bg-[#0F8235] text-white rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-[#0b6528] transition-all">
                        <ArrowUpRight size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Volume', value: `₹${stats?.totalVolume?.toLocaleString() || '0'}`, icon: Activity, color: 'indigo' },
                    { label: 'Successful', value: stats?.successCount || '0', icon: CheckCircle2, color: 'emerald' },
                    { label: 'Pending/Failed', value: stats?.failedCount || '0', icon: XCircle, color: 'amber' },
                    { label: 'Platform Fees', value: `₹${stats?.platformFees?.toLocaleString() || '0'}`, icon: ShoppingBag, color: 'purple' }
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all group" style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 inline-block`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area - Trade History Design */}
            <div className="rounded-[3rem] border shadow-xl overflow-hidden min-h-[500px] flex flex-col" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                {/* Custom Modal-like Header */}
                <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Trade History</h2>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0F8235] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search by ID, User..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-xs text-white placeholder:text-white/40" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                        />
                    </div>
                </div>

                {/* Tabs Section as per Design */}
                <div className="px-8 py-6 border-b" style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <div className="flex p-1.5 rounded-2xl border max-w-lg shadow-inner" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        {[
                            { label: 'All Transactions', value: 'all' },
                            { label: 'Successful', value: '1' },
                            { label: 'Failed', value: '3' }
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => { setActiveTab(tab.value); setPage(1); }}
                                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-tighter rounded-xl transition-all ${activeTab === tab.value
                                    ? 'bg-[#0F8235] text-white shadow-lg'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                            <tr>
                                <th className="p-6 text-[10px] font-black text-white/50 uppercase tracking-widest">Sr No</th>
                                <th className="p-6 text-[10px] font-black text-white/50 uppercase tracking-widest">Transaction Info</th>
                                <th className="p-6 text-[10px] font-black text-white/50 uppercase tracking-widest">User Details</th>
                                <th className="p-6 text-[10px] font-black text-white/50 uppercase tracking-widest">Method</th>
                                <th className="p-6 text-[10px] font-black text-white/50 uppercase tracking-widest">Amount</th>
                                <th className="p-6 text-[10px] font-black text-white/50 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-[10px] font-black text-white/50 uppercase tracking-widest">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="p-6"><div className="h-10 bg-gray-50 dark:bg-[#000F0A]/50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="space-y-4">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-[#000F0A]/50 rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto">
                                                <Activity size={40} />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No trade records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t: any, index: number) => (
                                    <tr key={t._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/30 transition-colors group">
                                        <td className="p-6 text-xs font-black text-gray-400">
                                            {((page - 1) * limit) + index + 1}
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs font-black text-gray-900 dark:text-white uppercase truncate max-w-[120px]">
                                                {t.transactionId || t._id}
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold mt-1 uppercase">ID REFERENCE</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs font-black text-gray-900 dark:text-white">
                                                {t.user?.firstName} {t.user?.lastName}
                                            </div>
                                            <div className="text-[9px] text-[#0F8235] font-bold uppercase mt-1 tracking-tighter truncate max-w-[120px]">{t.user?.email || 'N/A'}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-[9px] font-black uppercase text-gray-600 dark:text-gray-300">
                                                {t.method || 'Transfer'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className={`text-sm font-black ${t.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.type === 'Credit' ? '+' : '-'}₹{t.amount?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${(t.status?.toLowerCase() === 'completed' || t.status === 'Success') ? 'bg-emerald-100 text-emerald-700' :
                                                (t.status?.toLowerCase() === 'pending') ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs font-black text-gray-600 dark:text-gray-400">
                                                {format(new Date(t.createdAt), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                                                {format(new Date(t.createdAt), 'HH:mm a')}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Custom Pagination as per Design */}
                <div className="p-8 border-t border-gray-50 dark:border-[#021F17] flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/30 dark:bg-[#000F0A]/30">
                    <div className="flex items-center gap-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Rows per page:</span>
                        <div className="relative">
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="appearance-none bg-[#1A1F2C] text-white px-4 py-2 pr-10 rounded-xl outline-none cursor-pointer hover:bg-black transition-all"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                                <Filter size={12} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-6 py-3 bg-white dark:bg-[#021F17] text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-[#021F17] text-[10px] font-black uppercase hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Previous
                        </button>
                        <div className="flex bg-white dark:bg-[#021F17] p-1.5 rounded-2xl border border-gray-100 dark:border-[#021F17] shadow-inner">
                            <span className="px-4 py-1.5 bg-[#0F8235] text-white rounded-xl text-[10px] font-black shadow-lg">
                                Page {page}
                            </span>
                        </div>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={transactions.length < limit}
                            className="px-6 py-3 bg-[#0F8235] text-white rounded-2xl shadow-lg shadow-emerald-500/30 text-[10px] font-black uppercase hover:bg-[#0b6528] disabled:opacity-30 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
