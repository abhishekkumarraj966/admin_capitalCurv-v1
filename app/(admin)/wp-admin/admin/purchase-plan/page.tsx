'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPurchases } from '@/services/purchaseApi';
import { getUserStages, advanceUserStage, getStageConfigs } from '@/services/stagesApi';
import {
    TrendingUp,
    Calendar,
    Search,
    Users,
    ShoppingBag,
    Target,
    Zap,
    AlertCircle,
    X,
    CheckCircle
} from 'lucide-react';
import { format, isToday, isWithinInterval, subDays, startOfDay, endOfDay } from 'date-fns';

export default function PurchasePlanPage() {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'all' | 'today' | '7d' | '30d'>('all');
    const [accountType, setAccountType] = useState<'all' | 'Equity' | 'Derivative'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [userStageData, setUserStageData] = useState<any>(null);
    const [stageLoading, setStageLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [allUserStages, setAllUserStages] = useState<any[]>([]);

    const fetchUserStage = async () => {
        if (!selectedPurchase?.user?._id) return;
        setStageLoading(true);
        try {
            // We already have all stages suitable for the table, but for specific modal details we might want a fresh fetch or just find it.
            // For now, let's keep the existing specific fetch for the modal to ensure latest data.
            const res = await getUserStages();
            const allStages = res.result || res.data || res || [];
            // Find stage for this specific user
            const userStage = Array.isArray(allStages) ? allStages.find((s: any) => s.userId === selectedPurchase.user._id) : null;
            setUserStageData(userStage || null);
        } catch (error) {
            console.error('Failed to fetch user stage:', error);
        } finally {
            setStageLoading(false);
        }
    };

    const handleAdvanceStage = async () => {
        if (!userStageData || !selectedPurchase?.user?._id) return;
        setActionLoading(true);
        try {
            const configsRes = await getStageConfigs();
            const configs = configsRes.result || configsRes.data || configsRes || [];
            const nextStage = configs.find((c: any) => c.stageNumber === userStageData.stageNumber + 1);

            if (nextStage) {
                await advanceUserStage({
                    userId: selectedPurchase.user._id,
                    stageId: nextStage._id
                });
                await fetchUserStage(); // Refresh modal data

                // Refresh table data
                const stagesRes = await getUserStages({ limit: 2000 });
                const stagesData = stagesRes.result?.data || stagesRes.result || [];
                setAllUserStages(Array.isArray(stagesData) ? stagesData : []);
            } else {
                alert('No higher stage configuration found.');
            }
        } catch (error) {
            console.error('Failed to advance stage:', error);
            alert('Failed to advance stage. User might not meet criteria or API error.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleInitializeStage = async () => {
        if (!selectedPurchase?.user?._id) return;
        setActionLoading(true);
        try {
            const configsRes = await getStageConfigs();
            const configs = configsRes.result || configsRes.data || configsRes || [];
            const stage1 = configs.find((c: any) => c.stageNumber === 1);

            if (stage1) {
                await advanceUserStage({
                    userId: selectedPurchase.user._id,
                    stageId: stage1._id
                });
                await fetchUserStage(); // Refresh modal data

                // Refresh table data
                const stagesRes = await getUserStages({ limit: 2000 });
                const stagesData = stagesRes.result?.data || stagesRes.result || [];
                setAllUserStages(Array.isArray(stagesData) ? stagesData : []);
            } else {
                alert('Stage 1 configuration not found.');
            }
        } catch (error) {
            console.error('Failed to initialize stage:', error);
            alert('Failed to initialize stage.');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [purchasesRes, stagesRes] = await Promise.all([
                    getPurchases(),
                    getUserStages({ limit: 2000 })
                ]);

                const purchasesData = purchasesRes.result?.data || purchasesRes.result?.purchases || purchasesRes.data || (Array.isArray(purchasesRes.result) ? purchasesRes.result : []);
                setPurchases(Array.isArray(purchasesData) ? purchasesData : []);

                const stagesData = stagesRes.result?.data || stagesRes.result || [];
                setAllUserStages(Array.isArray(stagesData) ? stagesData : []);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch Stage Data when modal opens
    useEffect(() => {
        if (isModalOpen && selectedPurchase?.user?._id) {
            fetchUserStage();
        } else {
            setUserStageData(null);
        }
    }, [isModalOpen, selectedPurchase]);

    // Filtered Purchases
    const filteredPurchases = useMemo(() => {
        return purchases.filter((purchase: any) => {
            // Debug Log
            console.log('Filtering Purchase:', {
                id: purchase._id,
                plan: purchase.plan,
                accountType: purchase.plan?.accountType,
                filterState: accountType
            });

            const purchaseDate = new Date(purchase.createdAt);
            const now = new Date();
            let matchesTime = true;

            if (timeRange === 'today') {
                matchesTime = isToday(purchaseDate);
            } else if (timeRange === '7d') {
                matchesTime = isWithinInterval(purchaseDate, {
                    start: startOfDay(subDays(now, 7)),
                    end: endOfDay(now)
                });
            } else if (timeRange === '30d') {
                matchesTime = isWithinInterval(purchaseDate, {
                    start: startOfDay(subDays(now, 30)),
                    end: endOfDay(now)
                });
            }

            // Case-insensitive comparison and robust matching
            const dataAccountType = (purchase.plan?.accountType || '').toLowerCase();
            const filterAccountType = accountType.toLowerCase();

            // Check for exact match OR if data starts with filter (handles Derivative vs Derivatives)
            const inAccountType = accountType === 'all' ||
                dataAccountType === filterAccountType ||
                dataAccountType.includes(filterAccountType) ||
                filterAccountType.includes(dataAccountType);

            const name = `${purchase.user?.firstName || ''} ${purchase.user?.lastName || ''}`.toLowerCase();
            const userId = (purchase.user?.userId || '').toLowerCase();
            const accountNo = (purchase.accountNo || '').toLowerCase();
            const q = searchQuery.toLowerCase();

            const matchesSearch = name.includes(q) || userId.includes(q) || accountNo.includes(q);

            return matchesTime && inAccountType && matchesSearch;
        });
    }, [purchases, timeRange, accountType, searchQuery]);

    const totalRevenue = useMemo(() => {
        return filteredPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    }, [filteredPurchases]);

    const activeUsers = useMemo(() => {
        const users = new Set(filteredPurchases.map(p => p.user?._id));
        return users.size;
    }, [filteredPurchases]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Purchase History</h1>
                    <p className="text-gray-500 font-bold text-sm mt-1 uppercase tracking-widest">Real-time Order Tracking</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white dark:bg-[#021F17] p-1 rounded-xl border border-gray-100 dark:border-[#021F17] shadow-sm">
                        {([
                            { label: 'All', value: 'all' },
                            { label: 'Today', value: 'today' },
                            { label: '7 Days', value: '7d' },
                            { label: '30 Days', value: '30d' }
                        ] as const).map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setTimeRange(range.value)}
                                className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${timeRange === range.value
                                    ? 'bg-[#0F8235] text-white shadow-lg shadow-emerald-500/30'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#000F0A]'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#021F17] p-6 rounded-[2rem] border border-gray-100 dark:border-[#021F17] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-[#4A3AFF]">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#021F17] p-6 rounded-[2rem] border border-gray-100 dark:border-[#021F17] shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
                            <ShoppingBag size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Sales</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{filteredPurchases.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#021F17] p-6 rounded-[2rem] border border-gray-100 dark:border-[#021F17] shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Customers</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{activeUsers}</p>
                    </div>
                </div>
            </div>

            {/* Table Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex bg-white dark:bg-[#021F17] p-1 rounded-xl border border-gray-100 dark:border-[#021F17] shadow-sm">
                        {([
                            { label: 'All', value: 'all' },
                            { label: 'Equity', value: 'Equity' },
                            { label: 'Derivatives', value: 'Derivative' }
                        ] as const).map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setAccountType(type.value as any)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${accountType === type.value
                                    ? 'bg-[#0F8235] text-white shadow-lg shadow-emerald-500/30'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#000F0A]'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0F8235] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, ID or account..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#021F17] border border-gray-100 dark:border-[#021F17] rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-[#0F8235] transition-all font-bold text-sm"
                    />
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-[#021F17] rounded-[2.5rem] border border-gray-100 dark:border-[#021F17] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-[#000F0A]/50">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Info</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Details</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Package Info</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Phase</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Status</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#000F0A]/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="p-6"><div className="h-12 bg-gray-100 dark:bg-[#000F0A]/50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredPurchases.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-gray-500 font-bold">No purchase records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPurchases.map((purchase: any) => {
                                    const userStage = allUserStages.find((s: any) => s.user?._id === purchase.user?._id || s.userId === purchase.user?._id);
                                    let phaseLabel = 'Inactive';
                                    let phaseColor = 'bg-gray-100 text-gray-600';

                                    if (userStage) {
                                        if (userStage.step === 1) {
                                            phaseLabel = 'Phase 1';
                                            phaseColor = 'bg-blue-100 text-blue-700';
                                        } else if (userStage.step === 2) {
                                            phaseLabel = 'Phase 2';
                                            phaseColor = 'bg-purple-100 text-purple-700';
                                        } else if (userStage.step === 3) {
                                            phaseLabel = 'Live Account';
                                            phaseColor = 'bg-emerald-100 text-emerald-700';
                                        }
                                    }

                                    return (
                                        <tr
                                            key={purchase._id}
                                            onClick={() => {
                                                setSelectedPurchase(purchase);
                                                setIsModalOpen(true);
                                            }}
                                            className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/50 transition-colors group cursor-pointer"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[#4A3AFF] font-black text-sm">
                                                        {(purchase.user?.firstName?.[0] || 'U')}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-gray-900 dark:text-white">
                                                            {purchase.user?.firstName} {purchase.user?.lastName}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ID: {purchase.user?.userId || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-bold text-gray-700 dark:text-gray-200 font-mono tracking-wider">
                                                    {purchase.accountNo}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${purchase.plan?.accountType === 'Equity'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {purchase.plan?.accountType || 'Custom'}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-black text-gray-900 dark:text-white mt-1.5 truncate max-w-[150px]">
                                                    {purchase.plan?.name || 'Deleted Plan'}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${phaseColor}`}>
                                                    {phaseLabel}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-md font-black text-emerald-600 dark:text-emerald-400">
                                                    ₹{purchase.totalAmount?.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${purchase.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                    purchase.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {purchase.status}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                                    {purchase.createdAt ? format(new Date(purchase.createdAt), 'MMM dd, yyyy') : '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stage Detail Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#021F17] w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-[#021F17] overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-50 dark:border-[#021F17] flex justify-between items-center bg-gray-50/50 dark:bg-[#000F0A]/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-none">Trading Stage Profile</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Managing User: <span className="text-[#0F8235]">{selectedPurchase?.user?.firstName} {selectedPurchase?.user?.lastName}</span></p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white dark:hover:bg-[#000F0A] rounded-xl transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto max-h-[70vh]">
                            {stageLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-gray-400 font-bold">Synchronizing stage data...</p>
                                </div>
                            ) : userStageData ? (
                                <div className="space-y-8">
                                    {/* Stage Badge & Info */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-[#4A3AFF]">
                                                <Target size={32} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Current Trading Stage</div>
                                                <div className="text-3xl font-black text-gray-900 dark:text-white">Stage {userStageData.stageNumber}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Level: Professional</span>
                                            <p className="text-[10px] text-gray-400 font-bold mt-2">Active Since: {userStageData.createdAt ? format(new Date(userStageData.createdAt), 'MMM yyyy') : 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Trading Goals Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                                                    <TrendingUp size={18} />
                                                </div>
                                                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Profit Target</span>
                                            </div>
                                            <p className="text-2xl font-black text-emerald-600">{userStageData.profitTarget}%</p>
                                        </div>

                                        <div className="p-5 rounded-3xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
                                                    <AlertCircle size={18} />
                                                </div>
                                                <span className="text-xs font-black text-red-700 uppercase tracking-wider">Daily Loss Limit</span>
                                            </div>
                                            <p className="text-2xl font-black text-red-600">{userStageData.dailyLossLimit}%</p>
                                        </div>

                                        <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
                                                    <Zap size={18} />
                                                </div>
                                                <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Overall Drawdown</span>
                                            </div>
                                            <p className="text-2xl font-black text-amber-600">{userStageData.overallDrawdown}%</p>
                                        </div>

                                        <div className="p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-[#4A3AFF]">
                                                    <Calendar size={18} />
                                                </div>
                                                <span className="text-xs font-black text-[#4A3AFF] uppercase tracking-wider">Min Trading Days</span>
                                            </div>
                                            <p className="text-2xl font-black text-[#4A3AFF]">{userStageData.minTradingDays} Days</p>
                                        </div>
                                    </div>

                                    {/* Action Banner */}
                                    <div className="p-6 bg-gray-900 rounded-[2rem] text-white flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/10 rounded-2xl">
                                                <CheckCircle size={24} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Qualified for Next Stage?</p>
                                                <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">All criteria met</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAdvanceStage}
                                            disabled={actionLoading}
                                            className="px-6 py-3 bg-[#4A3AFF] hover:bg-[#3B2EE0] disabled:bg-indigo-400 rounded-2xl text-xs font-black transition-all flex items-center gap-2"
                                        >
                                            {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                            Advance to {userStageData.stageNumber + 1}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No active stage config found</h3>
                                        <p className="text-gray-400 text-sm mt-1">This user hasn't initialized their trading stages yet.</p>
                                    </div>
                                    <button
                                        onClick={handleInitializeStage}
                                        disabled={actionLoading}
                                        className="text-xs font-black text-[#4A3AFF] uppercase tracking-widest hover:underline mt-4 flex items-center gap-2 mx-auto disabled:text-indigo-300"
                                    >
                                        {actionLoading && <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
                                        Initialize Stage 1
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
