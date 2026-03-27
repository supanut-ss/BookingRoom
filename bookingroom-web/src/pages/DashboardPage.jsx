import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import SearchIcon from "@mui/icons-material/Search";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? user?.Role;
  const fullName = user?.fullName ?? user?.FullName;

  const quickLinks = [
    {
      label: "Find Available Rooms",
      to: "/rooms",
      icon: <SearchIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      desc: "Search and book meeting rooms instantly",
    },
    {
      label: "View My Bookings",
      to: "/my-bookings",
      icon: <EventNoteIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      desc: "Track and manage your upcoming meetings",
    },
    ...(role === "Admin"
      ? [
          {
            label: "Manage Rooms",
            to: "/admin/rooms",
            icon: (
              <AdminPanelSettingsIcon
                sx={{ fontSize: 40, color: "warning.main" }}
              />
            ),
            desc: "Create and delete room inventory",
          },
        ]
      : []),
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome, {fullName} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plan meetings faster with an elegant and reliable booking workflow.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: "Account Type", value: role },
          { label: "Primary Action", value: "Book a Room" },
          { label: "Workspace", value: "Meeting Hub" },
        ].map((stat) => (
          <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  letterSpacing={1}
                >
                  {stat.label}
                </Typography>
                <Typography variant="h6" fontWeight={700} mt={0.5}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Quick actions
      </Typography>
      <Grid container spacing={2}>
        {quickLinks.map((link) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={link.to}>
            <Card sx={{ borderRadius: 3, boxShadow: 1, height: "100%" }}>
              <CardActionArea
                component={Link}
                to={link.to}
                sx={{ p: 1, height: "100%" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  {link.icon}
                  <Typography variant="subtitle1" fontWeight={700}>
                    {link.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {link.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
