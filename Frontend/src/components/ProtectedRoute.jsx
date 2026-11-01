
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute() {
  const { employee, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Checking your session...
        </p>
      </div>
    );
  }

  if (!employee) {
    return <Navigate to="/" replace />;
  }

  // Employees must change their temporary password first.
  if (employee.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
