import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBooking, getAvailability } from "../services/bookingsService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Radio from "@mui/material/Radio";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Find available rooms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a time window, compare rooms, then book in one click.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 1, mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={onSearch}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Start time"
                  select
                  value={form.startHour}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startHour: e.target.value }))
                  }
                  required
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">Select hour</MenuItem>
                  {START_HOUR_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="End time"
                  select
                  value={form.endHour}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endHour: e.target.value }))
                  }
                  required
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">Select hour</MenuItem>
                  {HOUR_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Minimum capacity"
                  type="number"
                  inputProps={{ min: 1 }}
                  placeholder="e.g. 6"
                  value={form.minCapacity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, minCapacity: e.target.value }))
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  label="Purpose"
                  placeholder="Sprint planning"
                  value={form.purpose}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, purpose: e.target.value }))
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ py: 1.1 }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>

            {form.startDate && form.startHour && form.endHour ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {formatDateTimeDisplay(
                  parseDateAndHour(form.startDate, form.startHour),
                )}
                {" → "}
                {formatDateTimeDisplay(
                  parseDateAndHour(form.startDate, form.endHour),
                )}
              </Typography>
            ) : null}
          </Box>
        </CardContent>
      </Card>

      {availabilityQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {availabilityQuery.data?.length ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {availabilityQuery.data.map((room) => {
            const roomId = room.id ?? room.Id;
            const isSelected = String(selectedRoomId) === String(roomId);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={roomId}>
                <Card
                  onClick={() => setSelectedRoomId(String(roomId))}
                  sx={{
                    borderRadius: 3,
                    boxShadow: isSelected ? 4 : 1,
                    border: isSelected ? "2px solid" : "2px solid transparent",
                    borderColor: isSelected ? "primary.main" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": { boxShadow: 3 },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={700}>
                        {room.name ?? room.Name}
                      </Typography>
                      <Radio
                        checked={isSelected}
                        size="small"
                        sx={{ p: 0 }}
                        onChange={() => setSelectedRoomId(String(roomId))}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "text.secondary",
                        mb: 1,
                      }}
                    >
                      <LocationOnIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {room.location ?? room.Location}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "text.secondary",
                        mb: 1.5,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        Capacity: {room.capacity ?? room.Capacity}
                      </Typography>
                    </Box>
                    <Chip label="Available" color="success" size="small" />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : enabled && !availabilityQuery.isLoading ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          No rooms found for the selected criteria.
        </Typography>
      ) : null}

      {message ? (
        <Alert
          severity={message.includes("success") ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      ) : null}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          onClick={onBook}
          disabled={bookingMutation.isPending || !selectedRoomId}
          sx={{ px: 4 }}
        >
          Book selected room
        </Button>
      </Box>
    </Box>
  );
}
