'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getTicketById, replyTicket, assignTicket } from '@/services/supportApi';
import { Send, User, Calendar, Clock, Tag, MessageSquare, CheckCircle, AlertCircle, Paperclip, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function ViewTicketPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();


    const { id } = use(params);

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Reply State
    const [replyMessage, setReplyMessage] = useState('');
    const [replyStatus, setReplyStatus] = useState('open'); // active status
    const [replyLoading, setReplyLoading] = useState(false);

    // Assign State
    const [assigneeId, setAssigneeId] = useState('');
    const [assigning, setAssigning] = useState(false);

    const fetchTicket = async () => {
        try {
            // Note: Using getTicketById which fetches LIST and filters.
            // If API provides GET /support/admin/:id, update prompt to use it.
            // For now relying on list filter as implemented in service.
            // Actually, I should inspect getTicketById. It uses getTickets(). This is fine.
            const res = await getTicketById(id);
            // The service returns the response body directly, so we check for result/data.
            const ticketData = (res as any).result || (res as any).data || res;
            setTicket(ticketData);
        } catch (error) {
            console.error('Failed to fetch ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setReplyLoading(true);
        try {
            await replyTicket(id, {
                message: replyMessage,
                status: replyStatus
            });
            setReplyMessage('');
            fetchTicket(); // Refresh to see updated status/messages if returned
            alert('Reply sent successfully');
        } catch (error) {
            console.error('Failed to reply:', error);
            alert('Failed to send reply');
        } finally {
            setReplyLoading(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assigneeId.trim()) return;

        setAssigning(true);
        try {
            await assignTicket(id, { assignedTo: assigneeId });
            fetchTicket();
            alert('Ticket assigned successfully');
        } catch (error) {
            console.error('Failed to assign ticket:', error);
            alert('Failed to assign ticket');
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading ticket details...</div>;
    if (!ticket) return <div className="p-8 text-center text-gray-500">Ticket not found</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white dark:bg-[#021F17] border border-gray-100 dark:border-[#021F17] rounded-xl hover:bg-gray-50 dark:hover:bg-[#000F0A] transition-colors text-gray-500 dark:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Ticket <span className="text-gray-400">#{ticket._id.slice(-6).toUpperCase()}</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chat/Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ticket Info Card */}
                    <div className="bg-white dark:bg-[#021F17] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17]">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ticket.subject}</h2>
                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(ticket.createdAt), 'HH:mm')}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-emerald-100 text-emerald-700' :
                                ticket.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#000F0A]/50 p-4 rounded-xl text-gray-700 dark:text-gray-300 text-sm leading-relaxed border border-gray-100 dark:border-[#021F17]">
                            {ticket.message}
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="space-y-6">
                        {ticket.replies?.map((reply: any, index: number) => (
                            <div key={index} className={`flex gap-4 ${reply.sender === 'Admin' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reply.sender === 'Admin' ? 'bg-[#0F8235] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                    }`}>
                                    {reply.sender === 'Admin' ? 'A' : <User size={16} />}
                                </div>
                                <div className={`max-w-[80%] space-y-1 ${reply.sender === 'Admin' ? 'items-end flex flex-col' : ''}`}>
                                    <div className={`p-4 rounded-2xl text-sm ${reply.sender === 'Admin'
                                        ? 'bg-[#0F8235] text-white rounded-tr-none'
                                        : 'bg-white dark:bg-[#021F17] text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-[#021F17] rounded-tl-none'
                                        }`}>
                                        {reply.message}
                                    </div>
                                    <span className="text-[10px] text-gray-400 px-2">
                                        {reply.createdAt ? format(new Date(reply.createdAt), 'MMM dd, HH:mm') : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Input */}
                    <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] sticky bottom-6">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Post a Reply</h3>
                        <form onSubmit={handleReply} className="space-y-4">
                            <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your response here..."
                                rows={4}
                                className="w-full p-4 bg-gray-50 dark:bg-[#000F0A]/50 border border-gray-200 dark:border-[#021F17] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F8235]/20 focus:border-[#0F8235] transition-all resize-none dark:text-white placeholder:text-gray-400"
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#000F0A] rounded-lg transition-colors">
                                        <Paperclip size={18} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={replyLoading || !replyMessage.trim()}
                                    className="px-6 py-2.5 bg-[#0F8235] hover:bg-[#0b6528] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                                >
                                    {replyLoading ? 'Sending...' : (
                                        <>
                                            Send Reply <Send size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* User Info */}
                    <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17]">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">User Details</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-[#000F0A] rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-lg">
                                {ticket.userId?.name?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{ticket.userId?.name || 'Unknown User'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.userId?.email || 'No email'}</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 dark:border-[#021F17] pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Member Since</span>
                                <span className="font-medium dark:text-gray-300">Jan 2024</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Tickets</span>
                                <span className="font-medium dark:text-gray-300">12</span>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="bg-white dark:bg-[#021F17] rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17] p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Ticket Info</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-[#021F17]">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-[#021F17]">
                                <span className="text-gray-500">Priority</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    ticket.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {ticket.priority || 'Normal'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-[#021F17]">
                                <span className="text-gray-500">User</span>
                                <span className="font-bold text-gray-900 dark:text-white">{ticket.userId?.name || ticket.userId || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-[#021F17]">
                                <span className="text-gray-500">Email</span>
                                <span className="text-gray-900 dark:text-white break-all text-right pl-4">{ticket.userId?.email || ticket.userId || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions (Replaced Assign Form) */}
                    <div className="bg-white dark:bg-[#021F17] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#021F17]">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full py-3 px-4 bg-gray-50 dark:bg-[#000F0A]/50 hover:bg-gray-100 dark:hover:bg-[#000F0A] border border-gray-100 dark:border-[#021F17] rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors">
                                <CheckCircle size={16} className="text-emerald-500" /> Mark as Resolved
                            </button>
                            <button className="w-full py-3 px-4 bg-gray-50 dark:bg-[#000F0A]/50 hover:bg-gray-100 dark:hover:bg-[#000F0A] border border-gray-100 dark:border-[#021F17] rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors">
                                <AlertCircle size={16} className="text-amber-500" /> Escalate Ticket
                            </button>
                            <button className="w-full py-3 px-4 bg-gray-50 dark:bg-[#000F0A]/50 hover:bg-gray-100 dark:hover:bg-[#000F0A] border border-gray-100 dark:border-[#021F17] rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors">
                                <User size={16} className="text-blue-500" /> Assign to Agent
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
