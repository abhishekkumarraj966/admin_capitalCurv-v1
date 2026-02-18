import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL || '',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('adminAccessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // Some endpoints might expect 'token' header as well based on previous code
                config.headers.token = token;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
