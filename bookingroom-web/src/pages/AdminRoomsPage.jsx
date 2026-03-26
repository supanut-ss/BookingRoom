import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoom, deleteRoom, getRooms } from "../services/roomsService";

export function AdminRoomsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", location: "", capacity: 1 });
  const [message, setMessage] = useState("");

  const roomsQuery = useQuery({
    queryKey: ["rooms-admin"],
    queryFn: getRooms,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms-admin"] });
      setForm({ name: "", location: "", capacity: 1 });
      setMessage("Room added successfully.");
    },
    onError: (error) =>
      setMessage(error?.response?.data ?? "Unable to add room."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms-admin"] });
      setMessage("Room deleted successfully.");
    },
    onError: (error) =>
      setMessage(error?.response?.data ?? "Unable to delete room."),
  });

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <h2>Admin - Rooms</h2>
          <p className="page-subtitle">
            Create and manage room inventory for all teams.
          </p>
        </div>
      </div>

      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          createMutation.mutate({ ...form, capacity: Number(form.capacity) });
        }}
      >
        <div className="form-row">
          <div className="field-group">
            <label htmlFor="roomName">Name</label>
            <input
              id="roomName"
              placeholder="Ocean"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="roomLocation">Location</label>
            <input
              id="roomLocation"
              placeholder="Floor 2"
              value={form.location}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, location: event.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="roomCapacity">Capacity</label>
          <input
            id="roomCapacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, capacity: event.target.value }))
            }
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Add room
        </button>
      </form>

      {message ? (
        <p
          className={
            message.includes("success") ? "status success" : "status error"
          }
        >
          {message}
        </p>
      ) : null}

      <ul className="list">
        {(roomsQuery.data ?? []).map((room) => {
          const id = room.id ?? room.Id;
          return (
            <li key={id} className="list-item">
              <div className="row-between">
                <div>
                  <strong>{room.name ?? room.Name}</strong>
                  <div className="muted">
                    {room.location ?? room.Location} • Capacity:{" "}
                    {room.capacity ?? room.Capacity}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setMessage("");
                    deleteMutation.mutate(id);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
