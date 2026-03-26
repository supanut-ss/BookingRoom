import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoom, deleteRoom, getRooms } from "../services/roomsService";

export function AdminRoomsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", location: "", capacity: 1 });

  const roomsQuery = useQuery({
    queryKey: ["rooms-admin"],
    queryFn: getRooms,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms-admin"] });
      setForm({ name: "", location: "", capacity: 1 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rooms-admin"] }),
  });

  return (
    <div className="card">
      <h2>Admin - Rooms</h2>
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate({ ...form, capacity: Number(form.capacity) });
        }}
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          required
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, location: event.target.value }))
          }
          required
        />
        <input
          type="number"
          min="1"
          value={form.capacity}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, capacity: event.target.value }))
          }
          required
        />
        <button type="submit">Add room</button>
      </form>

      <ul className="list">
        {(roomsQuery.data ?? []).map((room) => {
          const id = room.id ?? room.Id;
          return (
            <li key={id}>
              {room.name ?? room.Name} - {room.location ?? room.Location}{" "}
              (Capacity: {room.capacity ?? room.Capacity})
              <button type="button" onClick={() => deleteMutation.mutate(id)}>
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
