import axios from "axios";

// Determine API base URL dynamically
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running on localhost or 127.0.0.1, check if backend port is available
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
  }
  return "https://sudisha-foundation-management.onrender.com/api";
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
});

// Request Interceptor: Attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and optionally redirect if expired
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && !currentPath.startsWith("/verify")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
    }
    return Promise.reject(error);
  }
);

// Helper to get image upload URL
export const getUploadUrl = (photoName) => {
  if (!photoName) return null;
  if (photoName.startsWith("http://") || photoName.startsWith("https://") || photoName.startsWith("blob:")) {
    return photoName;
  }
  const baseUrl = getBaseUrl().replace(/\/api\/?$/, "");
  return `${baseUrl}/uploads/${photoName}`;
};

export default API;