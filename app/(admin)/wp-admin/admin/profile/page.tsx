'use client';

import { useAuth } from '@/Context/AuthContext';
import { format } from 'date-fns';

export default function ProfilePage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-emerald-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center text-red-500">
                    <p>Failed to load user profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account and view permissions.</p>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar / Initials */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                            {user.adminName?.charAt(0).toUpperCase() || 'A'}
                        </div>

                        <div className="flex-grow space-y-4 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.adminName}</h2>
                                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.isSuperAdmin
                                        ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                                        : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                        }`}>
                                        {user.isSuperAdmin ? 'Super Admin' : 'Admin'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.status === 'Active'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                                        : 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                                        }`}>
                                        {user.status || 'Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-[#021F17]">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Balance</p>
                                    <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                                        ₹{user.accountBalance?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</p>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                                        {user.lastLogin ? format(new Date(user.lastLogin), 'PPP p') : 'Never'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
                                    <p className="text-sm font-mono text-gray-900 dark:text-white mt-2 bg-gray-50 dark:bg-[#000F0A] p-2 rounded border border-gray-200 dark:border-[#021F17] inline-block">
                                        {user._id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permissions Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Assigned Permissions</h3>

                {user.permissions ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(user.permissions).map(([module, perms]) => (
                            <div key={module} className="bg-white dark:bg-[#021F17] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-[#021F17] hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                                        {module.replace(/([A-Z])/g, ' $1').trim()}
                                    </h4>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {perms && Object.entries(perms).map(([action, allowed]) => (
                                        allowed && (
                                            <span key={action} className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#000F0A] text-gray-600 dark:text-gray-300 capitalize border border-gray-200 dark:border-[#021F17]">
                                                {action}
                                            </span>
                                        )
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#021F17] rounded-xl p-8 text-center border border-gray-100 dark:border-[#021F17]">
                        <p className="text-gray-500 dark:text-gray-400">No specific permissions assigned found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
