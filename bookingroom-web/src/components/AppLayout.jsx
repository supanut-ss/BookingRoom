import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function AppLayout() {
  const { user, logout } = useAuth();
  const role = user?.role ?? user?.Role;
  const fullName = user?.fullName ?? user?.FullName;

  const navClassName = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <div className="app-bg">
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-block">
            <h1>Meeting Room Booking</h1>
            <p>Smart scheduling for modern teams</p>
          </div>

          <div className="topbar-right">
            <nav className="main-nav">
              <NavLink to="/" end className={navClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/rooms" className={navClassName}>
                Rooms
              </NavLink>
              <NavLink to="/my-bookings" className={navClassName}>
                My Bookings
              </NavLink>
              {role === "Admin" ? (
                <NavLink to="/admin/rooms" className={navClassName}>
                  Admin Rooms
                </NavLink>
              ) : null}
            </nav>

            <div className="user-actions">
              <div className="user-chip">
                <span className="user-name">{fullName}</span>
                <span className="user-role">{role}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
