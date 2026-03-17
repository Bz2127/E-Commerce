import axios from "axios";
const baseURL = process.env.REACT_APP_API_URL || "https://ecommerce-backend-t7o6.onrender.com/api";

const api = axios.create({
  baseURL: baseURL,
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