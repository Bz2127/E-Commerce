import axios from "axios";

// This checks if the website is running on Render
const isLive = window.location.hostname.includes("render.com");

const api = axios.create({
  // We use the full URL for live, and the full localhost URL for local
  baseURL: isLive 
    ? "https://ecommerce-backend-t7o6.onrender.com/api" 
    : "http://localhost:5000/api", 
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