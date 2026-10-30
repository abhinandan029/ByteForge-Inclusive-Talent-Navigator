
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function ChangePasswordPage() {
  const { employee, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordBytes = new TextEncoder().encode(newPassword).length;

  const requirements = [
    { label: "At least 8 characters", valid: newPassword.length >= 8 },
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(newPassword) },
    { label: "One number (0-9)", valid: /[0-9]/.test(newPassword) },
    {
      label: "One special character (@, #, $, etc.)",
      valid: /[^A-Za-z0-9\s]/.test(newPassword),
    },
    {
      label: "No spaces",
      valid: newPassword.length > 0 && !/\s/.test(newPassword),
    },
    {
      label: "Maximum 72 UTF-8 bytes",
      valid: passwordBytes <= 72,
    },
  ];

  const passedRequirements = requirements.filter((item) => item.valid).length;
  const passwordIsValid =
    newPassword.length > 0 &&
    passedRequirements === requirements.length;

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const strength =
    newPassword.length === 0
      ? { label: "Not entered", color: "bg-slate-200", text: "text-slate-500", bars: 0 }
      : passedRequirements <= 2
      ? { label: "Weak", color: "bg-red-500", text: "text-red-600", bars: 1 }
      : passedRequirements <= 4
      ? { label: "Fair", color: "bg-orange-500", text: "text-orange-600", bars: 2 }
      : passedRequirements <= 6
      ? { label: "Good", color: "bg-yellow-500", text: "text-yellow-700", bars: 3 }
      : { label: "Strong", color: "bg-green-500", text: "text-green-600", bars: 4 };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!passwordIsValid) {
      setError("Please satisfy all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await changePassword(newPassword);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to change password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">

        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Inclusive Talent Navigator
          </p>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Change your password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome, {employee?.full_name}. Please set a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                required
                autoComplete="new-password"
                placeholder="Enter your new password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <div className="mb-2 flex justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    Password strength
                  </span>
                  <span className={`text-xs font-semibold ${strength.text}`}>
                    {strength.label}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1.5 flex-1 rounded-full ${
                        bar <= strength.bars
                          ? strength.color
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                <div className="mb-3 mt-4 flex justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Password requirements
                  </span>
                  <span className="text-xs text-slate-500">
                    {passedRequirements}/{requirements.length} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {requirements.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.valid ? (
                        <Check size={15} className="shrink-0 text-green-600" />
                      ) : (
                        <X size={15} className="shrink-0 text-slate-400" />
                      )}

                      <span className={`text-xs ${
                        item.valid ? "text-green-700" : "text-slate-500"
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {passwordBytes} / 72 UTF-8 bytes
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm new password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                required
                autoComplete="new-password"
                placeholder="Confirm your new password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirmPassword
                  ? <EyeOff size={19} />
                  : <Eye size={19} />}
              </button>
            </div>

            {confirmPassword.length > 0 && (
              <p className={`mt-2 flex items-center gap-1.5 text-xs ${
                passwordsMatch ? "text-green-600" : "text-red-500"
              }`}>
                {passwordsMatch ? <Check size={14} /> : <X size={14} />}
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passwordIsValid || !passwordsMatch}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating password..." : "Update password"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 w-full text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
