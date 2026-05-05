import axios from 'axios';

// Helper function to get current locale from URL path
const getCurrentLocale = (): string => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(en|ar)/);
    return localeMatch ? localeMatch[1] : 'en';
  }
  return 'en';
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Add a request interceptor to add the auth token and locale to requests
api.interceptors.request.use(config => {
  // Add Auth Token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Add Accept-Language header based on current locale
  const currentLocale = getCurrentLocale();
  config.headers['Accept-Language'] = currentLocale;
  
  return config;
});

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // In a real app, you'd call a refresh token endpoint here
      // For now, let's just logout if unauthorized
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
         localStorage.removeItem('token');
         const locale = getCurrentLocale();
         window.location.href = `/${locale}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;