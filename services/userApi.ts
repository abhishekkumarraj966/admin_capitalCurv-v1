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

export const getUsers = async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const response = await axios.get(`${API_URL}/users`, {
        ...getAuthHeaders(),
        params,
    });
    return response.data;
};

export const getUserById = async (id: string) => {
    const response = await axios.get(`${API_URL}/users/${id}`, getAuthHeaders());
    return response.data;
};

export const deleteUser = async (id: string) => {
    const response = await axios.delete(`${API_URL}/users/${id}`, getAuthHeaders());
    return response.data;
};

export const updateUserStatus = async (id: string, status: string) => {
    const response = await axios.put(`${API_URL}/users/${id}/status`, { status }, getAuthHeaders());
    return response.data;
};
