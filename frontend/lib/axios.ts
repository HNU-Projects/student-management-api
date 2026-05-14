import axios from 'axios';
import { toast } from 'sonner';

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

    // Handle 429 Too Many Requests (Rate Limiting)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || error.response.data?.retry_after_seconds;
      const message = error.response.data?.detail || "Too many requests. Please slow down.";
      
      toast.error(message, {
        description: retryAfter ? `Please try again in ${retryAfter} seconds.` : "You have hit the rate limit.",
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If we are on the login page and get a 401, it's a failed login attempt
      if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
         // The login page handles its own error display, but we could add a toast here too
         // toast.error("Invalid email or password");
      } else if (typeof window !== 'undefined') {
         // Auto-logout for expired tokens on other pages
         localStorage.removeItem('token');
         const locale = getCurrentLocale();
         window.location.href = `/${locale}/login`;
      }
    }

    // Handle 500 or Network Errors
    if (!error.response) {
      toast.error("Network Error", {
        description: "Please check your internet connection or the server status.",
      });
    }

    return Promise.reject(error);
  }
);

export default api;