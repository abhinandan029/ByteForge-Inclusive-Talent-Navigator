
import { Navigate, Outlet } from "react-router-dom";
import { useHRAuth } from "../contexts/HRAuthContext";

function HRProtectedRoute() {
  const { hr, loading } = useHRAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking HR session...</p>
      </div>
    );
  }

  if (!hr) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default HRProtectedRoute;
