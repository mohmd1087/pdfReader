import axios from 'axios';

// Create an instance of Axios with default configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

// Add a request interceptor to include the JWT token in the headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
