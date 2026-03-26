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
    <div className="card">
      <h2>{isRegister ? "Create account" : "Sign in"}</h2>
      <form onSubmit={onSubmit} className="form-grid">
        {isRegister ? (
          <input
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            placeholder="Full name"
            required
          />
        ) : null}
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          required
        />
        {error ? <p className="error">{error}</p> : null}
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      <button
        type="button"
        className="link-btn"
        onClick={() => setIsRegister((previous) => !previous)}
      >
        {isRegister ? "Have an account? Login" : "Need an account? Register"}
      </button>
      <p className="hint">
        Seed admin: `admin@bookingroom.local` / `Admin@123`
      </p>
    </div>
  );
}
