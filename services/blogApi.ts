import axiosInstance from './axiosInstance';

// --- Categories ---

export const getSections = async () => {
    const response = await axiosInstance.get('/blogs/admin/categories');
    return response.data;
};

export const createSection = async (data: { name: string }) => {
    const response = await axiosInstance.post('/blogs/admin/categories', data);
    return response.data;
};

export const updateSection = async (id: string, data: { name: string }) => {
    const response = await axiosInstance.put(`/blogs/admin/categories/${id}`, data);
    return response.data;
};

export const deleteSection = async (id: string) => {
    const response = await axiosInstance.delete(`/blogs/admin/categories/${id}`);
    return response.data;
};

// --- Blogs ---

export const getStats = async () => {
    const response = await axiosInstance.get('/blogs/admin/stats');
    return response.data;
};

export const getBlogs = async () => {
    const response = await axiosInstance.get('/blogs/admin');
    return response.data;
};

export const createBlog = async (data: FormData | object) => {
    // If sending file, let axios set Content-Type
    const response = await axiosInstance.post('/blogs/admin', data);
    return response.data;
};

export const getBlogById = async (id: string) => {
    const response = await axiosInstance.get(`/blogs/admin/${id}`);
    return response.data;
};

export const updateBlog = async (id: string, data: FormData | object) => {
    const response = await axiosInstance.put(`/blogs/admin/${id}`, data);
    return response.data;
};

export const deleteBlog = async (id: string) => {
    const response = await axiosInstance.delete(`/blogs/admin/${id}`);
    return response.data;
};
