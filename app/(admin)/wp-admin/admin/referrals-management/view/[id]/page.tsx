'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getReferralById } from '@/services/referralApi';
import { format } from 'date-fns';

export default function ViewReferralPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();


    const { id } = use(params);

    const [referral, setReferral] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getReferralById(id);
                setReferral(response.result || response.data || response);
            } catch (error) {
                console.error('Failed to fetch referral:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!referral) return <div className="p-8 text-center text-gray-500">Referral not found</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Details</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Back
                    </button>
                    {/* Only show edit/manage if not completed/cancelled? Assuming "Manage" is always visible */}
                    <button
                        onClick={() => router.push(`/wp-admin/admin/referrals-management/edit/${id}`)}
                        className="px-4 py-2 text-sm font-bold text-white bg-[#0F8235] rounded-lg hover:bg-[#0b6528] rounded-xl"
                    >
                        Manage
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] p-8 max-w-3xl mx-auto">
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Referral Transaction
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {referral._id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${referral.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            referral.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {referral.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-[#021F17]">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">User</label>
                            <p className="text-gray-900 dark:text-white font-medium">{referral.userId?.name || referral.userId || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{referral.userId?.email}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Referred By</label>
                            <p className="text-gray-900 dark:text-white font-medium">{referral.referredBy?.name || referral.referredBy || '-'}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount</label>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{referral.amount || 0}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                                {referral.createdAt ? format(new Date(referral.createdAt), 'MMMM dd, yyyy, h:mm a') : '-'}
                            </p>
                        </div>

                        {referral.description && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <p className="text-gray-900 dark:text-white font-medium">{referral.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
