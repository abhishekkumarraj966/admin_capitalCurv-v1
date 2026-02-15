'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    getUserStages,
    getStageConfigs
} from '@/services/stagesApi';
import {
    Target,
    RotateCcw,
    CheckCircle,
    Search,
    TrendingUp,
    AlertCircle,
    Zap,
    Users,
    ShoppingBag,
    Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import UserTradeHistoryModal from './UserTradeHistoryModal';

export default function StagesManagementPage() {
    const [stages, setStages] = useState<any[]>([]);
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'phase1' | 'phase2' | 'live'>('phase1');
    const [accountType, setAccountType] = useState<'All' | 'Equity' | 'Derivatives'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStage, setSelectedStage] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stagesRes, configsRes] = await Promise.all([
                getUserStages({ limit: 2000 }),
                getStageConfigs()
            ]);

            const stagesData = stagesRes.result?.data || stagesRes.result || [];
            const configsData = configsRes.result || configsRes.data || configsRes || [];

            setStages(Array.isArray(stagesData) ? stagesData : []);
            setConfigs(Array.isArray(configsData) ? configsData : []);
        } catch (error) {
            console.error('Failed to fetch stages data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    const filteredStages = useMemo(() => {
        let currentStep = 1;
        if (activeTab === 'phase2') currentStep = 2;
        if (activeTab === 'live') currentStep = 3;

        return stages.filter((stage: any) => {
            const matchesStep = stage.step === currentStep;

            const name = `${stage.user?.firstName || ''} ${stage.user?.lastName || ''}`.toLowerCase();
            const userId = (stage.user?.userId || '').toLowerCase();
            const matchesSearch = name.includes(searchQuery.toLowerCase()) || userId.includes(searchQuery.toLowerCase());

            let matchesType = true;
            if (accountType !== 'All') {
                if (accountType === 'Derivatives') {
                    matchesType = (stage.accountType || '').toLowerCase().includes('derivative');
                } else {
                    matchesType = stage.accountType === accountType;
                }
            }

            return matchesStep && matchesSearch && matchesType;
        });
    }, [stages, activeTab, searchQuery, accountType]);

    const stats = useMemo(() => {
        const total = filteredStages.length;
        const passed = filteredStages.filter(s => s.status === 'Passed').length;
        const failed = filteredStages.filter(s => s.status === 'Failed').length;
        return { total, passed, failed };
    }, [filteredStages]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Stage Management</h1>
                    <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Monitor User Progress & Risk</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0F8235] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#021F17] border border-[#021F17] text-white rounded-2xl outline-none focus:ring-2 focus:ring-[#0F8235] transition-all font-bold text-sm placeholder-gray-600"
                    />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-[#021F17] rounded-xl w-fit border border-[#0F8235]/20">
                {[
                    { id: 'phase1', label: 'Phase 1', icon: Target },
                    { id: 'phase2', label: 'Phase 2', icon: TrendingUp },
                    { id: 'live', label: 'Live Account', icon: Zap },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                            ? 'bg-[#0F8235] text-white shadow-lg shadow-emerald-900/40'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters & Actions Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-[#021F17] p-2 rounded-xl border border-[#0F8235]/20 w-fit">
                {['All', 'Equity', 'Derivatives'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setAccountType(type as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${accountType === type
                            ? 'bg-[#0F8235] text-white border-[#0F8235] shadow-lg shadow-emerald-900/40'
                            : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Stats Cards for Current View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#021F17] p-6 rounded-[2rem] border border-gray-800/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} className="text-[#4A3AFF]" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total {activeTab === 'live' ? 'Live' : 'Assessment'} Users</p>
                        <p className="text-4xl font-black text-white mt-2">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-[#021F17] p-6 rounded-[2rem] border border-gray-800/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle size={80} className="text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Qualified / Passed</p>
                        <p className="text-4xl font-black text-white mt-2">{stats.passed}</p>
                    </div>
                </div>

                <div className="bg-[#021F17] p-6 rounded-[2rem] border border-gray-800/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle size={80} className="text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Failed / Breached</p>
                        <p className="text-4xl font-black text-white mt-2">{stats.failed}</p>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-[#021F17] rounded-[2.5rem] border border-gray-800/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Details</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance Metrics</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-6"><div className="h-16 bg-gray-800/50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredStages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
                                        <p className="text-gray-400 font-bold">No users found in this stage.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStages.map((stage: any) => (
                                    <tr
                                        key={stage._id}
                                        onClick={() => setSelectedStage(stage)}
                                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                                    >
                                        {/* User Profile */}
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#0F8235]/20 flex items-center justify-center text-[#0F8235] font-black text-sm border border-[#0F8235]/30">
                                                    {(stage.user?.firstName?.[0] || 'U')}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white">
                                                        {stage.user?.firstName} {stage.user?.lastName}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">ID: {stage.user?.userId || 'N/A'}</div>
                                                    <div className="text-[10px] text-gray-600 font-medium mt-0.5">{stage.user?.mobileNumber}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Account Details */}
                                        <td className="p-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${stage.accountType === 'Equity' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                        }`}>
                                                        {stage.accountType}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Account Size</p>
                                                    <p className="text-sm font-bold text-white font-mono">₹{stage.accountSize?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Performance Metrics */}
                                        <td className="p-6">
                                            <div className="grid grid-cols-2 gap-4 min-w-[200px]">
                                                {/* Profit Target */}
                                                <div>
                                                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Profit Target</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-sm font-black text-white">{stage.currentProfit}%</span>
                                                        <span className="text-[10px] text-gray-500">/ {stage.profitTarget}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-gray-800 rounded-full mt-1">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${Math.min((stage.currentProfit / stage.profitTarget) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Daily Loss */}
                                                <div>
                                                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Daily Loss</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`text-sm font-black ${stage.currentDailyLoss > stage.dailyLossLimit ? 'text-red-500' : 'text-white'}`}>
                                                            {stage.currentDailyLoss}%
                                                        </span>
                                                        <span className="text-[10px] text-gray-500">/ {stage.dailyLossLimit}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-gray-800 rounded-full mt-1">
                                                        <div
                                                            className={`h-full rounded-full ${stage.currentDailyLoss > stage.dailyLossLimit ? 'bg-red-500' : 'bg-white/50'}`}
                                                            style={{ width: `${Math.min((stage.currentDailyLoss / stage.dailyLossLimit) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Overall Drawdown */}
                                                <div className="col-span-2">
                                                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Max Drawdown</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-sm font-black text-white">{stage.currentOverallLoss}%</span>
                                                        <span className="text-[10px] text-gray-500">/ {stage.overallLossLimit}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${stage.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                stage.status === 'Passed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {stage.status}
                                            </span>
                                            <div className="mt-2 text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                                <Calendar size={10} />
                                                Expiry: {stage.expiryDate ? format(new Date(stage.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Trade History Modal */}
            {selectedStage && (
                <UserTradeHistoryModal
                    stage={selectedStage}
                    onClose={() => setSelectedStage(null)}
                />
            )}
        </div>
    );
}
