import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { cancelBooking, getMyBookings } from "../services/bookingsService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

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
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          My Bookings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track upcoming meetings and cancel when plans change.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: 0 }}>
          {bookingsQuery.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(bookingsQuery.data ?? []).map((booking) => {
                    const id = booking.id ?? booking.Id;
                    const roomName = booking.roomName ?? booking.RoomName;
                    const start = booking.startUtc ?? booking.StartUtc;
                    const end = booking.endUtc ?? booking.EndUtc;
                    const purpose = booking.purpose ?? booking.Purpose;
                    const isCancelled =
                      booking.isCancelled ?? booking.IsCancelled;

                    return (
                      <TableRow key={id} hover>
                        <TableCell>
                          <strong>{roomName}</strong>
                        </TableCell>
                        <TableCell>
                          {dayjs(start).format("DD/MM/YYYY HH:mm")}
                        </TableCell>
                        <TableCell>
                          {dayjs(end).format("DD/MM/YYYY HH:mm")}
                        </TableCell>
                        <TableCell>{purpose}</TableCell>
                        <TableCell>
                          <Chip
                            label={isCancelled ? "Cancelled" : "Active"}
                            color={isCancelled ? "default" : "success"}
                            size="small"
                            variant={isCancelled ? "outlined" : "filled"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {!isCancelled ? (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => cancelMutation.mutate(id)}
                              disabled={cancelMutation.isPending}
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(bookingsQuery.data ?? []).length === 0 &&
                  !bookingsQuery.isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 4, color: "text.secondary" }}
                      >
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
