'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPlan } from '@/services/purchaseApi';
import {
    Trash2,
    Plus,
    Info,
    Coins,
    ShieldAlert,
    Zap,
    Target,
    ArrowLeft,
    CheckCircle2,
    Clock
} from 'lucide-react';

function CreatePlanForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        accountType: (searchParams.get('accountType') as 'Equity' | 'Derivative') || 'Equity',
        price: '',
        accountSize: '',
        durationDays: '30',
        profitTarget: '10',
        dailyLossLimit: '5',
        overallDrawdown: '10',
        features: ['']
    });

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...form.features];
        newFeatures[index] = value;
        setForm({ ...form, features: newFeatures });
    };

    const addFeature = () => {
        setForm({ ...form, features: [...form.features, ''] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = form.features.filter((_, i) => i !== index);
        setForm({ ...form, features: newFeatures });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cleanFeatures = form.features.filter(f => f.trim() !== '');

            await createPlan({
                ...form,
                price: Number(form.price),
                accountSize: Number(form.accountSize),
                durationDays: Number(form.durationDays),
                profitTarget: Number(form.profitTarget),
                dailyLossLimit: Number(form.dailyLossLimit),
                overallDrawdown: Number(form.overallDrawdown),
                features: cleanFeatures
            });

            router.push('/wp-admin/admin/plan-management');
        } catch (error) {
            console.error('Failed to create plan:', error);
            alert('Failed to create plan. Please check if all fields are correct.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 bg-white dark:bg-[#021F17] hover:bg-gray-50 dark:hover:bg-[#000F0A] rounded-xl transition-all border border-gray-100 dark:border-[#021F17] shadow-sm"
                >
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">Create Trading Plan</h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Single Card Setup</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-[#021F17] rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-500/5 border border-gray-100 dark:border-[#021F17] space-y-12">

                    {/* General Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 dark:bg-[#0F8235]/20 rounded-lg flex items-center justify-center text-[#0F8235]">
                                <Zap size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">General Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Type</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 dark:bg-[#000F0A] rounded-2xl border border-gray-100 dark:border-[#021F17]">
                                    {(['Equity', 'Derivative'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setForm({ ...form, accountType: type })}
                                            className={`py-2 text-sm font-black rounded-xl transition-all ${form.accountType === type
                                                ? 'bg-white dark:bg-[#0F8235] text-[#0F8235] dark:text-white shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#000F0A]/30 border border-gray-200 dark:border-[#021F17] rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-[#0F8235] transition-all font-bold"
                                    placeholder="e.g. Master Trader Pro"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700" />

                    {/* Pricing & Limits */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600">
                                <Coins size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pricing & Account Size</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Price (₹)</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-emerald-50/20 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl outline-none focus:bg-white text-emerald-600 font-black"
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Size (₹)</label>
                                <input
                                    type="number"
                                    value={form.accountSize}
                                    onChange={(e) => setForm({ ...form, accountSize: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-indigo-50/20 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl outline-none focus:bg-white text-indigo-600 font-black"
                                    placeholder="Account Size"
                                    required
                                />
                            </div>
                            <div className="space-y-2 text-indigo">
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Validity (Days)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.durationDays}
                                        onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#000F0A]/30 border border-gray-200 dark:border-[#021F17] rounded-2xl outline-none focus:bg-white font-bold"
                                        required
                                    />
                                    <Clock size={16} className="absolute right-5 top-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {form.accountType === 'Derivative' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 rounded-xl bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                    <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1">Profit Goal (%)</label>
                                    <input type="number" value={form.profitTarget} onChange={(e) => setForm({ ...form, profitTarget: e.target.value })} className="w-full bg-transparent outline-none font-black text-lg text-emerald-700" required />
                                </div>
                                <div className="p-4 rounded-xl bg-red-50/30 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                    <label className="block text-[10px] font-black text-red-600 uppercase mb-1">Daily Safety Limit (%)</label>
                                    <input type="number" value={form.dailyLossLimit} onChange={(e) => setForm({ ...form, dailyLossLimit: e.target.value })} className="w-full bg-transparent outline-none font-black text-lg text-red-700" required />
                                </div>
                                <div className="p-4 rounded-xl bg-orange-50/30 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                                    <label className="block text-[10px] font-black text-orange-600 uppercase mb-1">Max Total Loss (%)</label>
                                    <input type="number" value={form.overallDrawdown} onChange={(e) => setForm({ ...form, overallDrawdown: e.target.value })} className="w-full bg-transparent outline-none font-black text-lg text-orange-700" required />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700" />

                    {/* Features */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">
                                    <Info size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Plan Perks & Features</h2>
                            </div>
                            <button type="button" onClick={addFeature} className="text-xs font-black text-[#0F8235] hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all">+ Add Perk</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {form.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 p-1.5 bg-gray-50/50 dark:bg-[#000F0A]/20 rounded-xl border border-gray-100 dark:border-[#021F17] group">
                                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100 dark:border-gray-600">{index + 1}</div>
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        className="flex-1 bg-transparent py-1.5 outline-none font-bold text-gray-700 dark:text-gray-300 placeholder:text-gray-400 text-sm"
                                        placeholder="e.g. 24/7 Support"
                                        required
                                    />
                                    {form.features.length > 1 && (
                                        <button type="button" onClick={() => removeFeature(index)} className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-50 dark:border-[#021F17]">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
                                <Coins className="text-emerald-600" size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Account Price</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">₹{Number(form.price).toLocaleString() || 0}</p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-12 py-4.5 bg-[#0F8235] hover:bg-[#0b6528] text-white rounded-2xl font-black shadow-xl shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Clock className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            <span>{loading ? 'Launching...' : 'Launch Plan Now'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function CreatePlanPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold text-gray-500">Loading your view...</div>}>
            <CreatePlanForm />
        </Suspense>
    );
}
