
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, LogOut, X } from "lucide-react";
import { useHRAuth } from "../contexts/HRAuthContext";

function HRHeader() {
  const navigate = useNavigate();
  const { hr, logout } = useHRAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      setLogoutError("");

      await logout();
      setShowLogoutModal(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("HR logout failed:", error);
      setLogoutError("Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
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
            onClick={() => {
              setLogoutError("");
              setShowLogoutModal(true);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Logout
          </button>
        </div>
      </header>

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!loggingOut) setShowLogoutModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hr-logout-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={25} />
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <h2
                id="hr-logout-title"
                className="text-xl font-bold text-slate-900"
              >
                Sign out?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to sign out of your HR Partner account?
                You will need to log in again to access your workspace.
              </p>
              {logoutError && (
                <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {logoutError}
                </p>
              )}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={16} />
                {loggingOut ? "Signing out..." : "Yes, Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HRHeader;
