'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getNewsById } from '@/services/newsApi';
import Image from 'next/image';
import { format } from 'date-fns';

export default function ViewNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params
    const { id } = use(params);

    const [news, setNews] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await getNewsById(id);
                setNews(response.result || response);
            } catch (error) {
                console.error('Failed to fetch news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!news) return <div className="p-8 text-center text-red-500">News not found</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={() => router.push(`/wp-admin/admin/news-management/edit/${id}`)}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                >
                    Edit Article
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden max-w-4xl mx-auto">
                {news.image && (
                    <div className="relative w-full h-64 sm:h-96">
                        <Image src={news.image} alt={news.title} fill className="object-cover" />
                    </div>
                )}
                <div className="p-8 space-y-6">
                    <div>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {news.category?.name || news.category}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{news.title}</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            {news.createdAt ? format(new Date(news.createdAt), 'MMMM d, yyyy') : ''}
                        </p>
                    </div>

                    <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: news.content }}
                    />
                </div>
            </div>
        </div>
    );
}
