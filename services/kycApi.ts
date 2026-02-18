import axiosInstance from './axiosInstance';

export const getKycList = async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const response = await axiosInstance.get('/kyc/admin/list', {
        params,
    });
    return response.data;
};

export const getKycDetails = async (id: string) => {
    const response = await axiosInstance.get(`/kyc/admin/${id}`);
    return response.data;
};

export const verifyKyc = async (data: { kycId: string; documentType: string; status: string; rejectionReason?: string }) => {
    const response = await axiosInstance.post('/kyc/admin/verify', data);
    return response.data;
};

export const verifyBank = async (id: string, data: { approve: boolean }) => {
    const response = await axiosInstance.post(`/kyc/admin/${id}/verify-bank`, data);
    return response.data;
};
