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

export const getKycList = async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const response = await axios.get(`${API_URL}/kyc/admin/list`, {
        ...getAuthHeaders(),
        params,
    });
    return response.data;
};

export const getKycDetails = async (id: string) => {
    const response = await axios.get(`${API_URL}/kyc/admin/${id}`, getAuthHeaders());
    return response.data;
};

export const verifyKyc = async (data: { kycId: string; documentType: string; status: string; rejectionReason?: string }) => {
    const response = await axios.post(`${API_URL}/kyc/admin/verify`, data, getAuthHeaders());
    return response.data;
};

export const verifyBank = async (id: string, data: { approve: boolean }) => {
    const response = await axios.post(`${API_URL}/kyc/admin/${id}/verify-bank`, data, getAuthHeaders());
    return response.data;
};
