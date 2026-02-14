'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getFaqs, deleteFaq } from '@/services/contentApi';

export default function FaqsPage() {
    const router = useRouter();
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getFaqs();
            // Adjust depending on actual API response structure
            setFaqs(response.result?.data || response.result || []);
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const filteredFaqs = (faqs || []).filter(faq =>
        filterCategory === 'All' || faq.category === filterCategory
    );

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;
        try {
            await deleteFaq(id);
            fetchFaqs();
        } catch (error) {
            console.error('Failed to delete FAQ:', error);
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Trust & Transparency':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Challenge & Eligibility FAQs':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Funded Account':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ Management</h1>

                <div className="flex items-center gap-3">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="All">All Categories</option>
                        <option value="Trust & Transparency">Trust & Transparency</option>
                        <option value="Challenge & Eligibility FAQs">Challenge & Eligibility FAQs</option>
                        <option value="Funded Account">Funded Account</option>
                    </select>

                    <button
                        onClick={() => router.push('/wp-admin/admin/web/faqs/create')}
                        className="px-4 py-2 bg-[#4A3AFF] hover:bg-[#3B2EE0] text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        + Create FAQ
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Question</th>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Answer</th>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Category</th>
                                <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={4} className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading FAQs...</td></tr>
                            ) : filteredFaqs.length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No FAQs found.</td></tr>
                            ) : (
                                filteredFaqs.map((faq) => (
                                    <tr key={faq._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white max-w-[250px] line-clamp-1" title={faq.question}>
                                                {faq.question}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[300px] line-clamp-1" title={faq.answer}>
                                                {faq.answer}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getCategoryStyles(faq.category)}`}>
                                                {faq.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/wp-admin/admin/web/faqs/view/${faq._id}`)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/wp-admin/admin/web/faqs/edit/${faq._id}`)}
                                                    className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq._id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
