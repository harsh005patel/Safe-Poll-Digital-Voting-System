import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add request interceptor for logging
API.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // If token exists, add to headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('Making request:', config);
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for logging
API.interceptors.response.use((response) => {
  console.log('Response received:', response);
  return response;
}, (error) => {
  console.error('Response error:', error);
  return Promise.reject(error);
});

export default API; 