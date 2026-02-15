'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/Context/AuthContext'; // Preserving typo from source 'contaxt'

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [openWebManagement, setOpenWebManagement] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
                aria-label="Toggle Sidebar"
            >
                {isSidebarOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 bg-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={closeSidebar}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 dark:border-[#021F17]/30 overflow-y-auto transition-transform duration-300 ease-in-out transform shadow-lg ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} style={{ background: 'linear-gradient(264.84deg, #037260 6.78%, #036958 24.2%, #024C40 55.04%, #023B32 91.68%)' }}>
                <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
                    <Link href="/wp-admin/admin" onClick={closeSidebar}>
                        <Image
                            src="/assets/img/auth/Logo.png"
                            alt="Logo"
                            width={150}
                            height={40}
                            className="object-contain h-10 w-auto"
                            priority
                        />
                    </Link>
                    {/* Explicit close button inside sidebar for mobile */}
                    <button onClick={closeSidebar} className="lg:hidden text-white/70 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {/* User Management */}
                    <Link
                        href="/wp-admin/admin/user-management"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/user-management')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        User Management
                    </Link>


                    {/* KYC Management */}
                    <Link
                        href="/wp-admin/admin/kyc-management"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/kyc-management')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        KYC Management
                    </Link>

                    {/* Plan Management */}
                    <Link
                        href="/wp-admin/admin/plan-management"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/plan-management')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Plan Management
                    </Link>


                    {/* User Purchase Plan */}
                    <Link
                        href="/wp-admin/admin/purchase-plan"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/purchase-plans')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        User Purchase Plans
                    </Link>

                    {/* Referral and Earn */}
                    <Link
                        href="/wp-admin/admin/referrals-management"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/referrals-management')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Referral & Earn
                    </Link>

                    {/* Transactions */}
                    <Link
                        href="/wp-admin/admin/transactions"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/transactions')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Transactions
                    </Link>


                    {/* Course Management */}
                    <Link
                        href="/wp-admin/admin/course-management"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/course-management')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Course Management
                    </Link>

                    {/* Web Management Accordion */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setOpenWebManagement(!openWebManagement)}
                            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                Web Management
                            </div>
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${openWebManagement ? 'transform rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openWebManagement && (
                            <div className="pl-12 space-y-1">
                                <Link href="/wp-admin/admin/web/faqs" onClick={closeSidebar} className="block px-4 py-2 text-sm text-white/60 hover:text-white">FAQS</Link>
                                <Link href="/wp-admin/admin/news-management" onClick={closeSidebar} className="block px-4 py-2 text-sm text-white/60 hover:text-white">News</Link>
                                <Link href="/wp-admin/admin/web/blogs" onClick={closeSidebar} className="block px-4 py-2 text-sm text-white/60 hover:text-white">Blogs</Link>
                            </div>
                        )}
                    </div>

                    {/* Support Management */}
                    <Link
                        href="/wp-admin/admin/supoort-management"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/supoort-management')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Support Management
                    </Link>

                    {/* User Activity */}
                    <Link
                        href="/wp-admin/admin/user-activity"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/user-activity')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        User Activity
                    </Link>
                    {/* Admin Management */}
                    <Link
                        href="/wp-admin/admin/admin-management"
                        onClick={closeSidebar}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive('/wp-admin/admin/admin-management')
                            ? 'bg-[#0F8235] text-white font-bold shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Admin Management
                    </Link>
                    {/* Settings Accordion */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setOpenSettings(!openSettings)}
                            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </div>
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${openSettings ? 'transform rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openSettings && (
                            <div className="pl-12 space-y-1">
                                <Link href="/wp-admin/admin/settings/password" onClick={closeSidebar} className="block px-4 py-2 text-sm text-white/60 hover:text-white">Change Password</Link>
                                <button
                                    onClick={() => { logout(); closeSidebar(); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-300 hover:text-red-200"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </aside>
        </>
    );
}
