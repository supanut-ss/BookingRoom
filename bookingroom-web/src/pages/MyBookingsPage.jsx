import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { cancelBooking, getMyBookings } from "../services/bookingsService";

export function MyBookingsPage() {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
  });

  return (
    <div className="card">
      <h2>My bookings</h2>
      {bookingsQuery.isLoading ? <p>Loading...</p> : null}
      <ul className="list">
        {(bookingsQuery.data ?? []).map((booking) => {
          const id = booking.id ?? booking.Id;
          const roomName = booking.roomName ?? booking.RoomName;
          const start = booking.startUtc ?? booking.StartUtc;
          const end = booking.endUtc ?? booking.EndUtc;
          const purpose = booking.purpose ?? booking.Purpose;
          const isCancelled = booking.isCancelled ?? booking.IsCancelled;

          return (
            <li key={id}>
              <strong>{roomName}</strong> |{" "}
              {dayjs(start).format("YYYY-MM-DD HH:mm")} -{" "}
              {dayjs(end).format("YYYY-MM-DD HH:mm")} | {purpose}
              {!isCancelled ? (
                <button type="button" onClick={() => cancelMutation.mutate(id)}>
                  Cancel
                </button>
              ) : (
                <span> (Cancelled)</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
