import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ?? "http://localhost:5224";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("bookingroom_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
