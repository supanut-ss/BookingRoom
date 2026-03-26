import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/authService";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

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
      if (apiMessage) {
        setError(apiMessage);
        return;
      }

      setError(
        "Cannot reach API. Check backend is running and REACT_APP_API_BASE_URL is correct.",
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2 className="auth-title">
          {isRegister ? "Create account" : "Sign in"}
        </h2>
        <p className="auth-subtitle">
          {isRegister
            ? "Start booking rooms in less than a minute."
            : "Welcome back. Sign in to manage your meetings."}
        </p>

        <form onSubmit={onSubmit} className="form-grid">
          {isRegister ? (
            <div className="field-group">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="e.g. John Appleseed"
                required
              />
            </div>
          ) : null}

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error ? <p className="status error">{error}</p> : null}
          <button type="submit" className="btn btn-primary">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="link-btn"
          onClick={() => setIsRegister((previous) => !previous)}
        >
          {isRegister ? "Have an account? Login" : "Need an account? Register"}
        </button>

        <p className="hint">Seed admin: admin@bookingroom.local / Admin@123</p>
      </div>
    </div>
  );
}
