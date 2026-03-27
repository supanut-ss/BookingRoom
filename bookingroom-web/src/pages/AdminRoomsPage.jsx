import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoom, deleteRoom, getRooms } from "../services/roomsService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

export function AdminRoomsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", location: "", capacity: 1 });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

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
      setIsError(false);
    },
    onError: (error) => {
      setMessage(error?.response?.data ?? "Unable to add room.");
      setIsError(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms-admin"] });
      setMessage("Room deleted successfully.");
      setIsError(false);
    },
    onError: (error) => {
      setMessage(error?.response?.data ?? "Unable to delete room.");
      setIsError(true);
    },
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Admin — Rooms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage room inventory for all teams.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 1, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Add new room
          </Typography>
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");
              createMutation.mutate({
                ...form,
                capacity: Number(form.capacity),
              });
            }}
          >
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Name"
                  placeholder="Ocean"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Location"
                  placeholder="Floor 2"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Capacity"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, capacity: e.target.value }))
                  }
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={createMutation.isPending}
                  sx={{ py: 1.1 }}
                >
                  Add Room
                </Button>
              </Grid>
            </Grid>
          </Box>

          {message ? (
            <Alert severity={isError ? "error" : "success"} sx={{ mt: 2 }}>
              {message}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {(roomsQuery.data ?? []).map((room) => {
                  const id = room.id ?? room.Id;
                  return (
                    <TableRow key={id} hover>
                      <TableCell>
                        <strong>{room.name ?? room.Name}</strong>
                      </TableCell>
                      <TableCell>{room.location ?? room.Location}</TableCell>
                      <TableCell>{room.capacity ?? room.Capacity}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            setMessage("");
                            deleteMutation.mutate(id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(roomsQuery.data ?? []).length === 0 &&
                !roomsQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 4, color: "text.secondary" }}
                    >
                      No rooms yet. Add one above.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
