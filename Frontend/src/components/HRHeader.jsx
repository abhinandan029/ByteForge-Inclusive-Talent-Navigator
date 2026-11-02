
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHRAuth } from "../contexts/HRAuthContext";

function HRHeader() {
  const navigate = useNavigate();
  const { hr, logout } = useHRAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("HR logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
      <div>
        <h1 className="text-sm font-semibold text-slate-900">
          Inclusive Talent Navigator
        </h1>
        <p className="text-xs text-slate-500">
          HR Partner Workspace
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">
            {hr?.full_name || "HR Partner"}
          </p>
          <p className="text-xs text-slate-500">
            {hr?.department || "Human Resources"}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {(hr?.full_name || "HR").charAt(0).toUpperCase()}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
        >
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}

export default HRHeader;
