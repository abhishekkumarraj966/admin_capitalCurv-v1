'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSections, createBlog, createSection, deleteSection } from '@/services/blogApi';
import RichTextEditor from '@/components/RichTextEditor';

export default function CreateBlogPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getSections();
                setCategories(data.result?.data || data.result || data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !excerpt || (!categoryId && !isCreatingCategory) || (isCreatingCategory && !newCategoryName) || !content) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            let finalCategoryId = categoryId;

            if (isCreatingCategory) {
                const newCat = await createSection({ name: newCategoryName });
                finalCategoryId = newCat.result?._id || newCat._id;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('excerpt', excerpt);
            formData.append('category', finalCategoryId);
            formData.append('content', content);
            formData.append('status', status);
            if (image) {
                formData.append('coverImage', image);
            }

            await createBlog(formData);
            router.push('/wp-admin/admin/web/blogs');
        } catch (error) {
            console.error('Failed to create blog:', error);
            alert('Failed to create blog');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryDelete = async () => {
        if (!categoryId) return;
        
        const categoryToDelete = categories.find(c => c._id === categoryId);
        if (!categoryToDelete) return;

        if (!confirm(`Are you sure you want to delete the category "${categoryToDelete.name}"?`)) {
            return;
        }

        setLoading(true);
        try {
            await deleteSection(categoryId);
            setCategoryId('');
            // Refresh categories
            const data = await getSections();
            setCategories(data.result?.data || data.result || data);
            alert('Category deleted successfully');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete category';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href="/wp-admin/admin/web/blogs" className="hover:text-emerald-600 transition-colors">Blogs</Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-gray-300">Create</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Blog</h1>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Blog Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter blog title"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category <span className="text-red-500">*</span>
                            </label>
                            {categoryId && !isCreatingCategory && (
                                <button
                                    type="button"
                                    onClick={handleCategoryDelete}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Category
                                </button>
                            )}
                        </div>
                        <select
                            value={isCreatingCategory ? 'NEW' : categoryId}
                            onChange={(e) => {
                                if (e.target.value === 'NEW') {
                                    setIsCreatingCategory(true);
                                    setCategoryId('');
                                } else {
                                    setIsCreatingCategory(false);
                                    setCategoryId(e.target.value);
                                }
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                            <option value="NEW">+ Create New Category</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            required
                        >
                            <option value="draft">Draft (Private)</option>
                            <option value="published">Published (Visible to Public)</option>
                            <option value="archived">Archived</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Only published blogs appear on the public website.</p>
                    </div>

                    {/* New Category Input */}
                    {isCreatingCategory && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Category Name <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter category name"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingCategory(false);
                                        setNewCategoryName('');
                                    }}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Excerpt <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Brief summary of the blog post"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">A short summary displayed in blog lists.</p>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cover Image
                        </label>
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-emerald-50 file:text-emerald-700
                                        hover:file:bg-emerald-100
                                        dark:file:bg-emerald-900/30 dark:file:text-emerald-300
                                    "
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Recommended size: 1200x630px. Max size: 5MB.
                                </p>
                            </div>
                            {imagePreview && (
                                <div className="w-32 h-20 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Link
                            href="/wp-admin/admin/web/blogs"
                            className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Blog'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
