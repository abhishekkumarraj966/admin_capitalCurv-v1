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

// --- FAQs ---

export const getFaqs = async () => {
    const response = await axios.get(`${API_URL}/content/admin/faqs`, getAuthHeaders());
    return response.data;
};

/**
 * Robust FAQ fetcher with multiple route patterns and list-filtering fallback.
 * Resolves 404 errors when a direct ID fetch endpoint is missing or differently named.
 */
export const getFaqById = async (id: string) => {
    try {
        // 1. Try plural route (standard REST list pattern)
        const resPlural = await axios.get(`${API_URL}/content/admin/faqs/${id}`, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500
        });
        if (resPlural.status === 200) return resPlural.data;

        // 2. Try singular route (common variation)
        const resSingular = await axios.get(`${API_URL}/content/admin/faq/${id}`, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500
        });
        if (resSingular.status === 200) return resSingular.data;

        // 3. Fallback: Search in the full list
        const listData = await getFaqs();
        const list = listData.result?.data || listData.result || listData || [];
        const found = Array.isArray(list) ? list.find((f: any) => f._id === id || f.id === id) : null;

        if (found) {
            return { result: found };
        }

        throw new Error('FAQ not found');
    } catch (error) {
        console.warn('getFaqById: Final fallback search due to error:', error);
        const listData = await getFaqs();
        const list = listData.result?.data || listData.result || listData || [];
        const found = Array.isArray(list) ? list.find((f: any) => f._id === id || f.id === id) : null;
        if (found) return { result: found };
        throw error;
    }
};

export const createFaq = async (data: any) => {
    const response = await axios.post(`${API_URL}/content/admin/faqs`, data, getAuthHeaders());
    return response.data;
};

/**
 * Robust Update: Tries both plural and singular routes.
 */
export const updateFaq = async (id: string, data: any) => {
    try {
        const resPlural = await axios.put(`${API_URL}/content/admin/faqs/${id}`, data, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500
        });
        if (resPlural.status >= 200 && resPlural.status < 300) return resPlural.data;

        const resSingular = await axios.put(`${API_URL}/content/admin/faq/${id}`, data, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500
        });
        if (resSingular.status >= 200 && resSingular.status < 300) return resSingular.data;

        throw new Error(`Update failed with status ${resSingular.status}`);
    } catch (error) {
        // Final attempt with original pattern if everything fails
        const response = await axios.put(`${API_URL}/content/admin/faqs/${id}`, data, getAuthHeaders());
        return response.data;
    }
};

/**
 * Robust Delete: Tries both plural and singular routes.
 */
export const deleteFaq = async (id: string) => {
    try {
        const resPlural = await axios.delete(`${API_URL}/content/admin/faqs/${id}`, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500
        });
        if (resPlural.status >= 200 && resPlural.status < 300) return resPlural.data;

        const resSingular = await axios.delete(`${API_URL}/content/admin/faq/${id}`, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500
        });
        if (resSingular.status >= 200 && resSingular.status < 300) return resSingular.data;

        throw new Error(`Delete failed with status ${resSingular.status}`);
    } catch (error) {
        const response = await axios.delete(`${API_URL}/content/admin/faqs/${id}`, getAuthHeaders());
        return response.data;
    }
};

// --- General Content (Terms, etc.) ---

export const getAllContent = async () => {
    const response = await axios.get(`${API_URL}/content/admin/all`, getAuthHeaders());
    return response.data;
};

export const saveContent = async (data: any) => {
    const response = await axios.post(`${API_URL}/content/admin/content`, data, getAuthHeaders());
    return response.data;
};
