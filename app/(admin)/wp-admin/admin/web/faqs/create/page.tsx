'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFaq } from '@/services/contentApi';

export default function CreateFaqPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        question: '',
        answer: '',
        category: 'Trust & Transparency'
    });

    const categories = [
        'Trust & Transparency',
        'Challenge & Eligibility FAQs',
        'Funded Account'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createFaq(form);
            router.push('/wp-admin/admin/web/faqs');
        } catch (error) {
            console.error('Failed to create FAQ:', error);
            alert('Failed to create FAQ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create FAQ</h1>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Back
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Question</label>
                        <input
                            type="text"
                            value={form.question}
                            onChange={(e) => setForm({ ...form, question: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Answer</label>
                        <textarea
                            rows={5}
                            value={form.answer}
                            onChange={(e) => setForm({ ...form, answer: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-[#4A3AFF] hover:bg-[#3B2EE0] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Creating...' : 'Create FAQ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
