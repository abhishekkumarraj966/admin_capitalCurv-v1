'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUsers, deleteUser, updateUserStatus } from '@/services/userApi';
import { format } from 'date-fns';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);

    // Modal states
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showModal, setShowModal] = useState<'none' | 'details' | 'delete' | 'block'>('none');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getUsers({ page, limit, search });
            setUsers(response.result?.data || []);
            setTotalPages(response.result?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser(selectedUser._id);
            setShowModal('none');
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleStatusUpdate = async (statusOverride?: string) => {
        if (!selectedUser) return;
        // Use 'Blocked' instead of 'Inactive' as per API requirements
        const newStatus = statusOverride || (selectedUser.status === 'Active' ? 'Blocked' : 'Active');
        try {
            await updateUserStatus(selectedUser._id, newStatus);
            setShowModal('none');
            fetchUsers();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6 rounded-2xl min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-white">User Management</h1>

                <div className="relative flex-1 max-w-md mx-auto">
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

                <div className="w-32 hidden md:block"></div> {/* Spacer to keep search centered */}
            </div>

            <div className="rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse cursor-default">
                        <thead>
                            <tr className="border-b bg-white">
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Sr No</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">User Id</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Name</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Email</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Phone</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Code</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Status</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Account Balance</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Action</th>
                                <th className="p-4 text-[11px] font-bold text-white/50 uppercase tracking-wider text-center">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-center text-sm font-medium text-white">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="p-4 text-center text-sm text-white/70 font-medium">
                                            {user.userId}
                                        </td>
                                        <td className="p-4 text-center text-sm font-bold text-white">
                                            {user.firstName} {user.lastName}
                                        </td>
                                        <td className="p-4 text-center text-sm text-white/70">
                                            {user.email}
                                        </td>
                                        <td className="p-4 text-center text-sm text-white/70">
                                            {user.mobileNumber || '-'}
                                        </td>
                                        <td className="p-4 text-center text-sm text-white/70 font-medium">
                                            {user.referralCode || '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${user.status === 'Active'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-sm font-bold text-white">
                                            {(user.accountBalance || 0).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowModal('details'); }}
                                                    className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-all hover:scale-105 border border-emerald-500/30"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowModal('delete'); }}
                                                    className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all hover:scale-105 border border-blue-500/30"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowModal('block'); }}
                                                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all hover:scale-105 border border-red-500/30"
                                                    title="Disable"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-sm text-white/50">
                                            {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy') : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-white/70 bg-transparent">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-50 dark:border-[#021F17]">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>Rows per page:</span>
                        <div className="relative">
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="appearance-none bg-[#0F8235] text-white px-3 py-1.5 pr-8 rounded-md text-[11px] font-bold outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <div className="absolute right-2 top-2 pointer-events-none">
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold transition-all ${page === p
                                    ? 'bg-[#0F8235] text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-500'
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
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal('none')}></div>

                    {/* Delete / Block Confirmation Modal */}
                    {(showModal === 'delete' || showModal === 'block') && (
                        <div className="relative rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200" style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                                {showModal === 'delete' ? 'Delete User' : 'Block User'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center text-sm">
                                Are you sure you want to {showModal === 'delete' ? 'delete' : 'Block'} this User?
                            </p>
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setShowModal('none')}
                                    className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={showModal === 'delete' ? handleDelete : () => handleStatusUpdate()}
                                    className="flex-1 px-4 py-2.5 bg-[#0F8235] text-white rounded-xl font-bold transition-colors hover:bg-[#0b6528]"
                                >
                                    {showModal === 'delete' ? 'Delete' : 'Block'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* User Details Modal */}
                    {showModal === 'details' && selectedUser && (
                        <div className="relative rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 border" style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">ID:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17] truncate">{selectedUser.userId}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Name:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17]">{selectedUser.firstName} {selectedUser.lastName}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Email:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17] truncate" title={selectedUser.email}>{selectedUser.email}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Phone:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17]">{selectedUser.mobileNumber || '-'}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Aadhar:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17]">-</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Pan:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17]">-</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Account Balance:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17]">{selectedUser.accountBalance || 0}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Referral By:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17]">-</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Code:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17]">{selectedUser.referralCode || '-'}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Joining Date:</label>
                                    <div className="bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17]">{selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'dd/MM/yyyy') : '-'}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Status:</label>
                                    <select
                                        defaultValue={selectedUser.status}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-[#000F0A]/40 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-[#021F17] outline-none focus:ring-2 focus:ring-purple-500/20"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Blocked">Blocked</option>
                                        <option value="Delete">Delete</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowModal('none')}
                                    className="flex-1 px-4 py-3 bg-slate-300 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-colors hover:bg-slate-400 dark:hover:bg-slate-600"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedUser.status)}
                                    className="flex-1 px-4 py-3 bg-[#0F8235] text-white rounded-xl font-bold transition-colors hover:bg-[#0b6528]"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}