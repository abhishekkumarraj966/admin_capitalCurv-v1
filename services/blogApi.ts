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

export const getSections = async () => {
    const response = await axios.get(`${API_URL}/blogs/admin/categories`, getAuthHeaders());
    return response.data;
};

export const createSection = async (data: { name: string }) => {
    const response = await axios.post(`${API_URL}/blogs/admin/categories`, data, getAuthHeaders());
    return response.data;
};

export const updateSection = async (id: string, data: { name: string }) => {
    const response = await axios.put(`${API_URL}/blogs/admin/categories/${id}`, data, getAuthHeaders());
    return response.data;
};

export const deleteSection = async (id: string) => {
    const response = await axios.delete(`${API_URL}/blogs/admin/categories/${id}`, getAuthHeaders());
    return response.data;
};

// --- Blogs ---

export const getStats = async () => {
    const response = await axios.get(`${API_URL}/blogs/admin/stats`, getAuthHeaders());
    return response.data;
};

export const getBlogs = async () => {
    const response = await axios.get(`${API_URL}/blogs/admin`, getAuthHeaders());
    return response.data;
};

export const createBlog = async (data: FormData | object) => {
    // If sending file, let axios set Content-Type
    const headers = getAuthHeaders().headers;
    const response = await axios.post(`${API_URL}/blogs/admin`, data, { headers });
    return response.data;
};

export const getBlogById = async (id: string) => {
    const response = await axios.get(`${API_URL}/blogs/admin/${id}`, getAuthHeaders());
    return response.data;
};

export const updateBlog = async (id: string, data: FormData | object) => {
    const headers = getAuthHeaders().headers;
    const response = await axios.put(`${API_URL}/blogs/admin/${id}`, data, { headers });
    return response.data;
};

export const deleteBlog = async (id: string) => {
    const response = await axios.delete(`${API_URL}/blogs/admin/${id}`, getAuthHeaders());
    return response.data;
};
