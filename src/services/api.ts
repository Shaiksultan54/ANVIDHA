import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast for auth endpoints or if the request was cancelled
    if (!error.config?.url?.includes('/auth/') && !axios.isCancel(error)) {
      const message = 
        error.response?.data?.message || 
        'Something went wrong. Please try again.';
      toast.error(message);
    }
    
    // Handle session expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;