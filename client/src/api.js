import axios from "axios";
import { getStoredValue, removeStoredValue } from "./storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

api.interceptors.request.use((config) => {
  const token = getStoredValue("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.message === "Invalid session") {
      removeStoredValue("adminToken");
      removeStoredValue("adminUser");
      window.dispatchEvent(new Event("admin-session-invalid"));
    }

    return Promise.reject(error);
  }
);

export default api;
