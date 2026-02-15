'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNews, getNewsCategories, createNewsCategory } from '@/services/newsApi';
import RichTextEditor from '@/components/RichTextEditor';

export default function CreateNewsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [form, setForm] = useState({
        title: '',
        content: '',
        category: '', // ID
        image: null as File | null,
        tags: ''
    });

    const fetchCategories = async () => {
        try {
            const response = await getNewsCategories();
            const catsData = response.result?.categories || response.result || [];
            setCategories(Array.isArray(catsData) ? catsData : []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let categoryId = form.category;

            // Handle inline category creation
            if (isCreatingCategory) {
                if (!newCategoryName.trim()) {
                    alert('Please enter a category name');
                    setLoading(false);
                    return;
                }
                const catRes = await createNewsCategory({ name: newCategoryName });
                // Assuming response structure: { success: true, result: { _id: "...", name: "..." } }
                const newCat = catRes.result || catRes;
                categoryId = newCat._id;
            } else if (!categoryId) {
                alert('Please select a category');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('content', form.content);
            formData.append('category', categoryId);
            if (form.image) {
                formData.append('image', form.image);
            }

            await createNews(formData);
            router.push('/wp-admin/admin/news-management');
        } catch (error) {
            console.error('Failed to create news:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create News Article</h1>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Back
                </button>
            </div>

            <div className="rounded-2xl shadow-sm border p-6 max-w-4xl mx-auto" style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingCategory(!isCreatingCategory);
                                        setForm({ ...form, category: '' });
                                        setNewCategoryName('');
                                    }}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                >
                                    {isCreatingCategory ? 'Select Existing' : '+ Create New'}
                                </button>
                            </div>

                            {isCreatingCategory ? (
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Enter new category name"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    required={isCreatingCategory}
                                />
                            ) : (
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    required={!isCreatingCategory}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Content</label>
                        <RichTextEditor
                            content={form.content}
                            onChange={(content) => setForm({ ...form, content })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-[#0F8235] hover:bg-[#0b6528] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Creating...' : 'Create News'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
