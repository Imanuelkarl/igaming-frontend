// src/api.ts
import axios from 'axios';

const getBackendUrl = () => {
  const frontendHost = window.location.host;

  if (frontendHost.includes("localhost:5177")) {
    return "http://claims.intelsoftgroup.com:3000"; // Local backend
  }
  else{
    return "http://claims.intelsoftgroup.com:3000";
  }

  // Use the same origin as frontend when deployed
  
};

const api = axios.create({
  baseURL: getBackendUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;