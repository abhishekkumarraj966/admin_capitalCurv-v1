'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getNewsStats, getAllNews, deleteNews } from '@/services/newsApi';
import { format } from 'date-fns';
import Image from 'next/image';

export default function NewsManagementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // News State
    const [newsList, setNewsList] = useState<any[]>([]);
    const [newsStats, setNewsStats] = useState<any>(null);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, newsRes] = await Promise.all([
                getNewsStats(),
                getAllNews()
            ]);

            setNewsStats(statsRes.result || statsRes);

            const newsData = newsRes.result?.news || newsRes.result || [];
            setNewsList(Array.isArray(newsData) ? newsData : []);

        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteNews = async (id: string) => {
        if (!confirm('Delete this news article?')) return;
        try {
            await deleteNews(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete news:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News Management</h1>
            </div>

            <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total News', value: newsStats?.totalNews || 0, icon: '📰', color: 'bg-blue-50 text-blue-600' },
                        // Add more stats if API provides them
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#021F17] p-6 rounded-2xl border border-gray-100 dark:border-[#021F17] shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-[#021F17] flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent News</h2>
                        <button
                            onClick={() => router.push('/wp-admin/admin/news-management/create')}
                            className="px-4 py-2 bg-[#0F8235] hover:bg-[#0b6528] text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            + Create News
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-[#021F17]">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Image</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Title</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#021F17]">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                                ) : newsList.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No news found.</td></tr>
                                ) : (
                                    newsList.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/50 transition-colors">
                                            <td className="p-4">
                                                <div className="h-12 w-20 relative rounded-lg overflow-hidden bg-gray-100">
                                                    {item.image ? (
                                                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-gray-900 dark:text-white max-w-[200px] truncate" title={item.title}>{item.title}</td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                                {item.category?.name || item.category || '-'}
                                            </td>
                                            <td className="p-4 text-xs text-gray-500">
                                                {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/wp-admin/admin/news-management/view/${item._id}`)}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/wp-admin/admin/news-management/edit/${item._id}`)}
                                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNews(item._id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>
    );
}
