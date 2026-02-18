import axiosInstance from './axiosInstance';

export const getTransactions = async (params?: { page?: number; limit?: number; type?: string; status?: string }) => {
    const response = await axiosInstance.get('/transactions/admin/all', {
        params,
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const getTransactionStats = async () => {
    const response = await axiosInstance.get('/transactions/admin/stats', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const exportTransactions = async () => {
    const response = await axiosInstance.get('/transactions/admin/export', {
        responseType: 'blob',
        validateStatus: (status) => status < 500
    });
    return response.data;
};
