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

export const getReferrals = async () => {
    const response = await axios.get(`${API_URL}/referrals/admin`, {
        ...getAuthHeaders(),
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

    const response = await axios.post(`${API_URL}/referrals/admin/credit`, formData, getAuthHeaders());
    return response.data;
};

// "Cancel" commission
export const cancelCommission = async (data: any) => {
    const formData = new FormData();
    // Assuming data contains referralId or similar. Flattening object to formData.
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    const response = await axios.post(`${API_URL}/referrals/admin/cancel`, formData, getAuthHeaders());
    return response.data;
};

export const getReferralById = async (id: string) => {
    // Assuming backend supports this standard pattern
    const response = await axios.get(`${API_URL}/referrals/admin/${id}`, getAuthHeaders());
    return response.data;
};

export const getReferralStats = async () => {
    const response = await axios.get(`${API_URL}/referrals/admin/stats`, {
        ...getAuthHeaders(),
        validateStatus: (status) => status < 500
    });
    return response.data;
};
