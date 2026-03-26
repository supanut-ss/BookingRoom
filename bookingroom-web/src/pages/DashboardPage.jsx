import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? user?.Role;

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <h2>Welcome, {user?.fullName ?? user?.FullName}</h2>
          <p className="page-subtitle">
            Plan meetings faster with an elegant and reliable booking workflow.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Account Type</div>
          <div className="stat-value">{role}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Primary Action</div>
          <div className="stat-value">Book a Room</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Workspace</div>
          <div className="stat-value">Meeting Hub</div>
        </div>
      </div>

      <div className="quick-links">
        <Link to="/rooms" className="nav-link active">
          Find Available Rooms
        </Link>
        <Link to="/my-bookings" className="nav-link">
          View My Bookings
        </Link>
        {role === "Admin" ? (
          <Link to="/admin/rooms" className="nav-link">
            Manage Rooms
          </Link>
        ) : null}
      </div>
    </div>
  );
}
