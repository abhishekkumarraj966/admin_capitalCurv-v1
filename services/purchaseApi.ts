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

// --- Plans ---

export const getPlans = async () => {
    const response = await axios.get(`${API_URL}/purchase/admin/plans`, {
        ...getAuthHeaders(),
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const createPlan = async (data: any) => {
    const response = await axios.post(`${API_URL}/purchase/admin/plans`, data, {
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const getPlanById = async (id: string) => {
    // Backend doesn't support GET /plans/:id, so calculate it here
    const response = await axios.get(`${API_URL}/purchase/admin/plans`, {
        ...getAuthHeaders(),
        validateStatus: (status) => status < 500
    });

    // Check if plans exists in response
    const plans = response.data.result?.plans || response.data.result || response.data || [];
    const plan = Array.isArray(plans) ? plans.find((p: any) => p._id === id || p.id === id) : null;

    if (!plan) {
        throw new Error('Plan not found');
    }

    // Return in consistent format (data.result or data)
    return { result: plan };
};

export const updatePlan = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/purchase/admin/plans/${id}`, data, {
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const deletePlan = async (id: string) => {
    const response = await axios.delete(`${API_URL}/purchase/admin/plans/${id}`, getAuthHeaders());
    return response.data;
};

// --- Add-ons ---

export const getAddons = async () => {
    const response = await axios.get(`${API_URL}/purchase/admin/addons`, {
        ...getAuthHeaders(),
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const createAddon = async (data: any) => {
    const response = await axios.post(`${API_URL}/purchase/admin/addons`, data, {
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

// --- Purchases ---

export const getPurchases = async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await axios.get(`${API_URL}/purchase/admin/purchases`, {
        ...getAuthHeaders(),
        params,
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// --- Discounts ---

export const getCollegeDiscounts = async () => {
    const response = await axios.get(`${API_URL}/purchase/admin/college-discounts`, {
        ...getAuthHeaders(),
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const getCollegeDiscountStats = async () => {
    const response = await axios.get(`${API_URL}/purchase/admin/college-discounts/stats`, {
        ...getAuthHeaders(),
        validateStatus: (status) => status < 500
    });
    return response.data;
};
