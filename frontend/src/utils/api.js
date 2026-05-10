import axios from 'axios';

export const AUTH_TOKEN_KEY = 'traveloop.auth.token';
export const AUTH_USER_KEY = 'traveloop.auth.user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
    const isPublicSharePage = window.location.pathname.startsWith('/share/');

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      window.dispatchEvent(new Event('traveloop:auth:expired'));

      if (!isPublicSharePage && window.location.pathname !== '/login') {
        const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.assign(`/login?redirect=${redirect}`);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
