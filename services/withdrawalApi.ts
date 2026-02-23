import axiosInstance from './axiosInstance';

export const getWithdrawals = async (params: any) => {
    const response = await axiosInstance.get('/withdrawals/admin', { params });
    return response.data;
};

export const getWithdrawalStats = async () => {
    const response = await axiosInstance.get('/withdrawals/admin/stats');
    return response.data;
};

export const approveWithdrawal = async (id: string, data: any) => {
    const response = await axiosInstance.post(`/withdrawals/admin/${id}/approve`, data);
    return response.data;
};

export const rejectWithdrawal = async (id: string, data: { reason: string }) => {
    const response = await axiosInstance.post(`/withdrawals/admin/${id}/reject`, data);
    return response.data;
};
