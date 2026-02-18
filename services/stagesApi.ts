import axiosInstance from './axiosInstance';

export const getStageConfigs = async () => {
    const response = await axiosInstance.get('/stages/admin/config');
    return response.data;
};

export const createOrUpdateStageConfig = async (data: any) => {
    const response = await axiosInstance.post('/stages/admin/config', data);
    return response.data;
};

export const updateStageConfig = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/stages/admin/config/${id}`, data);
    return response.data;
};

export const getUserStages = async (params?: { limit?: number; page?: number }) => {
    const response = await axiosInstance.get('/stages/admin/users', {
        params
    });
    return response.data;
};

export const advanceUserStage = async (data: { userId: string; stageId: string }) => {
    const response = await axiosInstance.post('/stages/admin/advance', data);
    return response.data;
};

export const resetDailyLoss = async (stageId: string) => {
    const response = await axiosInstance.post('/stages/admin/reset-daily-loss', { stageId });
    return response.data;
};

export const getStageTrades = async (stageId: string) => {
    const response = await axiosInstance.get(`/stages/admin/trades/${stageId}`);
    return response.data;
};
