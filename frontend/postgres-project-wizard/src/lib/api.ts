import axios from 'axios';

// Base URL for the API - will be used by the proxy in development
const API_URL = '/api';

// Create an Axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
});

// Request interceptor for adding auth token, etc.
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error status codes
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/auth';
      }
      
      // You can handle other status codes here
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common HTTP methods
export const get = async (url: string) => {
  const response = await axiosInstance.get(url);
  return response.data;
};

export const post = async (url: string, data: any) => {
  const response = await axiosInstance.post(url, data);
  return response.data;
};

export const put = async (url: string, data: any) => {
  const response = await axiosInstance.put(url, data);
  return response.data;
};

export const del = async (url: string) => {
  const response = await axiosInstance.delete(url);
  return response.data;
};

// Export the axios instance for more complex use cases
export default { axiosInstance, get, post, put, del }; 