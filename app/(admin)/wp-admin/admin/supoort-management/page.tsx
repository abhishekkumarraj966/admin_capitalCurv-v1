'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTickets } from '@/services/supportApi';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SupportManagementPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await getTickets();
            // Check if response is { result: { tickets: [] } }
            // or { result: [] }
            // or { data: [] }
            // The API docs say "All tickets", but structure could vary.
            // Let's create a robust parser.
            const data = res.result?.tickets || res.result || res.data || res;
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
                {/* Add Create Ticket logic if user meant that? For now, no "Create" endpoint for Admins. */}
            </div>

            <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-[#021F17]">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Ticket ID</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Subject</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Priority</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Assigned To</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Created</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#021F17]">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No tickets found.</td></tr>
                            ) : (
                                tickets.map((ticket: any) => (
                                    <tr key={ticket._id} className="hover:bg-gray-50/50 dark:hover:bg-[#000F0A]/50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-gray-500">{ticket._id.substring(ticket._id.length - 6)}</td>
                                        <td className="p-4 font-bold text-gray-900 dark:text-white">{ticket.subject}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                                ticket.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                ticket.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {ticket.priority || 'Normal'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">{ticket.assignedTo || 'Unassigned'}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : '-'}
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => router.push(`/wp-admin/admin/supoort-management/view/${ticket._id}`)} // Fixed path to supoort-management
                                                className="text-blue-500 hover:text-blue-700"
                                                title="View/Reply"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {/* Edit usually implies structure edits, but for support, maybe Assign/Reply is the primary action. */}
                                            {/* I'll use View button primarily for interactions. */}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
