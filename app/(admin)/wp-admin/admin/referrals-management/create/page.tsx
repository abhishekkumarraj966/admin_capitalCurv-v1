'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { creditCommission } from '@/services/referralApi';

export default function CreditCommissionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Using simple input for User ID for now. 
    // ideally this would be a user search/select component, but adhering to basic requirement first.
    const [form, setForm] = useState({
        userId: '',
        amount: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await creditCommission({
                userId: form.userId,
                amount: Number(form.amount)
            });
            router.push('/wp-admin/admin/referrals-management');
        } catch (error) {
            console.error('Failed to credit commission:', error);
            alert('Failed to credit commission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Commission</h1>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Back
                </button>
            </div>

            <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User ID</label>
                        <input
                            type="text"
                            value={form.userId}
                            onChange={(e) => setForm({ ...form, userId: e.target.value })}
                            placeholder="Enter User ID"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">Enter the ID of the user to receive commission.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
                        <input
                            type="number"
                            min="0"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0.00"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-[#0F8235] hover:bg-[#0b6528] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Processing...' : 'Credit Commission'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
