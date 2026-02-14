'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getPlanById } from '@/services/purchaseApi';
import { CheckCircle, Eye } from 'lucide-react';

export default function ViewPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();


    const { id } = use(params);

    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await getPlanById(id);
                // getPlanById returns { result: plan }
                // accessing 'res.data' directly might fail if type is strict, but axios usually returns data in .data
                // However, our getPlanById returns the response body directly OR an object.
                // Let's safe check properly. 
                const planData = (res as any).result || (res as any).data || res;
                setPlan(planData);
            } catch (error) {
                console.error('Failed to fetch plan:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading plan details...</div>;
    if (!plan) return <div className="p-8 text-center text-gray-500">Plan not found</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#021F17] rounded-xl transition-colors"
                    >
                        <Eye size={24} className="rotate-180" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plan Details</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/wp-admin/admin/plan-management/edit/${id}`)}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
                    >
                        Edit Plan
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#021F17] rounded-3xl shadow-sm border border-gray-100 dark:border-[#021F17] p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${plan.accountType === 'Equity' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {plan.accountType}
                                </span>
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-4">{plan.name}</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">₹{plan.price.toLocaleString()}</div>
                                <div className="mt-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-gray-50 dark:bg-[#000F0A]/30 rounded-2xl border border-gray-100/50 dark:border-[#021F17]">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Account Size</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">₹{plan.accountSize.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-[#000F0A]/30 rounded-2xl border border-gray-100/50 dark:border-[#021F17]">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Duration</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{plan.durationDays} Days</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-[#000F0A]/30 rounded-2xl border border-gray-100/50 dark:border-[#021F17]">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Profit Target</p>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{plan.profitTarget || 10}%</p>
                            </div>
                            <div className="p-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                                <p className="text-xs font-bold text-red-400 uppercase mb-1">Daily Loss</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">{plan.dailyLossLimit || 5}%</p>
                            </div>
                            <div className="p-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                                <p className="text-xs font-bold text-red-400 uppercase mb-1">Max Drawdown</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">{plan.overallDrawdown || 10}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="bg-white dark:bg-[#021F17] rounded-3xl shadow-sm border border-gray-100 dark:border-[#021F17] p-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <CheckCircle size={24} className="text-emerald-500" />
                            Premium Features
                        </h3>
                        {plan.features && plan.features.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.features.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl text-gray-700 dark:text-gray-300 font-medium">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No features listed for this plan.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-[#0F8235] rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20">
                        <h4 className="text-lg font-bold mb-4 opacity-90">Quick Summary</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-white/20 pb-4">
                                <span className="opacity-70">Payout Ratio</span>
                                <span className="font-bold">80/20</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/20 pb-4">
                                <span className="opacity-70">Leverage</span>
                                <span className="font-bold">1:100</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-70">Trading Days</span>
                                <span className="font-bold">No Limit</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#021F17] rounded-3xl p-8 border border-gray-100 dark:border-[#021F17] shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Internal Info</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">ID:</span>
                                <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">{plan._id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Created:</span>
                                <span className="text-gray-600 dark:text-gray-300">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
