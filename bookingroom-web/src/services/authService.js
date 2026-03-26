import { apiClient } from "./apiClient";

export async function login(payload) {
  const response = await apiClient.post("/api/auth/login", payload);
  return response.data;
}

export async function register(payload) {
  const response = await apiClient.post("/api/auth/register", payload);
  return response.data;
}

export async function me() {
  const response = await apiClient.get("/api/auth/me");
  return response.data;
}
