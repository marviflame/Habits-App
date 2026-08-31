import axios, { type AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

const TOKEN_KEY = 'habits_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

export const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      clearToken();
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else {
      const msg = err?.response?.data?.error || err?.message || 'Something went wrong';
      if (typeof msg === 'string' && status !== 404) toast.error(msg);
    }
    return Promise.reject(err);
  }
);
