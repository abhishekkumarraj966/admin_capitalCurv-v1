import axiosInstance from './axiosInstance';

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
    const response = await axiosInstance.get('/security/admin/stats', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// Get all login sessions
export const getSessions = async (params: SessionQueryParams = {}) => {
    const response = await axiosInstance.get('/security/admin/sessions', {
        params,
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// Get all violations
export const getViolations = async (params: ViolationQueryParams = {}) => {
    const response = await axiosInstance.get('/security/admin/violations', {
        params,
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// Verify or reject a travel claim
export const verifyTravel = async (data: { sessionId: string; isVerified: boolean; notes?: string }) => {
    const response = await axiosInstance.post('/security/admin/verify-travel', data);
    return response.data;
};

// Resolve a violation
export const resolveViolation = async (id: string, data: { notes?: string }) => {
    const response = await axiosInstance.put(`/security/admin/violations/${id}/resolve`, data);
    return response.data;
};
