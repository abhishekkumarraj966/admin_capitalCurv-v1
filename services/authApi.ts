import axiosInstance from './axiosInstance';

export const adminLogin = async (data: any) => {
    const response = await axiosInstance.post('/admin/login', data);
    return response.data;
};

export const refreshToken = async (refreshToken: string) => {
    const response = await axiosInstance.post('/admin/refresh-token', { refreshToken });
    return response.data;
};

export const forgotPassword = async (email: string) => {
    const response = await axiosInstance.post('/admin/forgot-password', { email });
    return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
    const response = await axiosInstance.post('/admin/verify-otp', { email, otp });
    return response.data;
};

export const resetPassword = async (data: any) => {
    const response = await axiosInstance.put('/admin/reset-password', data);
    return response.data;
};

export const adminLogout = async () => {
    const response = await axiosInstance.post('/admin/logout');
    return response.data;
};

export const changePassword = async (data: any) => {
    const response = await axiosInstance.put('/admin/change-password', data);
    return response.data;
};

export const getAdminProfile = async () => {
    const response = await axiosInstance.get('/admin/profile');
    return response.data;
};
