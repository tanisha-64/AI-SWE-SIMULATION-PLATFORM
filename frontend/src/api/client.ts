import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'https://ai-swe-platform-backend.onrender.com/api/v1';

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again shortly.');
    } else if (!error.response) {
      toast.error('Network error. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;