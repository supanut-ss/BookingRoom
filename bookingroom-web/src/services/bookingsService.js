import dayjs from "dayjs";
import { apiClient } from "./apiClient";

export async function getAvailability({ startUtc, endUtc, minCapacity }) {
  const response = await apiClient.get("/api/bookings/availability", {
    params: {
      startUtc: dayjs(startUtc).toISOString(),
      endUtc: dayjs(endUtc).toISOString(),
      minCapacity: minCapacity || undefined,
    },
  });
  return response.data;
}

export async function createBooking(payload) {
  const response = await apiClient.post("/api/bookings", {
    ...payload,
    startUtc: dayjs(payload.startUtc).toISOString(),
    endUtc: dayjs(payload.endUtc).toISOString(),
  });
  return response.data;
}

export async function getMyBookings() {
  const response = await apiClient.get("/api/bookings/mine");
  return response.data;
}

export async function cancelBooking(id) {
  await apiClient.post(`/api/bookings/${id}/cancel`);
}
