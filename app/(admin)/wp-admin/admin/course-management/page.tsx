'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse, getCourseVideos, createVideo, updateVideo, deleteVideo } from '@/services/courseApi';
import { format } from 'date-fns';

export default function CourseManagementPage() {
    const [view, setView] = useState<'courses' | 'videos'>('courses');
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    // Data States
    const [courses, setCourses] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [courseForm, setCourseForm] = useState({ title: '', description: '', thumbnail: '', isFree: false, requiredPlan: '' });
    const [videoForm, setVideoForm] = useState({ title: '', description: '', videoUrl: '', duration: 0, thumbnail: '' });

    // Stats
    const stats = {
        total: view === 'courses' ? (courses || []).length : (videos || []).length,
        active: view === 'courses' ? (courses || []).filter(c => c?.isActive).length : (videos || []).filter(v => v?.isActive).length,
        inactive: view === 'courses' ? (courses || []).filter(c => !c?.isActive).length : (videos || []).filter(v => !v?.isActive).length
    };

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCourses();
            setCourses(response.result?.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchVideos = useCallback(async (courseId: string) => {
        setLoading(true);
        try {
            const response = await getCourseVideos(courseId);
            setVideos(response.result?.videos || []);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'courses') {
            fetchCourses();
        } else if (view === 'videos' && selectedCourse) {
            fetchVideos(selectedCourse._id);
        }
    }, [view, selectedCourse, fetchCourses, fetchVideos]);

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        if (view === 'courses') {
            setCourseForm({
                title: item.title,
                description: item.description,
                thumbnail: item.thumbnail,
                isFree: item.isFree || false,
                requiredPlan: item.requiredPlan?._id || item.requiredPlan || ''
            });
        } else {
            setVideoForm({
                title: item.title,
                description: item.description,
                videoUrl: item.videoUrl || '',
                duration: item.duration,
                thumbnail: item.thumbnail || ''
            });
        }
    };

    const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCourse(editingId, courseForm);
            } else {
                await createCourse(courseForm);
            }
            setCourseForm({ title: '', description: '', thumbnail: '', isFree: false, requiredPlan: '' });
            setEditingId(null);
            fetchCourses();
        } catch (error) {
            console.error('Failed to save course:', error);
        }
    };

    const handleCreateOrUpdateVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;
        try {
            if (editingId) {
                await updateVideo(editingId, videoForm);
            } else {
                await createVideo({ ...videoForm, courseId: selectedCourse._id });
            }
            setVideoForm({ title: '', description: '', videoUrl: '', duration: 0, thumbnail: '' });
            setEditingId(null);
            fetchVideos(selectedCourse._id);
        } catch (error) {
            console.error('Failed to save video:', error);
        }
    };

    const handleDeleteCourse = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await deleteCourse(id);
            fetchCourses();
        } catch (error) {
            console.error('Failed to delete course:', error);
        }
    };

    const handleDeleteVideo = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        try {
            await deleteVideo(id);
            if (selectedCourse) fetchVideos(selectedCourse._id);
        } catch (error) {
            console.error('Failed to delete video:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-screen pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {view === 'courses' ? 'Course Management' : `Video Library: ${selectedCourse?.title}`}
                </h1>
                {view === 'videos' && (
                    <button
                        onClick={() => {
                            setView('courses');
                            setSelectedCourse(null);
                            setEditingId(null);
                            setVideoForm({ title: '', description: '', videoUrl: '', duration: 0, thumbnail: '' });
                        }}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Courses
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label={view === 'courses' ? 'Total Courses' : 'Total Video'}
                    value={stats.total}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                />
                <StatsCard
                    label={view === 'courses' ? 'Inactive Courses' : 'Inactive Video'}
                    value={stats.inactive}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                    color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                />
                <StatsCard
                    label={view === 'courses' ? 'Active Courses' : 'Active Video'}
                    value={stats.active}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    color="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* List Section (Takes up 2 cols) */}
                <div className="xl:col-span-2 bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-[#021F17] flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {view === 'courses' ? 'Course List' : 'Video Library'}
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-[#021F17]">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Sr No.</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Title</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Thumbnail</th>
                                    {view === 'courses' && <th className="p-4 text-xs font-bold text-gray-500 uppercase">Videos</th>}
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                                    {view === 'courses' && <th className="p-4 text-xs font-bold text-gray-500 uppercase">Required Plan</th>}
                                    {view === 'videos' && <th className="p-4 text-xs font-bold text-gray-500 uppercase">Duration</th>}
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#021F17]">
                                {loading ? (
                                    <tr><td colSpan={view === 'courses' ? 9 : 8} className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading items...</td></tr>
                                ) : ((view === 'courses' ? courses : videos) || []).length === 0 ? (
                                    <tr><td colSpan={view === 'courses' ? 9 : 8} className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No items found.</td></tr>
                                ) : (
                                    ((view === 'courses' ? courses : videos) || []).map((item: any, index: number) => (
                                        <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/50 transition-colors">
                                            <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                                            <td className="p-4 text-sm font-bold text-gray-900 dark:text-white max-w-[200px] truncate" title={item.title}>{item.title}</td>
                                            <td className="p-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden shadow-sm">
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">NO IMG</div>
                                                    )}
                                                </div>
                                            </td>
                                            {view === 'courses' && (
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black uppercase">
                                                        {item.totalVideos || item.videos?.length || 0} Videos
                                                    </span>
                                                </td>
                                            )}
                                            <td className="p-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={item.description}>{item.description}</td>
                                            {view === 'courses' && (
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
                                                        {item.requiredPlan?.name || item.requiredPlan || 'None'}
                                                    </span>
                                                </td>
                                            )}
                                            {view === 'videos' && (
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg w-fit">
                                                        {formatDuration(item.duration || 0)}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {view === 'courses' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCourse(item);
                                                                setView('videos');
                                                            }}
                                                            className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                        >
                                                            Show more
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => view === 'courses' ? handleDeleteCourse(item._id) : handleDeleteVideo(item._id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isActive
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy') : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Form Section (Takes up 1 col) */}
                <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] p-6 h-fit sticky top-6">
                    <div className="mb-6 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {view === 'courses' ? (editingId ? 'Edit Course' : 'Create Course') : (editingId ? 'Edit Video' : 'Upload Video')}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {view === 'courses' ? 'Add or edit an educational course' : 'MP4, AVI, MKV files are allowed'}
                        </p>
                    </div>

                    <form onSubmit={view === 'courses' ? handleCreateOrUpdateCourse : handleCreateOrUpdateVideo} className="space-y-4">
                        {/* Thumbnail Upload Area */}
                        <div className="border-2 border-dashed border-gray-200 dark:border-[#021F17] rounded-xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-gray-50 dark:bg-[#000F0A]/50">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Drag & drop a thumbnail image here, or click to select one
                            </p>
                            <input
                                type="text"
                                placeholder="Thumbnail URL (Temporary Input)"
                                className="mt-4 w-full text-xs p-2 border rounded bg-transparent dark:text-white"
                                value={view === 'courses' ? courseForm.thumbnail : videoForm.thumbnail}
                                onChange={(e) => view === 'courses' ? setCourseForm({ ...courseForm, thumbnail: e.target.value }) : setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Title</label>
                            <input
                                type="text"
                                placeholder="Enter title"
                                value={view === 'courses' ? courseForm.title : videoForm.title}
                                onChange={(e) => view === 'courses' ? setCourseForm({ ...courseForm, title: e.target.value }) : setVideoForm({ ...videoForm, title: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
                            <textarea
                                placeholder="Enter description"
                                rows={4}
                                value={view === 'courses' ? courseForm.description : videoForm.description}
                                onChange={(e) => view === 'courses' ? setCourseForm({ ...courseForm, description: e.target.value }) : setVideoForm({ ...videoForm, description: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                                required
                            />
                        </div>

                        {view === 'courses' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Required Plan</label>
                                    <input
                                        type="text"
                                        placeholder="E.g. Pro, Premium"
                                        value={courseForm.requiredPlan}
                                        onChange={(e) => setCourseForm({ ...courseForm, requiredPlan: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Video URL</label>
                                <input
                                    type="text"
                                    placeholder="Enter video URL"
                                    value={videoForm.videoUrl}
                                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex gap-2">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setCourseForm({ title: '', description: '', thumbnail: '', isFree: false, requiredPlan: '' });
                                        setVideoForm({ title: '', description: '', videoUrl: '', duration: 0, thumbnail: '' });
                                    }}
                                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-[#0F8235] hover:bg-[#0b6528] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
                            >
                                {editingId ? 'Update' : (view === 'courses' ? 'Create Course' : 'Upload Video')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Components
function StatsCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
        </div>
    );
}

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
