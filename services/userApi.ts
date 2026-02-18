import axiosInstance from './axiosInstance';

export const getUsers = async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const response = await axiosInstance.get('/users', {
        params,
    });
    return response.data;
};

export const getUserById = async (id: string) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
};

export const deleteUser = async (id: string) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
};

export const updateUserStatus = async (id: string, status: string) => {
    const response = await axiosInstance.put(`/users/${id}/status`, { status });
    return response.data;
};
