import axios from "axios";

const isLive = window.location.hostname.includes("render.com");

const api = axios.create({
  baseURL: isLive 
    ? "https://ecommerce-backend-t7o6.onrender.com/api" 
    : "/api", 
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;