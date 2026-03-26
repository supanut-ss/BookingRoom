import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { me } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bookingroom_token");
    if (!token) {
      setLoading(false);
      return;
    }

    me()
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem("bookingroom_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      logout: () => {
        localStorage.removeItem("bookingroom_token");
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
