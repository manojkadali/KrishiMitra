import axios from 'axios';

// Base URL — override in client/.env via VITE_API_URL for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// ── Request interceptor ────────────────────────────────────────────────────────
// Automatically attaches the stored JWT token to every outgoing request.
// If no token exists (login/register), the header is simply not added.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────────
// Handles 401 Unauthorized globally: clears storage and redirects to login.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
