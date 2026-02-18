import axiosInstance from './axiosInstance';

// --- Plans ---

export const getPlans = async () => {
    const response = await axiosInstance.get('/purchase/admin/plans', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const createPlan = async (data: any) => {
    const response = await axiosInstance.post('/purchase/admin/plans', data);
    return response.data;
};

export const getPlanById = async (id: string) => {
    // Backend doesn't support GET /plans/:id, so calculate it here
    const response = await axiosInstance.get('/purchase/admin/plans', {
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
    const response = await axiosInstance.put(`/purchase/admin/plans/${id}`, data);
    return response.data;
};

export const deletePlan = async (id: string) => {
    const response = await axiosInstance.delete(`/purchase/admin/plans/${id}`);
    return response.data;
};

// --- Add-ons ---

export const getAddons = async () => {
    const response = await axiosInstance.get('/purchase/admin/addons', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const createAddon = async (data: any) => {
    const response = await axiosInstance.post('/purchase/admin/addons', data);
    return response.data;
};

// --- Purchases ---

export const getPurchases = async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await axiosInstance.get('/purchase/admin/purchases', {
        params,
        validateStatus: (status) => status < 500
    });
    return response.data;
};

// --- Discounts ---

export const getCollegeDiscounts = async () => {
    const response = await axiosInstance.get('/purchase/admin/college-discounts', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};

export const getCollegeDiscountStats = async () => {
    const response = await axiosInstance.get('/purchase/admin/college-discounts/stats', {
        validateStatus: (status) => status < 500
    });
    return response.data;
};
