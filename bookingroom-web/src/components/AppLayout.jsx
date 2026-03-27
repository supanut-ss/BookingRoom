import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/", end: true },
  { label: "Rooms", to: "/rooms" },
  { label: "My Bookings", to: "/my-bookings" },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role ?? user?.Role;
  const fullName = user?.fullName ?? user?.FullName;

  const navItems =
    role === "Admin"
      ? [...NAV_ITEMS, { label: "Admin Rooms", to: "/admin/rooms" }]
      : NAV_ITEMS;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "primary.main" }}>
        <Toolbar sx={{ gap: 1 }}>
          <MeetingRoomIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 0, mr: 3, whiteSpace: "nowrap" }}
          >
            Meeting Room Booking
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1 }}>
            {navItems.map((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  end={item.end}
                  sx={{
                    color: "white",
                    fontWeight: isActive ? 700 : 400,
                    borderBottom: isActive
                      ? "3px solid white"
                      : "3px solid transparent",
                    borderRadius: 0,
                    px: 2,
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              icon={<AccountCircleIcon />}
              label={`${fullName} (${role})`}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "& .MuiChip-icon": { color: "white" },
              }}
              variant="outlined"
              size="small"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={logout}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.6)",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
