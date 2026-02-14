'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogs, getStats, deleteBlog } from '@/services/blogApi';
import { format } from 'date-fns';

export default function BlogListPage() {
    const [stats, setStats] = useState<any>(null);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, blogsData] = await Promise.all([
                getStats(),
                getBlogs()
            ]);
            setStats(statsData.result || statsData);
            setBlogs(blogsData.result || blogsData);
        } catch (error) {
            console.error('Failed to fetch blog data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this blog?')) {
            try {
                await deleteBlog(id);
                fetchData(); // Refresh list
            } catch (error) {
                console.error('Failed to delete blog:', error);
                alert('Failed to delete blog');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your blog posts and categories.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/wp-admin/admin/web/blogs/categories"
                        className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        Manage Categories
                    </Link>
                    <Link
                        href="/wp-admin/admin/web/blogs/create"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Blog
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Blogs</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.totalBlogs || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Blogs</h3>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats?.activeBlogs || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Categories</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats?.totalCategories || 0}</p>
                </div>
            </div>

            {/* Blogs List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                                <th className="p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                <th className="p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Author</th>
                                <th className="p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                <th className="p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {blogs.length > 0 ? (
                                blogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{blog.title}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                                {blog.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                            {blog.authorName || 'Admin'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {blog.createdAt ? format(new Date(blog.createdAt), 'MMM d, yyyy') : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/wp-admin/admin/web/blogs/${blog._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No blogs found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
