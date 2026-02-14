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

// Course Statistics
export const getCourseStats = async () => {
    const response = await axios.get(`${API_URL}/courses/admin/stats`, getAuthHeaders());
    return response.data;
};

// Course Management
export const getCourses = async () => {
    const response = await axios.get(`${API_URL}/courses/admin/all`, getAuthHeaders());
    return response.data;
};

export const createCourse = async (data: any) => {
    const response = await axios.post(`${API_URL}/courses/admin`, data, getAuthHeaders());
    return response.data;
};

export const updateCourse = async (id: string, data: any) => {
    console.log(`[Diagnostic] PUT ${API_URL}/courses/admin/${id}`, data);
    try {
        const response = await axios.put(`${API_URL}/courses/admin/${id}`, data, getAuthHeaders());
        console.log('[Diagnostic] Update Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('[Diagnostic] Update Error:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteCourse = async (id: string) => {
    const response = await axios.delete(`${API_URL}/courses/admin/${id}`, getAuthHeaders());
    return response.data;
};

// Video Management
export const getCourseVideos = async (courseId: string) => {
    const response = await axios.get(`${API_URL}/courses/admin/${courseId}/videos`, getAuthHeaders());
    return response.data;
};

export const createVideo = async (data: any) => {
    const { courseId, ...payload } = data;
    const response = await axios.post(`${API_URL}/courses/admin/${courseId}/videos`, payload, getAuthHeaders());
    return response.data;
};

export const updateVideo = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/courses/admin/videos/${id}`, data, getAuthHeaders());
    return response.data;
};

export const deleteVideo = async (id: string) => {
    const response = await axios.delete(`${API_URL}/courses/admin/videos/${id}`, getAuthHeaders());
    return response.data;
};

export const reorderVideos = async (courseId: string, videoOrder: { videoId: string; sortOrder: number }[]) => {
    const response = await axios.put(`${API_URL}/courses/admin/${courseId}/videos/reorder`, { videoOrder }, getAuthHeaders());
    return response.data;
};
