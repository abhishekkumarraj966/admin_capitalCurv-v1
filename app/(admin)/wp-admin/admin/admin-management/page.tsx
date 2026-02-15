'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    getSubAdmins,
    createSubAdmin,
    updateSubAdmin,
    deleteSubAdmin,
    getSubAdminPermissions,
    updateSubAdminPermissions
} from '@/services/adminManagementApi';
import { format } from 'date-fns';

const MODULES = [
    'userManagement',
    'adminManagement',
    'kycManagement',
    'courseManagement',
    'transactionManagement',
    'planManagement',
    'referralManagement',
    'supportManagement',
    'faqManagement',
    'blogManagement',
    'newsManagement',
    'stages',
    'addOns'
];

const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete', 'block'];

export default function AdminManagementPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);

    // Modal states
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
    const [showModal, setShowModal] = useState<'none' | 'create' | 'edit' | 'delete' | 'permissions'>('none');
    const [permissions, setPermissions] = useState<any>({});

    // Form states
    const [formData, setFormData] = useState({ adminName: '', email: '', password: '', status: 'Active' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getSubAdmins({ page, limit, search });
            // API returns under result.data
            setAdmins(response.result?.data || []);
            setTotalPages(response.result?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchAdmins();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchAdmins]);

    const handleOpenCreate = () => {
        setFormData({ adminName: '', email: '', password: '', status: 'Active' });
        setError(null);
        setShowModal('create');
    };

    const handleOpenEdit = (admin: any) => {
        setSelectedAdmin(admin);
        setFormData({ adminName: admin.adminName, email: admin.email, password: '', status: admin.status || 'Active' });
        setError(null);
        setShowModal('edit');
    };

    const handleOpenPermissions = async (admin: any) => {
        setSelectedAdmin(admin);
        setLoading(true);
        try {
            const response = await getSubAdminPermissions(admin._id);
            setPermissions(response.result?.permissions || {});
            setShowModal('permissions');
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            if (showModal === 'create') {
                await createSubAdmin(formData);
            } else {
                await updateSubAdmin(selectedAdmin._id, { adminName: formData.adminName, status: formData.status });
            }
            setShowModal('none');
            fetchAdmins();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedAdmin) return;
        setIsSubmitting(true);
        try {
            await deleteSubAdmin(selectedAdmin._id);
            setShowModal('none');
            fetchAdmins();
        } catch (error) {
            console.error('Failed to delete admin:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePermissionChange = (module: string, action: string) => {
        setPermissions((prev: any) => {
            const modulePerms = prev[module] || {};
            return {
                ...prev,
                [module]: {
                    ...modulePerms,
                    [action]: !modulePerms[action]
                }
            };
        });
    };

    const savePermissions = async () => {
        setIsSubmitting(true);
        try {
            await updateSubAdminPermissions(selectedAdmin._id, permissions);
            setShowModal('none');
        } catch (error) {
            console.error('Failed to update permissions:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && admins.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6 rounded-2xl min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-white">Admin Management</h1>

                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by Name, Email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-white/40" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    />
                    <div className="absolute right-3 top-2.5">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2 bg-[#0F8235] hover:bg-[#0b6528] text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Sub-Admin
                </button>
            </div>

            <div className="rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse cursor-default">
                        <thead>
                            <tr className="border-b bg-white/5">
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Sr No</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Status</th>
                                {/* <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Last Login</th> */}
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                            {admins.length > 0 ? (
                                admins.map((admin, index) => (
                                    <tr key={admin._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-center text-sm font-medium text-white">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-white">
                                            {admin.adminName}
                                        </td>
                                        <td className="p-4 text-sm text-white/70">
                                            {admin.email}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${admin.status === 'Active'
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                }`}>
                                                {admin.status || 'Active'}
                                            </span>
                                        </td>
                                        {/* <td className="p-4 text-center text-sm text-white/50">
                                            {admin.lastLogin ? format(new Date(admin.lastLogin), 'dd/MM/yyyy HH:mm') : '-'}
                                        </td> */}
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleOpenPermissions(admin)}
                                                    className="p-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-all border border-purple-500/30"
                                                    title="Permissions"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(admin)}
                                                    className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-all border border-emerald-500/30"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedAdmin(admin); setShowModal('delete'); }}
                                                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all border border-red-500/30"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-white/70 bg-transparent">
                                        No admins found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Rows per page:</span>
                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="bg-[#0F8235] text-white px-2 py-1 rounded-md text-[11px] font-bold outline-none cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold transition-all ${page === p
                                    ? 'bg-[#0F8235] text-white'
                                    : 'bg-white/5 border border-white/10 text-white/70 hover:border-emerald-500 hover:text-emerald-500'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showModal !== 'none' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowModal('none')}></div>

                    {/* Create / Edit Modal */}
                    {(showModal === 'create' || showModal === 'edit') && (
                        <div className="relative rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(2, 60, 50, 0.95), rgba(1, 31, 23, 0.95))' }}>
                            <h2 className="text-xl font-bold text-white mb-6">
                                {showModal === 'create' ? 'Create Sub-Admin' : 'Edit Sub-Admin'}
                            </h2>
                            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/70 mb-2 uppercase">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.adminName}
                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/70 mb-2 uppercase">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        disabled={showModal === 'edit'}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner ${showModal === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                {showModal === 'create' && (
                                    <div>
                                        <label className="block text-xs font-bold text-white/70 mb-2 uppercase">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                                        />
                                    </div>
                                )}
                                {showModal === 'edit' && (
                                    <div>
                                        <label className="block text-xs font-bold text-white/70 mb-2 uppercase">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                    </div>
                                )}

                                {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}

                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal('none')}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-bold transition-all hover:bg-white/20 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-[#0F8235] text-white rounded-xl font-bold transition-all hover:bg-[#0b6528] disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                        {showModal === 'create' ? 'Create Agency' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Delete Confirmation */}
                    {showModal === 'delete' && (
                        <div className="relative rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 text-center" style={{ background: 'linear-gradient(135deg, rgba(2, 60, 50, 0.95), rgba(1, 31, 23, 0.95))' }}>
                            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 font-bold text-2xl">!</div>
                            <h2 className="text-xl font-bold text-white mb-2">Delete Sub-Admin</h2>
                            <p className="text-white/60 text-sm mb-8">Are you sure you want to delete <span className="text-white font-bold">{selectedAdmin?.adminName}</span>? This action is irreversible.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowModal('none')}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-bold transition-all hover:bg-white/20 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold transition-all hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Permissions Modal */}
                    {showModal === 'permissions' && (
                        <div className="relative rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(2, 60, 50, 0.98), rgba(1, 31, 23, 0.98))' }}>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Manage Permissions</h2>
                                    <p className="text-sm text-white/60">Module Access Control for <span className="text-emerald-400 font-bold">{selectedAdmin?.adminName}</span></p>
                                </div>
                                <button onClick={() => setShowModal('none')} className="text-white/40 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {MODULES.map(module => (
                                    <div key={module} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors shadow-inner">
                                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 capitalize">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            {module.replace(/([A-Z])/g, ' $1').trim()}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {PERMISSION_ACTIONS.map(action => (
                                                <label key={action} className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                                                    <span className="text-xs text-white/60 group-hover:text-white transition-colors capitalize">{action}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions[module]?.[action] || false}
                                                        onChange={() => handlePermissionChange(module, action)}
                                                        className="w-4 h-4 rounded border-white/20 bg-emerald-900/40 text-emerald-500 focus:ring-emerald-500/20"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 mt-8 sticky bottom-0 pt-4 bg-transparent backdrop-blur-md">
                                <button
                                    onClick={() => setShowModal('none')}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-bold transition-all hover:bg-white/20 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={savePermissions}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-[#0F8235] text-white rounded-xl font-bold transition-all hover:bg-[#0b6528] disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                    Update Permissions
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
