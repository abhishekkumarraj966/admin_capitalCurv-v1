import axiosInstance from './axiosInstance';

export interface ReplyTicketData {
    message: string;
    status: string; // e.g., 'open', 'closed'
}

export interface AssignTicketData {
    assignedTo: string; // Admin ID? Or Name? API docs say "string"
}

// Get all tickets
export const getTickets = async () => {
    const response = await axiosInstance.get('/support/admin/list', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// Reply to ticket
export const replyTicket = async (ticketId: string, data: ReplyTicketData) => {
    const response = await axiosInstance.post(`/support/admin/${ticketId}/reply`, data);
    return response.data;
};

// Assign ticket
export const assignTicket = async (ticketId: string, data: AssignTicketData) => {
    const response = await axiosInstance.put(`/support/admin/${ticketId}/assign`, data);
    return response.data;
};

// Get Ticket By ID (Not explicitly provided in "Support Admin" list, but usually needed for View page)
// If not available, we might have to filter from the list or try a standard endpoint.
// Let's assume GET /support/admin/{id} or similar exists or we rely on the list for now?
// The user prompt said "calll all api" and listed 3. 
// I'll add a helper that might filter from list if the backend is strictly those 3.
// But for a "View" page, we usually fetch by ID. 
// I'll try fetching from the list for now if strict. 
// Wait, for specific item view, usually it's better to fetch. 
// I will implement `getTicketById` using the List endpoint and filtering for now to be safe, 
// as `GET /support/admin/{id}` wasn't listed.
export const getTicketById = async (id: string) => {
    // Fallback: Fetch all and find. 
    // Ideally backend should have GET /support/admin/:id
    const data = await getTickets();
    const tickets = data.result?.tickets || data.result || data || [];
    const ticket = Array.isArray(tickets) ? tickets.find((t: any) => t._id === id || t.id === id) : null;

    if (!ticket) {
        // If not found in list, and if we really suspect there's an endpoint, we could try it.
        // But let's stick to what we know.
        throw new Error('Ticket not found');
    }
    return { result: ticket };
};
