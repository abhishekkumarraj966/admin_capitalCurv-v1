import axiosInstance from './axiosInstance';

export const getReferrals = async () => {
    const response = await axiosInstance.get('/referrals/admin', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// ... existing code ...

// "Create" referral = Credit Commission
export const creditCommission = async (data: { userId: string; amount: number }) => {
    // Using FormData to avoid JSON parsing issues on backend (same as News API fix)
    const formData = new FormData();
    formData.append('userId', data.userId);
    formData.append('amount', data.amount.toString());

    const response = await axiosInstance.post('/referrals/admin/credit', formData);
    return response.data;
};

// "Cancel" commission
export const cancelCommission = async (data: any) => {
    const formData = new FormData();
    // Assuming data contains referralId or similar. Flattening object to formData.
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const response = await axiosInstance.post('/referrals/admin/cancel', formData);
    return response.data;
};

export const getReferralById = async (id: string) => {
    // Assuming backend supports this standard pattern
    const response = await axiosInstance.get(`/referrals/admin/${id}`);
    return response.data;
};

export const getReferralStats = async () => {
    const response = await axiosInstance.get('/referrals/admin/stats', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};
