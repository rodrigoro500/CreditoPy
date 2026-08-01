import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function LenderRoute() {
  const { profile } = useAuth();

  if (profile?.role === "admin") {
    return <Navigate to="/admin/usuarios" replace />;
  }

  return <Outlet />;
}
