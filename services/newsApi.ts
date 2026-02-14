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

// --- Categories ---

export const getNewsCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/news/admin/categories`, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500
        });

        if (response.status === 404) {
            return { result: { categories: [] } };
        }

        if (response.status >= 400) {
            throw new Error(response.statusText || 'Request failed');
        }

        return response.data;
    } catch (error) {
        console.error('getNewsCategories 404 handling:', error);
        return { result: { categories: [] } };
    }
};

// ... existing create/update/delete ...

export const createNewsCategory = async (data: any) => {
    // Try sending as FormData as backend might expect multipart (common if sharing router with file upload)
    const formData = new FormData();
    formData.append('name', data.name);

    // Axios will set Content-Type to multipart/form-data with boundary automatically when sending FormData
    const response = await axios.post(`${API_URL}/news/admin/categories`, formData, getAuthHeaders());
    return response.data;
};

export const updateNewsCategory = async (id: string, data: any) => {
    const formData = new FormData();
    formData.append('name', data.name);

    const response = await axios.put(`${API_URL}/news/admin/categories/${id}`, formData, getAuthHeaders());
    return response.data;
};

export const deleteNewsCategory = async (id: string) => {
    const response = await axios.delete(`${API_URL}/news/admin/categories/${id}`, getAuthHeaders());
    return response.data;
};

// --- News ---

export const getNewsStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/news/admin/stats`, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500
        });

        if (response.status === 404) {
            return { result: { totalNews: 0 } };
        }

        if (response.status >= 400) {
            throw new Error(response.statusText || 'Request failed');
        }

        return response.data;
    } catch (error) {
        console.error('getNewsStats 404 handling:', error);
        return { result: { totalNews: 0 } };
    }
};

export const getAllNews = async () => {
    try {
        const response = await axios.get(`${API_URL}/news/admin`, {
            ...getAuthHeaders(),
            validateStatus: (status) => status < 500 // Resolve invalid status codes (like 404)
        });

        if (response.status === 404) {
            return { result: { news: [] } };
        }

        // Throw for other error status codes
        if (response.status >= 400) {
            throw new Error(response.statusText || 'Request failed');
        }

        return response.data;
    } catch (error) {
        console.error('getAllNews 404 handling:', error);
        return { result: { news: [] } };
    }
};

export const getNewsById = async (id: string) => {
    const response = await axios.get(`${API_URL}/news/admin/${id}`, getAuthHeaders());
    return response.data;
};

export const createNews = async (data: any) => {
    // If sending FormData (for images), axios handles Content-Type automatically
    const headers = getAuthHeaders().headers;
    const response = await axios.post(`${API_URL}/news/admin`, data, { headers });
    return response.data;
};

export const updateNews = async (id: string, data: any) => {
    const headers = getAuthHeaders().headers;
    const response = await axios.put(`${API_URL}/news/admin/${id}`, data, { headers });
    return response.data;
};

export const deleteNews = async (id: string) => {
    const response = await axios.delete(`${API_URL}/news/admin/${id}`, getAuthHeaders());
    return response.data;
};
