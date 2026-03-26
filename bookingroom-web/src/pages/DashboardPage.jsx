import { useAuth } from "../state/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="card">
      <h2>Welcome, {user?.fullName ?? user?.FullName}</h2>
      <p>
        Use the navigation to browse rooms, check availability, and manage
        bookings.
      </p>
    </div>
  );
}
