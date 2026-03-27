import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/authService";
import { useAuth } from "../state/AuthContext";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = isRegister
        ? { ...form, role: "Employee" }
        : { email: form.email, password: form.password };
      const response = isRegister
        ? await register(payload)
        : await login(payload);
      localStorage.setItem("bookingroom_token", response.token);
      setUser({
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      });
      navigate("/");
    } catch (requestError) {
      const apiMessage = requestError?.response?.data;
      setError(
        apiMessage ||
          "Cannot reach API. Check backend is running and REACT_APP_API_BASE_URL is correct.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card
        sx={{ width: "100%", maxWidth: 420, borderRadius: 3, boxShadow: 4 }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <MeetingRoomIcon sx={{ color: "white", fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {isRegister ? "Create account" : "Sign in"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              {isRegister
                ? "Start booking rooms in less than a minute."
                : "Welcome back. Sign in to manage your meetings."}
            </Typography>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {isRegister ? (
              <TextField
                label="Full name"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="e.g. John Appleseed"
                required
                fullWidth
                size="small"
              />
            ) : null}
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="name@company.com"
              required
              fullWidth
              size="small"
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              fullWidth
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.4, fontWeight: 700 }}
            >
              {loading
                ? "Please wait…"
                : isRegister
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setIsRegister((v) => !v);
                  setError("");
                }}
                sx={{ p: 0, minWidth: "auto", fontWeight: 600 }}
              >
                {isRegister ? "Sign in" : "Register"}
              </Button>
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              display="block"
              mt={2}
            >
              Seed admin: admin@bookingroom.local / Admin@123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
