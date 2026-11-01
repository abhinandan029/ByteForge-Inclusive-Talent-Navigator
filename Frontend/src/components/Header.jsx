
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X, AlertTriangle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { employee, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const fullName = employee?.full_name || "Employee";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  async function handleLogout() {
    try {
      setLoggingOut(true);
      setLogoutError("");

      await logout();

      setShowLogoutModal(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a6ed1]">
              <span className="text-sm font-bold text-white">ITN</span>
            </div>

            <div>
              <h1 className="text-sm font-semibold text-slate-900">
                Inclusive Talent Navigator
              </h1>

              <p className="text-[11px] text-slate-500">
                Inclusive Workforce
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">

            {/* Notifications */}
            <button
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              title="Notifications"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 17h5l-1.5-2V10a6.5 6.5 0 10-13 0v5L4 17h5m6 0a3 3 0 01-6 0"
                />
              </svg>

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="h-7 w-px bg-slate-200" />

            {/* Employee Details */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {initials || "E"}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-800">
                  {fullName}
                </p>

                <p className="text-xs text-slate-500">
                  Employee
                </p>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={() => {
                setLogoutError("");
                setShowLogoutModal(true);
              }}
              className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:block"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* LOGOUT CONFIRMATION MODAL */}
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
            aria-labelledby="logout-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={25} />
              </div>

              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-5">
              <h2
                id="logout-title"
                className="text-xl font-bold text-slate-900"
              >
                Sign out?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to sign out of your account?
                You will need to log in again to access your workspace.
              </p>

              {logoutError && (
                <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {logoutError}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
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
