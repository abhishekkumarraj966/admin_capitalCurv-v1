'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getFaqById } from '@/services/contentApi';

export default function ViewFaqPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();


    const { id } = use(params);

    const [faq, setFaq] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaq = async () => {
            try {
                const response = await getFaqById(id);
                setFaq(response.result || response);
            } catch (error) {
                console.warn('[ViewPage] Direct fetch failed. Trying fallback...', error);
                try {
                    const { getFaqs } = await import('@/services/contentApi');
                    const res = await getFaqs();
                    const list = res.result?.data || res.result || res || [];
                    const found = Array.isArray(list) ? list.find((f: any) => f._id === id || f.id === id) : null;
                    if (found) {
                        setFaq(found);
                        return;
                    }
                } catch (fallbackError) {
                    console.error('[ViewPage] Fallback failed:', fallbackError);
                }
                console.error('Failed to fetch FAQ:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaq();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!faq) return <div className="p-8 text-center text-gray-500">FAQ not found</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">View FAQ</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => router.push(`/wp-admin/admin/web/faqs/edit/${id}`)}
                        className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                    >
                        Edit
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 max-w-3xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                            {faq.category || 'General'}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {faq.question}
                        </h2>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                        <p className="whitespace-pre-wrap">{faq.answer}</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
