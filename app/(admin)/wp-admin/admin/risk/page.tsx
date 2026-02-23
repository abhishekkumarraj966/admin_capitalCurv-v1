'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function RiskDashboard() {
    // Get token directly from storage
    const [token, setToken] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [sharedIPs, setSharedIPs] = useState<any[]>([]);
    const [copyTradingAlerts, setCopyTradingAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setToken(localStorage.getItem('adminAccessToken'));
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, ipRes, copyRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/security/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/security/admin/shared-ips`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/security/admin/copy-trading`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (statsRes.data.success) setStats(statsRes.data.result);
            if (ipRes.data.success) setSharedIPs(ipRes.data.result);
            if (copyRes.data.success) setCopyTradingAlerts(copyRes.data.result);

        } catch (error) {
            console.error('Error fetching risk data:', error);
            toast.error('Failed to fetch risk data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const RiskCard = ({ title, value, subtext, color = "blue" }: any) => (
        <div className="bg-[#000F0A] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
            <div className={`text-3xl font-bold text-${color}-400 mb-1`}>{value}</div>
            <p className="text-gray-500 text-xs">{subtext}</p>
        </div>
    );

    return (
        <div className="min-h-screen text-white p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Risk & Security</h1>
                <p className="text-gray-400 mt-1">Monitor abuse, copy trading, and suspicious activity</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <RiskCard
                    title="Active Sessions"
                    value={loading ? '-' : stats?.sessions?.activeSessions}
                    subtext="Currently online users"
                    color="emerald"
                />
                <RiskCard
                    title="Suspicious Activity"
                    value={loading ? '-' : stats?.sessions?.suspiciousSessions}
                    subtext="Flagged in last 24h"
                    color="amber"
                />
                <RiskCard
                    title="Copy Trading Alerts"
                    value={loading ? '-' : copyTradingAlerts.length}
                    subtext="Potential abuse cases"
                    color="red"
                />
                <RiskCard
                    title="Shared IP Clusters"
                    value={loading ? '-' : sharedIPs.length}
                    subtext="Multi-account detections"
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Copy Trading Alerts */}
                <div className="bg-[#000F0A] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Copy Trading Alerts
                    </h3>
                    <div className="space-y-4">
                        {loading ? <p className="text-gray-500">Loading...</p> :
                            copyTradingAlerts.length === 0 ? <p className="text-gray-500 italic">No copy trading detected.</p> :
                                copyTradingAlerts.map((alert: any) => (
                                    <div key={alert._id} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-white">{alert.userName}</div>
                                                <div className="text-xs text-gray-500">{alert.userEmail}</div>
                                            </div>
                                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded uppercase font-bold">Critical</span>
                                        </div>
                                        <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
                                        <div className="text-xs text-gray-500">Detected: {new Date(alert.createdAt).toLocaleString()}</div>
                                    </div>
                                ))}
                    </div>
                </div>

                {/* Shared IP Analysis */}
                <div className="bg-[#000F0A] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Multi-Account IP Detection
                    </h3>
                    <div className="space-y-4">
                        {loading ? <p className="text-gray-500">Loading...</p> :
                            sharedIPs.length === 0 ? <p className="text-gray-500 italic">No IP overlaps detected.</p> :
                                sharedIPs.map((ip: any) => (
                                    <div key={ip.ipAddress} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="font-mono text-purple-400">{ip.ipAddress}</div>
                                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded font-bold">
                                                {ip.userCount} Users
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {ip.users.map((u: any) => (
                                                <div key={u._id} className="flex items-center gap-2 text-sm text-gray-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                                                    <span>{u.name}</span>
                                                    <span className="text-gray-600">({u.email})</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
                                            Last Active: {new Date(ip.lastActive).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
