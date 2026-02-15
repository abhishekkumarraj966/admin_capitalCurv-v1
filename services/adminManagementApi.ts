import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://curv-backend-new.onrender.com/api/v1';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null;
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            token: token || '',
        },
    };
};

export const getSubAdmins = async (params: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string } = {}) => {
    const response = await axios.get(`${API_URL}/admin/subadmins`, {
        ...getAuthHeaders(),
        params,
    });
    return response.data;
};

export const createSubAdmin = async (data: any) => {
    const response = await axios.post(`${API_URL}/admin/subadmins`, data, getAuthHeaders());
    return response.data;
};

export const updateSubAdmin = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/admin/subadmins/${id}`, data, getAuthHeaders());
    return response.data;
};

export const deleteSubAdmin = async (id: string) => {
    const response = await axios.delete(`${API_URL}/admin/subadmins/${id}`, getAuthHeaders());
    return response.data;
};

export const getSubAdminPermissions = async (id: string) => {
    const response = await axios.get(`${API_URL}/admin/subadmins/${id}/permissions`, getAuthHeaders());
    return response.data;
};

export const updateSubAdminPermissions = async (id: string, permissions: any) => {
    const response = await axios.put(`${API_URL}/admin/subadmins/${id}/permissions`, { permissions }, getAuthHeaders());
    return response.data;
};
