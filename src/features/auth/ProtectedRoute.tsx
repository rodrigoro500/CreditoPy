import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute() {
  const { loading, user, profile } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-semibold text-slate-600">Cargando CreditoPy...</p>
      </main>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!profile || profile.approval_status === "pending") {
    return <Navigate to="/pendiente-aprobacion" replace />;
  }

  if (profile.approval_status === "rejected") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
