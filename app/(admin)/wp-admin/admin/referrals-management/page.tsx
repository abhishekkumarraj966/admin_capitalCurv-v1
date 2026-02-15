'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getReferrals, getReferralStats } from '@/services/referralApi';
import { format } from 'date-fns';

export default function ReferralsManagementPage() {
    const router = useRouter();
    const [referrals, setReferrals] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [referralsRes, statsRes] = await Promise.all([
                getReferrals(),
                getReferralStats()
            ]);

            console.log('Referrals API Response:', referralsRes); // Debugging

            let referralsData = referralsRes.result?.referrals || referralsRes.result || referralsRes.data || referralsRes;
            if (!Array.isArray(referralsData)) {
                referralsData = [];
            }
            setReferrals(referralsData);

            setStats(statsRes.result || statsRes.data || null);
        } catch (error) {
            console.error('Failed to fetch referrals data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Referrals Management</h1>
                <button
                    onClick={() => router.push('/wp-admin/admin/referrals-management/create')}
                    className="px-4 py-2 bg-[#0F8235] hover:bg-[#0b6528] text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Credit Commission
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Referrals', value: stats?.totalReferrals || 0, color: 'bg-blue-500' },
                    { label: 'Total Earned', value: `₹${stats?.totalEarned || 0}`, color: 'bg-emerald-500' },
                    { label: 'Pending Payouts', value: `₹${stats?.pendingPayouts || 0}`, color: 'bg-amber-500' },
                    { label: 'Active Users', value: stats?.activeUsers || 0, color: 'bg-purple-500' },
                ].map((stat, index) => (
                    <div key={index} className="p-6 rounded-2xl shadow-sm border" style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <p className="text-sm font-medium text-white/70">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <h2 className="text-lg font-bold text-white">All Referrals</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                            <tr>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase">User</th>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase">Referred By</th>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase">Amount</th>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-white/50 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-white/70">Loading...</td></tr>
                            ) : (referrals || []).length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-white/70">No referrals found.</td></tr>
                            ) : (
                                referrals.map((ref: any) => (
                                    <tr key={ref._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-white">{ref.userId?.name || ref.userId || 'Unknown'}</div>
                                            <div className="text-xs text-white/50">{ref.userId?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-white/70">{ref.referredBy?.name || ref.referredBy || '-'}</div>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            ₹{ref.amount || 0}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${ref.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                ref.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {ref.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-white/50">
                                            {ref.createdAt ? format(new Date(ref.createdAt), 'MMM dd, yyyy') : '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => router.push(`/wp-admin/admin/referrals-management/view/${ref._id}`)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                {/* Only allow edit/cancel if not already cancelled or completed? Assuming allowed for now */}
                                                <button
                                                    onClick={() => router.push(`/wp-admin/admin/referrals-management/edit/${ref._id}`)}
                                                    className="p-1.5 text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Manage"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
