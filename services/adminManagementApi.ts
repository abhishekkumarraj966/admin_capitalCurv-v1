import axiosInstance from './axiosInstance';

export const getSubAdmins = async (params: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string } = {}) => {
    const response = await axiosInstance.get('/admin/subadmins', {
        params,
    });
    return response.data;
};

export const createSubAdmin = async (data: any) => {
    const response = await axiosInstance.post('/admin/subadmins', data);
    return response.data;
};

export const updateSubAdmin = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/admin/subadmins/${id}`, data);
    return response.data;
};

export const deleteSubAdmin = async (id: string) => {
    const response = await axiosInstance.delete(`/admin/subadmins/${id}`);
    return response.data;
};

export const getSubAdminPermissions = async (id: string) => {
    const response = await axiosInstance.get(`/admin/subadmins/${id}/permissions`);
    return response.data;
};

export const updateSubAdminPermissions = async (id: string, permissions: any) => {
    const response = await axiosInstance.put(`/admin/subadmins/${id}/permissions`, { permissions });
    return response.data;
};
