import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function AppLayout() {
  const { user, logout } = useAuth();
  const role = user?.role ?? user?.Role;

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Meeting Room Booking</h1>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/my-bookings">My Bookings</Link>
          {role === "Admin" ? <Link to="/admin/rooms">Admin Rooms</Link> : null}
          <button type="button" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
