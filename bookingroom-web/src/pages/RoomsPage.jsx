import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBooking, getAvailability } from "../services/bookingsService";

export function RoomsPage() {
  const [form, setForm] = useState({
    startUtc: "",
    endUtc: "",
    minCapacity: "",
    purpose: "",
  });
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [message, setMessage] = useState("");

  const enabled = Boolean(form.startUtc && form.endUtc);

  const availabilityQuery = useQuery({
    queryKey: ["availability", form.startUtc, form.endUtc, form.minCapacity],
    queryFn: () => getAvailability(form),
    enabled,
  });

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => setMessage("Booking created successfully."),
    onError: (error) =>
      setMessage(error?.response?.data ?? "Unable to create booking."),
  });

  const onSearch = (event) => {
    event.preventDefault();
    setMessage("");
    availabilityQuery.refetch();
  };

  const onBook = () => {
    if (!selectedRoomId) {
      setMessage("Select a room first.");
      return;
    }

    bookingMutation.mutate({
      roomId: Number(selectedRoomId),
      startUtc: form.startUtc,
      endUtc: form.endUtc,
      purpose: form.purpose || "Meeting",
    });
  };

  return (
    <div className="card">
      <h2>Find available rooms</h2>
      <form className="form-grid" onSubmit={onSearch}>
        <input
          type="datetime-local"
          value={form.startUtc}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, startUtc: event.target.value }))
          }
          required
        />
        <input
          type="datetime-local"
          value={form.endUtc}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, endUtc: event.target.value }))
          }
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Min capacity"
          value={form.minCapacity}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, minCapacity: event.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Purpose"
          value={form.purpose}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, purpose: event.target.value }))
          }
        />
        <button type="submit">Search</button>
      </form>

      {availabilityQuery.isLoading ? <p>Loading rooms...</p> : null}
      {availabilityQuery.data?.length ? (
        <ul className="list">
          {availabilityQuery.data.map((room) => (
            <li key={room.id ?? room.Id}>
              <label>
                <input
                  type="radio"
                  name="room"
                  value={room.id ?? room.Id}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                />
                {room.name ?? room.Name} - {room.location ?? room.Location}{" "}
                (Capacity: {room.capacity ?? room.Capacity})
              </label>
            </li>
          ))}
        </ul>
      ) : enabled && !availabilityQuery.isLoading ? (
        <p>No rooms found.</p>
      ) : null}

      <button
        type="button"
        onClick={onBook}
        disabled={bookingMutation.isPending}
      >
        Book selected room
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
