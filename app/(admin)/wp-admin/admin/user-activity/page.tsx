'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSecurityStats, getSessions, getViolations, resolveViolation, verifyTravel } from '@/services/securityApi';
import { Shield, AlertTriangle, Activity, User, MapPin, Monitor, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function UserActivityPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'violations'>('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [violations, setViolations] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const res = await getSecurityStats();
                console.log('Security Stats:', res);
                setStats(res.result || res.data || null);
            } else if (activeTab === 'sessions') {
                const res = await getSessions();
                console.log('Sessions Res:', res);
                const result = res.result || res.data || res;
                // Aggressive extraction
                const list = Array.isArray(result) ? result : (result?.data || result?.sessions || result?.result || []);
                setSessions(Array.isArray(list) ? list : []);
            } else if (activeTab === 'violations') {
                const res = await getViolations();
                console.log('Violations Res:', res);
                const result = res.result || res.data || res;
                // Aggressive extraction
                const list = Array.isArray(result) ? result : (result?.data || result?.violations || result?.result || []);
                setViolations(Array.isArray(list) ? list : []);

                if (!Array.isArray(list) || list.length === 0) {
                    console.warn('No violations array found in:', res);
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${activeTab}:`, error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleResolveViolation = async (id: string) => {
        const notes = prompt('Enter resolution notes (optional):');
        if (notes === null) return;
        try {
            await resolveViolation(id, { notes });
            alert('Violation resolved');
            fetchData();
        } catch (error) {
            alert('Failed to resolve violation');
        }
    };

    const handleVerifyTravel = async (sessionId: string, isVerified: boolean) => {
        const notes = prompt(`Enter ${isVerified ? 'verification' : 'rejection'} notes (optional):`);
        if (notes === null) return;
        try {
            await verifyTravel({ sessionId, isVerified, notes });
            alert(`Travel claim ${isVerified ? 'verified' : 'rejected'}`);
            fetchData();
        } catch (error) {
            alert('Failed to process travel verification');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Shield className="text-blue-600" />
                    Security & User Activity
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-[#021F17] p-1 rounded-xl w-fit">
                {(['overview', 'sessions', 'violations'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-[#0F8235] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {activeTab === 'overview' && stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                        <Monitor size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Total Sessions</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sessions?.totalSessions || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Active Sessions</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sessions?.activeSessions || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Suspicious Sessions</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sessions?.suspiciousSessions || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17]">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Violations by Type</h3>
                                <div className="space-y-4">
                                    {Object.entries(stats.violationsByType || {}).map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#000F0A]/50 rounded-xl">
                                            <span className="text-sm font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                                            <span className="px-2 py-1 bg-white dark:bg-gray-600 rounded-lg text-xs font-bold">{count as number}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17]">
                                <div className="space-y-4">
                                    {Array.isArray(stats.recentSuspicious) && stats.recentSuspicious.map((s: any) => (
                                        <div key={s._id} className="flex items-start gap-4 p-4 border-b border-gray-100 dark:border-[#000F0A]/50 last:border-0">
                                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 shrink-0">
                                                <AlertTriangle size={16} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">User: {s.userId}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{s.suspiciousReason}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                                                    <span className="flex items-center gap-1"><MapPin size={10} /> {s.ipRegion} ({s.ipAddress})</span>
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {format(new Date(s.loginTime), 'MMM dd, HH:mm')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'sessions' && (
                    <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-[#021F17]">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Device & Browser</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">IP & Region</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Login Time</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
                                    ) : !Array.isArray(sessions) || sessions.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">No sessions found.</td></tr>
                                    ) : (
                                        sessions.map((s: any) => (
                                            <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                            <User size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                                {s.user ? `${s.user.firstName} ${s.user.lastName}` : s.userId}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 truncate">{s.userId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs text-gray-900 dark:text-white font-medium truncate max-w-[150px]" title={s.userAgent}>
                                                        {s.userAgent}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1">ID: {s.deviceId}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs font-bold text-gray-900 dark:text-white">{s.ipAddress}</div>
                                                    <div className="text-[10px] text-gray-500">{s.ipRegion}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {s.isActive ? 'Active' : 'Expired'}
                                                        </span>
                                                        {s.isSuspicious && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 w-fit" title={s.suspiciousReason}>
                                                                Suspicious
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                                                    {format(new Date(s.loginTime), 'MMM dd, HH:mm')}
                                                </td>
                                                <td className="p-4">
                                                    {s.isSuspicious && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleVerifyTravel(s._id, true)}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                                                title="Verify Travel"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleVerifyTravel(s._id, false)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                                title="Reject Travel"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'violations' && (
                    <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-[#021F17]">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Violation</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Severity</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
                                    ) : !Array.isArray(violations) || violations.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center">
                                                <p className="text-gray-500">No violations found.</p>
                                                <p className="text-[10px] text-gray-400 mt-2">Internal data type: {typeof violations} {Array.isArray(violations) ? '(Array)' : '(Not an Array)'}</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        violations.map((v: any) => (
                                            <tr key={v._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/50 transition-colors">
                                                <td className="p-4">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{v.type.replace(/_/g, ' ')}</p>
                                                    {v.notes && <p className="text-[10px] text-gray-500 mt-1">{v.notes}</p>}
                                                </td>
                                                <td className="p-4 text-xs text-gray-600 dark:text-gray-300 font-mono">
                                                    {v.userId}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${v.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                        v.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {v.severity}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${v.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {v.resolved ? 'Resolved' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                                                    {v.createdAt ? format(new Date(v.createdAt), 'MMM dd, HH:mm') : '-'}
                                                </td>
                                                <td className="p-4">
                                                    {!v.resolved && (
                                                        <button
                                                            onClick={() => handleResolveViolation(v._id)}
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                                        >
                                                            Resolve
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
