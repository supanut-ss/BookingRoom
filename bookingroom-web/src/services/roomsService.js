import { apiClient } from "./apiClient";

export async function getRooms() {
  const response = await apiClient.get("/api/rooms");
  return response.data;
}

export async function createRoom(payload) {
  const response = await apiClient.post("/api/rooms", payload);
  return response.data;
}

export async function updateRoom(id, payload) {
  await apiClient.put(`/api/rooms/${id}`, payload);
}

export async function deleteRoom(id) {
  await apiClient.delete(`/api/rooms/${id}`);
}
