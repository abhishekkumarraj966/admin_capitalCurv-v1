import axios from 'axios';

const API_URL = 'https://curv-backend-new.onrender.com/api/v1'; // process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null;
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        },
    };
};

export const getStageConfigs = async () => {
    const response = await axios.get(`${API_URL}/stages/admin/config`, getAuthHeaders());
    return response.data;
};

export const createOrUpdateStageConfig = async (data: any) => {
    const response = await axios.post(`${API_URL}/stages/admin/config`, data, {
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const updateStageConfig = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/stages/admin/config/${id}`, data, {
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const getUserStages = async (params?: { limit?: number; page?: number }) => {
    const response = await axios.get(`${API_URL}/stages/admin/users`, {
        ...getAuthHeaders(),
        params
    });
    return response.data;
};

export const advanceUserStage = async (data: { userId: string; stageId: string }) => {
    const response = await axios.post(`${API_URL}/stages/admin/advance`, data, {
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const resetDailyLoss = async (stageId: string) => {
    const response = await axios.post(`${API_URL}/stages/admin/reset-daily-loss`, { stageId }, {
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const getStageTrades = async (stageId: string) => {
    const response = await axios.get(`${API_URL}/stages/admin/trades/${stageId}`, getAuthHeaders());
    return response.data;
};
