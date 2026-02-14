'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPlans, getAddons, getPurchases, getCollegeDiscounts, getCollegeDiscountStats, deletePlan } from '@/services/purchaseApi';
import { format } from 'date-fns';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';

export default function PlanManagementPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'plans' | 'addons' | 'purchases' | 'discounts'>('plans');
    const [planCategory, setPlanCategory] = useState<'Equity' | 'Derivative'>('Equity');
    const [purchaseTimeRange, setPurchaseTimeRange] = useState<'all' | 'today' | '7d' | '30d'>('all');
    const [loading, setLoading] = useState(false);

    // Data states
    const [plans, setPlans] = useState<any[]>([]);
    const [addons, setAddons] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [discountStats, setDiscountStats] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'plans') {
                const res = await getPlans();
                console.log('Plans API Res:', res);
                let data = res.result?.plans || res.result || res.data || res;
                setPlans(Array.isArray(data) ? data : []);
            } else if (activeTab === 'addons') {
                const res = await getAddons();
                console.log('Addons API Res:', res);
                let data = res.result?.addons || res.result || res.data || res;
                setAddons(Array.isArray(data) ? data : []);
            } else if (activeTab === 'purchases') {
                const res = await getPurchases();
                console.log('Purchases API Res:', res);
                // Based on user response: { result: { data: [...] } }
                let data = res.result?.data || res.result?.purchases || res.result || res.data || res;
                setPurchases(Array.isArray(data) ? data : []);
            } else if (activeTab === 'discounts') {
                const [discRes, statsRes] = await Promise.all([
                    getCollegeDiscounts(),
                    getCollegeDiscountStats()
                ]);
                console.log('Discounts API Res:', discRes);
                let data = discRes.result?.discounts || discRes.result || discRes.data || discRes;
                setDiscounts(Array.isArray(data) ? data : []);
                setDiscountStats(statsRes.result || statsRes.data || null);
            }
        } catch (error) {
            console.error(`Failed to fetch ${activeTab}:`, error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeletePlan = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            await deletePlan(id);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Failed to delete plan:', error);
            alert('Failed to delete plan');
        }
    };

    const filteredPlans = plans.filter(plan => plan.accountType === planCategory);

    const filteredPurchases = purchases.filter(purchase => {
        if (purchaseTimeRange === 'all') return true;
        const purchaseDate = new Date(purchase.createdAt);
        const now = new Date();
        if (purchaseTimeRange === 'today') {
            return purchaseDate.toDateString() === now.toDateString();
        }
        if (purchaseTimeRange === '7d') {
            const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
            return purchaseDate >= sevenDaysAgo;
        }
        if (purchaseTimeRange === '30d') {
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
            return purchaseDate >= thirtyDaysAgo;
        }
        return true;
    });

    const totalRevenue = filteredPurchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
    const totalSales = filteredPurchases.length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plan & Purchase Management</h1>
                {activeTab === 'plans' && (
                    <button
                        onClick={() => router.push('/wp-admin/admin/plan-management/create')}
                        className="px-4 py-2 bg-[#0F8235] hover:bg-[#0b6528] text-white text-sm font-bold rounded-lg transition-all shadow-md flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Plan
                    </button>
                )}
            </div>

            {/* Main Tabs */}
            <div className="flex flex-col gap-6">
                <div className="flex space-x-1 bg-gray-100 dark:bg-[#021F17] p-1 rounded-xl w-fit">
                    {(['plans', 'addons', 'purchases', 'discounts'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab
                                ? 'bg-white dark:bg-[#0F8235] text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Sub-tabs for Plans Category */}
                {activeTab === 'plans' && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex space-x-4 border-b border-gray-100 dark:border-[#021F17]">
                            {(['Equity', 'Derivative'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setPlanCategory(cat)}
                                    className={`pb-3 px-1 text-sm font-bold transition-all relative ${planCategory === cat
                                        ? 'text-[#0F8235]'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {cat}
                                    {planCategory === cat && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F8235] rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => router.push(`/wp-admin/admin/plan-management/create?accountType=${planCategory}`)}
                            className="bg-[#0F8235] hover:bg-[#0b6528] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add {planCategory} Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="">
                {activeTab === 'plans' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full p-12 text-center text-gray-500 bg-white dark:bg-[#021F17] rounded-2xl border border-gray-100 dark:border-[#021F17]">
                                Loading plans...
                            </div>
                        ) : filteredPlans.length === 0 ? (
                            <div className="col-span-full p-12 text-center text-gray-500 bg-white dark:bg-[#021F17] rounded-2xl border border-gray-100 dark:border-[#021F17]">
                                <div className="mb-4 text-lg font-bold">No {planCategory} plans found</div>
                                <button
                                    onClick={() => router.push(`/wp-admin/admin/plan-management/create?accountType=${planCategory}`)}
                                    className="text-[#0F8235] hover:underline font-bold"
                                >
                                    Click here to create your first {planCategory} plan
                                </button>
                            </div>
                        ) : (
                            filteredPlans.map((plan: any) => (
                                <div key={plan._id} className="group bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${plan.accountType === 'Equity' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {plan.accountType}
                                                </span>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 mb-1">{plan.name}</h3>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => router.push(`/wp-admin/admin/plan-management/view/${plan._id}`)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => router.push(`/wp-admin/admin/plan-management/edit/${plan._id}`)} className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Edit">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDeletePlan(plan._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Account Size</span>
                                                <span className="font-bold text-gray-900 dark:text-white">₹{plan.accountSize?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Account Price</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">₹{plan.price?.toLocaleString()}</span>
                                            </div>
                                            {plan.accountType !== 'Equity' && (
                                                <>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">Profit Target</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{plan.profitTarget || '10'}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">Max Loss</span>
                                                        <span className="font-bold text-red-500">{plan.maxLoss || '5'}%</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Plan Features */}
                                        {plan.features && plan.features.length > 0 && (
                                            <div className="mb-6 space-y-2 border-t pt-4 border-gray-50 dark:border-gray-700/50">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Features</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {plan.features.slice(0, 3).map((feat: string, i: number) => (
                                                        <span key={i} className="text-[10px] py-1 px-2 bg-gray-50 dark:bg-[#000F0A]/50 text-gray-600 dark:text-gray-300 rounded-md truncate max-w-full">
                                                            ✓ {feat}
                                                        </span>
                                                    ))}
                                                    {plan.features.length > 3 && (
                                                        <span className="text-[10px] py-1 px-2 text-gray-400">+{plan.features.length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {plan.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className="text-xs text-gray-400">{plan.durationDays} Days Duration</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'addons' && (
                    <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden">
                        <div className="overflow-x-auto">
                            <div className="p-4 border-b border-gray-100 dark:border-[#021F17] flex justify-between items-center">
                                <h3 className="font-bold text-lg">Add-ons</h3>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-[#000F0A]/50">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {loading ? (
                                        <tr><td colSpan={3} className="p-8 text-center">Loading...</td></tr>
                                    ) : addons.length === 0 ? (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-500">No addons found.</td></tr>
                                    ) : (
                                        addons.map((addon: any) => (
                                            <tr key={addon._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/30 transition-colors">
                                                <td className="p-4 font-bold text-gray-900 dark:text-white">{addon.name}</td>
                                                <td className="p-4 text-gray-600 dark:text-gray-300">{addon.description}</td>
                                                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">₹{addon.price}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'purchases' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex space-x-2 bg-gray-100 dark:bg-[#021F17] p-1 rounded-xl">
                                {([
                                    { label: 'All Time', value: 'all' },
                                    { label: 'Today', value: 'today' },
                                    { label: 'Last 7 Days', value: '7d' },
                                    { label: 'Last 30 Days', value: '30d' }
                                ] as const).map((range) => (
                                    <button
                                        key={range.value}
                                        onClick={() => setPurchaseTimeRange(range.value)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${purchaseTimeRange === range.value
                                            ? 'bg-white dark:bg-[#0F8235] text-[#0F8235] dark:text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-white dark:bg-[#021F17] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] flex flex-col items-end min-w-[140px]">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Sales</span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{totalSales}</span>
                                </div>
                                <div className="bg-[#0F8235] p-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex flex-col items-end min-w-[160px] text-white">
                                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Total Revenue</span>
                                    <span className="text-xl font-black">₹{totalRevenue.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-[#000F0A]/50">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">User ID</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Account No</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Account Type</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Account Size</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total Amount</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {loading ? (
                                            <tr><td colSpan={8} className="p-8 text-center">Loading...</td></tr>
                                        ) : filteredPurchases.length === 0 ? (
                                            <tr><td colSpan={8} className="p-8 text-center text-gray-500">No purchases found.</td></tr>
                                        ) : (
                                            filteredPurchases.map((purchase: any) => (
                                                <tr key={purchase._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {purchase.user?.firstName} {purchase.user?.lastName}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {purchase.user?.userId}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                                                        {purchase.accountNo}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${purchase.plan?.accountType === 'Equity' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                            {purchase.plan?.accountType || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                                                        ₹{purchase.plan?.accountSize?.toLocaleString() || '0'}
                                                    </td>
                                                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                                                        ₹{purchase.totalAmount?.toLocaleString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${purchase.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                            purchase.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {purchase.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-xs text-gray-500">
                                                        {purchase.createdAt ? format(new Date(purchase.createdAt), 'MMM dd, HH:mm') : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'discounts' && (
                    <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden space-y-6 p-6">
                        {/* Discount Stats */}
                        {discountStats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase">Total Discounts Used</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-white mt-1">{discountStats.totalUsed || 0}</p>
                                </div>
                            </div>
                        )}

                        <h3 className="font-bold text-lg">College Discounts</h3>
                        <div className="overflow-x-auto border rounded-xl dark:border-gray-700/50">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-[#000F0A]/50">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Code</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">College</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Discount %</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Usage Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-8 text-center">Loading...</td></tr>
                                    ) : discounts.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">No discounts found.</td></tr>
                                    ) : (
                                        discounts.map((discount: any) => (
                                            <tr key={discount._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/30 transition-colors">
                                                <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">{discount.code}</td>
                                                <td className="p-4 text-gray-900 dark:text-white">{discount.collegeName}</td>
                                                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{discount.percentage}%</td>
                                                <td className="p-4 text-gray-600 dark:text-gray-300">{discount.usageCount || 0}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
