import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBooking, getAvailability } from "../services/bookingsService";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;
  const label = value.replace(":", ".");

  return { value, label };
});

const START_HOUR_OPTIONS = HOUR_OPTIONS.filter((option) => {
  const hour = Number(option.value.slice(0, 2));
  return hour >= 8 && hour <= 18;
});

function parseDateAndHour(dateValue, hourValue) {
  if (!dateValue || !hourValue) {
    return null;
  }

  const dateMatched = dateValue.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const hourMatched = hourValue.trim().match(/^(\d{2}):(\d{2})$/);
  if (!dateMatched || !hourMatched) {
    return null;
  }

  const year = Number(dateMatched[1]);
  const month = Number(dateMatched[2]);
  const day = Number(dateMatched[3]);
  const hour = Number(hourMatched[1]);
  const minute = Number(hourMatched[2]);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);
  const isValid =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day &&
    parsed.getHours() === hour &&
    parsed.getMinutes() === minute;

  return isValid ? parsed : null;
}

function formatDateTimeDisplay(value) {
  const parsed = value instanceof Date ? value : null;
  if (!parsed) {
    return "-";
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function buildIsoRangeFromInput(date, startHour, endHour) {
  const start = parseDateAndHour(date, startHour);
  const end = parseDateAndHour(date, endHour);

  if (!start || !end) {
    return { error: "Please select date, start hour, and end hour." };
  }

  if (end <= start) {
    return { error: "End time must be later than start time." };
  }

  return {
    startUtc: start.toISOString(),
    endUtc: end.toISOString(),
  };
}

export function RoomsPage() {
  const [form, setForm] = useState({
    startDate: "",
    startHour: "",
    endHour: "",
    minCapacity: "",
    purpose: "",
  });
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [message, setMessage] = useState("");

  const enabled = Boolean(form.startDate && form.startHour && form.endHour);

  const availabilityQuery = useQuery({
    queryKey: [
      "availability",
      form.startDate,
      form.startHour,
      form.endHour,
      form.minCapacity,
    ],
    queryFn: () => {
      const range = buildIsoRangeFromInput(
        form.startDate,
        form.startHour,
        form.endHour,
      );
      if (range.error) {
        return [];
      }

      return getAvailability({
        startUtc: range.startUtc,
        endUtc: range.endUtc,
        minCapacity: form.minCapacity,
      });
    },
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

    const range = buildIsoRangeFromInput(
      form.startDate,
      form.startHour,
      form.endHour,
    );
    if (range.error) {
      setMessage(range.error);
      return;
    }

    availabilityQuery.refetch();
  };

  const onBook = () => {
    if (!selectedRoomId) {
      setMessage("Select a room first.");
      return;
    }

    const range = buildIsoRangeFromInput(
      form.startDate,
      form.startHour,
      form.endHour,
    );
    if (range.error) {
      setMessage(range.error);
      return;
    }

    bookingMutation.mutate({
      roomId: Number(selectedRoomId),
      startUtc: range.startUtc,
      endUtc: range.endUtc,
      purpose: form.purpose || "Meeting",
    });
  };

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <h2>Find available rooms</h2>
          <p className="page-subtitle">
            Select a time window, compare rooms, then book in one click.
          </p>
        </div>
      </div>

      <form className="form-grid" onSubmit={onSearch}>
        <div className="form-row">
          <div className="field-group col-6">
            <label htmlFor="startDate">Date</label>
            <input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              required
            />
          </div>

          <div className="field-group col-3">
            <label htmlFor="startHour">Start time</label>
            <select
              id="startHour"
              value={form.startHour}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startHour: event.target.value }))
              }
              required
            >
              <option value="">Select hour</option>
              {START_HOUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group col-3">
            <label htmlFor="endHour">End time</label>
            <select
              id="endHour"
              value={form.endHour}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endHour: event.target.value }))
              }
              required
            >
              <option value="">Select hour</option>
              {HOUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="hint">
          Format used: dd/MM/yyyy HH:mm | Start:{" "}
          {formatDateTimeDisplay(
            parseDateAndHour(form.startDate, form.startHour),
          )}{" "}
          | End:{" "}
          {formatDateTimeDisplay(
            parseDateAndHour(form.startDate, form.endHour),
          )}
        </p>

        <div className="form-row">
          <div className="field-group">
            <label htmlFor="minCapacity">Minimum capacity</label>
            <input
              id="minCapacity"
              type="number"
              min="1"
              placeholder="e.g. 6"
              value={form.minCapacity}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  minCapacity: event.target.value,
                }))
              }
            />
          </div>

          <div className="field-group">
            <label htmlFor="purpose">Purpose</label>
            <input
              id="purpose"
              type="text"
              placeholder="Sprint planning"
              value={form.purpose}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, purpose: event.target.value }))
              }
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {availabilityQuery.isLoading ? (
        <p className="muted">Loading rooms...</p>
      ) : null}
      {availabilityQuery.data?.length ? (
        <ul className="list room-grid">
          {availabilityQuery.data.map((room) => {
            const roomId = room.id ?? room.Id;
            const isSelected = String(selectedRoomId) === String(roomId);

            return (
              <li
                key={roomId}
                className={`list-item room-box ${isSelected ? "selected" : ""}`}
              >
                <label className="room-box-label">
                  <div>
                    <strong className="room-title">
                      {room.name ?? room.Name}
                    </strong>
                    <div className="muted room-location">
                      {room.location ?? room.Location}
                    </div>
                  </div>

                  <div className="room-meta">
                    <span>Capacity: {room.capacity ?? room.Capacity}</span>
                    <span className="badge badge-active">Available</span>
                  </div>

                  <div className="room-select">
                    <input
                      type="radio"
                      name="room"
                      value={roomId}
                      checked={isSelected}
                      onChange={(event) =>
                        setSelectedRoomId(event.target.value)
                      }
                    />
                    <span>{isSelected ? "Selected" : "Select room"}</span>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      ) : enabled && !availabilityQuery.isLoading ? (
        <p className="muted">No rooms found for the selected criteria.</p>
      ) : null}

      <div className="section-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onBook}
          disabled={bookingMutation.isPending}
        >
          Book selected room
        </button>
      </div>
      {message ? (
        <p
          className={
            message.includes("success") ? "status success" : "status error"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
