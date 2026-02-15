import axios from 'axios';

const API_URL = 'https://curv-backend-new.onrender.com/api/v1';
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://curv-backend-new.onrender.com/api/v1';


const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null;
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            token: token || '', // Some endpoints expect this redundant header
        },
    };
};

export const adminLogin = async (data: any) => {
    const response = await axios.post(`${API_URL}/admin/login`, data);
    return response.data;
};

export const refreshToken = async (refreshToken: string) => {
    const response = await axios.post(`${API_URL}/admin/refresh-token`, { refreshToken });
    return response.data;
};

export const forgotPassword = async (email: string) => {
    const response = await axios.post(`${API_URL}/admin/forgot-password`, { email });
    return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
    const response = await axios.post(`${API_URL}/admin/verify-otp`, { email, otp });
    return response.data;
};

export const resetPassword = async (data: any) => {
    const response = await axios.put(`${API_URL}/admin/reset-password`, data);
    return response.data;
};

export const adminLogout = async () => {
    const response = await axios.post(`${API_URL}/admin/logout`, {}, getAuthHeaders());
    return response.data;
};

export const changePassword = async (data: any) => {
    const response = await axios.put(`${API_URL}/admin/change-password`, data, getAuthHeaders());
    return response.data;
};

export const getAdminProfile = async () => {
    const response = await axios.get(`${API_URL}/admin/profile`, getAuthHeaders());
    return response.data;
};
