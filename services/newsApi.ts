import axiosInstance from './axiosInstance';

// --- Categories ---

export const getNewsCategories = async () => {
    try {
        const response = await axiosInstance.get('/news/admin/categories', {
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
    const response = await axiosInstance.post('/news/admin/categories', data);
    return response.data;
};

export const updateNewsCategory = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/news/admin/categories/${id}`, data);
    return response.data;
};

export const deleteNewsCategory = async (id: string) => {
    const response = await axiosInstance.delete(`/news/admin/categories/${id}`);
    return response.data;
};

// --- News ---

export const getNewsStats = async () => {
    try {
        const response = await axiosInstance.get('/news/admin/stats', {
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
        const response = await axiosInstance.get('/news/admin', {
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
    const response = await axiosInstance.get(`/news/admin/${id}`);
    return response.data;
};

export const createNews = async (data: any) => {
    // If sending FormData (for images), axios handles Content-Type automatically
    const response = await axiosInstance.post('/news/admin', data);
    return response.data;
};

export const updateNews = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/news/admin/${id}`, data);
    return response.data;
};

export const deleteNews = async (id: string) => {
    const response = await axiosInstance.delete(`/news/admin/${id}`);
    return response.data;
};
