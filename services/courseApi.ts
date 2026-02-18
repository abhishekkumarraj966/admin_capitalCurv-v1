import axiosInstance from './axiosInstance';

// Course Statistics
export const getCourseStats = async () => {
    const response = await axiosInstance.get('/courses/admin/stats');
    return response.data;
};

// Course Management
export const getCourses = async () => {
    const response = await axiosInstance.get('/courses/admin/all');
    return response.data;
};

export const createCourse = async (data: any) => {
    const response = await axiosInstance.post('/courses/admin', data);
    return response.data;
};

export const updateCourse = async (id: string, data: any) => {
    console.log(`[Diagnostic] PUT /courses/admin/${id}`, data);
    try {
        const response = await axiosInstance.put(`/courses/admin/${id}`, data);
        console.log('[Diagnostic] Update Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('[Diagnostic] Update Error:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteCourse = async (id: string) => {
    const response = await axiosInstance.delete(`/courses/admin/${id}`);
    return response.data;
};

// Video Management
export const getCourseVideos = async (courseId: string) => {
    const response = await axiosInstance.get(`/courses/admin/${courseId}/videos`);
    return response.data;
};

export const createVideo = async (data: any) => {
    const { courseId, ...payload } = data;
    const response = await axiosInstance.post(`/courses/admin/${courseId}/videos`, payload);
    return response.data;
};

export const updateVideo = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/courses/admin/videos/${id}`, data);
    return response.data;
};

export const deleteVideo = async (id: string) => {
    const response = await axiosInstance.delete(`/courses/admin/videos/${id}`);
    return response.data;
};

export const reorderVideos = async (courseId: string, videoOrder: { videoId: string; sortOrder: number }[]) => {
    const response = await axiosInstance.put(`/courses/admin/${courseId}/videos/reorder`, { videoOrder });
    return response.data;
};
