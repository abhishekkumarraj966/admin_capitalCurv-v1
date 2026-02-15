'use client';

import { useEffect, useState, useCallback } from 'react';
import { getKycList, getKycDetails, verifyKyc, verifyBank } from '@/services/kycApi';
import { format } from 'date-fns';

export default function KycManagementPage() {
    const [kycs, setKycs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');

    // Modal states
    const [selectedKyc, setSelectedKyc] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [adminRemark, setAdminRemark] = useState('');

    const fetchKycs = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page, limit };
            if (statusFilter) params.status = statusFilter;
            const response = await getKycList(params);
            setKycs(response.result?.data || []);
            setTotalPages(response.result?.pagination?.totalPages || 1);
        } catch (error: any) {
            console.error('Failed to fetch KYC list:', error);
            if (error.response?.data?.message === 'Validation failed') {
                setKycs([]);
            }
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchKycs();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchKycs, search]);

    const handleViewDetails = async (id: string) => {
        try {
            const response = await getKycDetails(id);
            const data = response.result?.kyc || response.result;
            setSelectedKyc(data);
            setAdminRemark(data?.rejectionReason || '');
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Failed to fetch KYC details:', error);
        }
    };

    const handleVerify = async (status: 'Approved' | 'Rejected') => {
        if (!selectedKyc) return;
        try {
            await verifyKyc({
                kycId: selectedKyc._id,
                documentType: 'aadhar',
                status,
                rejectionReason: status === 'Rejected' ? adminRemark : undefined
            });

            if (status === 'Approved') {
                try {
                    await verifyKyc({
                        kycId: selectedKyc._id,
                        documentType: 'pan',
                        status,
                    });
                } catch (e) {
                    console.error('Failed to verify PAN:', e);
                }
            }

            setShowDetailsModal(false);
            fetchKycs();
        } catch (error) {
            console.error('Failed to verify KYC:', error);
        }
    };

    const getKycData = (kyc: any) => {
        const user = kyc.user || kyc.userId || {};
        const documents = kyc.documents || [];
        const aadharDoc = documents.find((d: any) => d.type === 'aadhar') || {};
        const panDoc = documents.find((d: any) => d.type === 'pan') || {};

        return {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
            email: user.email || kyc.email || '-',
            phone: user.mobileNumber || '-',
            panNumber: panDoc.documentNumber || '-',
            aadharNumber: aadharDoc.documentNumber || '-',
            status: kyc.overallStatus || kyc.status || 'Pending',
            date: kyc.createdAt,
            aadharFront: aadharDoc.frontImage,
            aadharBack: aadharDoc.backImage,
            panCard: panDoc.frontImage
        };
    };

    const selectedKycData = selectedKyc ? getKycData(selectedKyc) : null;

    if (loading && kycs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 min-h-screen pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">KYC Management</h1>

                <div className="flex items-center gap-4 flex-1 max-w-2xl px-10">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by Email, Ip, city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 bg-white dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                        />
                        <div className="absolute right-3 top-2.5">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="bg-white dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <div className="w-10 hidden md:block"></div>
            </div>

            <div className="rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse cursor-default">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-[#021F17]">
                                <th className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Sr No</th>
                                <th className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Name</th>
                                <th className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Email</th>
                                <th className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Pan Num</th>
                                <th className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Aadhar Num</th>
                                <th className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                                <th className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Date</th>
                                <th className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#021F17]">
                            {kycs.length > 0 ? (
                                kycs.map((kyc, index) => {
                                    const data = getKycData(kyc);
                                    return (
                                        <tr key={kyc._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/50 transition-colors">
                                            <td className="p-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className="p-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                                                {data.name}
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                                {data.email}
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                                {data.panNumber}
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                                {data.aadharNumber}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase ${data.status === 'Approved'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                    : data.status === 'Rejected'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                                    }`}>
                                                    {data.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                {data.date ? format(new Date(data.date), 'dd/MM/yyyy') : '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(kyc._id)}
                                                        className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-emerald-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    {data.status === 'Rejected' && (
                                                        <button className="p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors">
                                                            <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#021F17]">
                                        No KYC submissions found.
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
                                className="appearance-none bg-[#112E2D] text-white px-3 py-1.5 pr-8 rounded-md text-[11px] font-bold outline-none cursor-pointer"
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
                                    ? 'bg-[#112E2D] text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-500'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {showDetailsModal && selectedKyc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>
                    <div className="relative rounded-2xl p-8 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 border overflow-y-auto max-h-[90vh]" style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">View KYC Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                    {selectedKycData?.name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                                <div className="text-base font-bold text-gray-900 dark:text-white truncate" title={selectedKycData?.email}>
                                    {selectedKycData?.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Aadhar Number</label>
                                <div className="text-base font-bold text-gray-900 dark:text-white">{selectedKycData?.aadharNumber}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">PAN Number</label>
                                <div className="text-base font-bold text-gray-900 dark:text-white">{selectedKycData?.panNumber}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Updated At</label>
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                    {selectedKyc.updatedAt ? format(new Date(selectedKyc.updatedAt), 'dd/MM/yyyy, HH:mm:ss') : '-'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Admin Remark</label>
                                <textarea
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                    placeholder="Enter remark here"
                                    className="w-full h-20 p-3 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-100 dark:border-[#021F17] rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Aadhar Front</label>
                                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    {selectedKycData?.aadharFront && <img src={selectedKycData.aadharFront} alt="Aadhar Front" className="w-full h-full object-cover" />}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Aadhar Back</label>
                                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    {selectedKycData?.aadharBack && <img src={selectedKycData.aadharBack} alt="Aadhar Back" className="w-full h-full object-cover" />}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">PAN Card</label>
                                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    {selectedKycData?.panCard && <img src={selectedKycData.panCard} alt="PAN Card" className="w-full h-full object-cover" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700/50">
                            <button
                                onClick={() => handleVerify('Rejected')}
                                className="px-8 py-2.5 bg-red-500 text-white rounded-xl font-bold transition-colors hover:bg-red-600"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleVerify('Approved')}
                                className="px-8 py-2.5 bg-[#0F8235] text-white rounded-xl font-bold transition-colors hover:bg-[#0b6528]"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-8 py-2.5 bg-slate-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
