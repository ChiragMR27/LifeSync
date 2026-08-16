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
const attachToken = (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// THE FIX: Now BOTH APIs will automatically carry the JWT token!
authApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
familyApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));