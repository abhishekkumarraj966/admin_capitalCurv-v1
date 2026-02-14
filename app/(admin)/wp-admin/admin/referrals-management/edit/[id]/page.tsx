'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getReferralById, cancelCommission } from '@/services/referralApi';
import { format } from 'date-fns';

export default function EditReferralPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();


    const { id } = use(params);

    const [referral, setReferral] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

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

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to CANCEL this commission? This action cannot be undone.')) return;

        setProcessing(true);
        try {
            // Assuming the API expects the ID in the body, possibly as 'referralId' or 'id'
            // The user didn't specify the body for cancel, just "Commission cancelled".
            // Common pattern: { referralId: id } or just { id }
            await cancelCommission({ referralId: id });
            alert('Commission cancelled successfully');
            router.push('/wp-admin/admin/referrals-management');
        } catch (error) {
            console.error('Failed to cancel commission:', error);
            alert('Failed to cancel commission');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!referral) return <div className="p-8 text-center text-gray-500">Referral not found</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Referral</h1>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Back
                </button>
            </div>

            <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] p-8 max-w-3xl mx-auto">
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Action Required
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You can view details or cancel this commission.
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${referral.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            referral.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {referral.status}
                        </span>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-[#000F0A]/50 rounded-xl border border-gray-100 dark:border-[#021F17] grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">User</p>
                            <p className="font-medium text-gray-900 dark:text-white">{referral.userId?.name || referral.userId || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Amount</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">₹{referral.amount || 0}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-[#021F17] flex justify-end gap-4">
                        {referral.status !== 'Cancelled' && (
                            <button
                                onClick={handleCancel}
                                disabled={processing}
                                className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-colors border border-red-200"
                            >
                                {processing ? 'Cancelling...' : 'Cancel Commission'}
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/wp-admin/admin/referrals-management')}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
