import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null;
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
    };
};

export interface SessionQueryParams {
    suspicious?: boolean;
    userId?: string;
    page?: number;
    limit?: number;
}

export interface ViolationQueryParams {
    type?: string;
    severity?: string;
    userId?: string;
    resolved?: boolean;
}

// Get security statistics
export const getSecurityStats = async () => {
    const response = await axios.get(`${API_URL}/security/admin/stats`, {
        ...getAuthHeaders(),
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// Get all login sessions
export const getSessions = async (params: SessionQueryParams = {}) => {
    const response = await axios.get(`${API_URL}/security/admin/sessions`, {
        ...getAuthHeaders(),
        params,
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// Get all violations
export const getViolations = async (params: ViolationQueryParams = {}) => {
    const response = await axios.get(`${API_URL}/security/admin/violations`, {
        ...getAuthHeaders(),
        params,
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// Verify or reject a travel claim
export const verifyTravel = async (data: { sessionId: string; isVerified: boolean; notes?: string }) => {
    const response = await axios.post(`${API_URL}/security/admin/verify-travel`, data, getAuthHeaders());
    return response.data;
};

// Resolve a violation
export const resolveViolation = async (id: string, data: { notes?: string }) => {
    const response = await axios.put(`${API_URL}/security/admin/violations/${id}/resolve`, data, getAuthHeaders());
    return response.data;
};
