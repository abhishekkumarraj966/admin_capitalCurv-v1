import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get headers with token
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null;
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        },
    };
};

export const getTransactions = async (params?: { page?: number; limit?: number; type?: string; status?: string }) => {
    const response = await axios.get(`${API_URL}/transactions/admin/all`, {
        ...getAuthHeaders(),
        params,
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const getTransactionStats = async () => {
    const response = await axios.get(`${API_URL}/transactions/admin/stats`, {
        ...getAuthHeaders(),
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const exportTransactions = async () => {
    const response = await axios.get(`${API_URL}/transactions/admin/export`, {
        ...getAuthHeaders(),
        responseType: 'blob',
        validateStatus: (status) => status < 500
    });
    return response.data;
};
