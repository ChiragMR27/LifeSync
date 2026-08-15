import axios from 'axios';

// 1. Connection to LOCAL Auth Service
export const authApi = axios.create({
    baseURL: 'https://auth-service-hx5f.onrender.com/api/auth' 
});

// 2. Connection to LOCAL Family Service
export const familyApi = axios.create({
    baseURL: 'https://lifesync-family-backend.onrender.com/api/family'
});

// 3. The Auto-Token Attacher
familyApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});