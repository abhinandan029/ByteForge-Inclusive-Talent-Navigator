
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeUser, setActiveUser] = useState("employee");

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // LOGIN HANDLER
  // ==================================================

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (activeUser === "hr") {
      setError("HR Partner authentication is not available yet.");
      return;
    }

    if (!employeeId.trim() || !password) {
      setError("Please enter your employee ID and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(
        employeeId.trim(),
        password
      );

      if (result.employee.must_change_password) {
        navigate("/change-password", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      setError(
        err.message || "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-slate-50">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ==================================================
            LEFT BRANDING
        ================================================== */}

        <div className="hidden bg-slate-900 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-900">
                ITN
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Inclusive Talent Navigator
                </p>

                <p className="text-xs text-slate-400">
                </p>
              </div>

            </div>

          </div>


          <div className="max-w-xl">

            <p className="text-sm font-medium text-slate-400">
              Inclusive Workforce
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Make skills visible.
              <br />
              Make opportunities fair.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              An AI-assisted talent platform that helps employees
              surface their skills, explore internal opportunities,
              and keep people involved in important decisions.
            </p>

          </div>


          <div className="text-xs text-slate-500">
            Agents recommend. Humans decide.
          </div>

        </div>


        {/* ==================================================
            LOGIN SECTION
        ================================================== */}

        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}

            <div className="mb-10 lg:hidden">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                  SAP
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-900">
                    Inclusive Talent Navigator
                  </p>

                </div>

              </div>

            </div>


            {/* HEADING */}

            <div className="mb-8">

              <p className="text-sm font-medium text-slate-500">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Sign in to your workspace
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Select your role to continue to your workspace.
              </p>

            </div>


            {/* ==================================================
                ROLE SELECTOR
            ================================================== */}

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">

              <button
                type="button"
                onClick={() => {
                  setActiveUser("employee");
                  setError("");
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  activeUser === "employee"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Employee
              </button>


              <button
                type="button"
                onClick={() => {
                  setActiveUser("hr");
                  setError("");
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  activeUser === "hr"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                HR Partner
              </button>

            </div>


            {/* ==================================================
                EMPLOYEE LOGIN FORM
            ================================================== */}

            {activeUser === "employee" ? (

              <form
                onSubmit={handleSubmit}
                autoComplete="on"
                className="space-y-5"
              >

                {/* EMPLOYEE ID */}

                <div>

                  <label
                    htmlFor="employeeId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Employee ID
                  </label>

                  <input
                    id="employeeId"
                    name="username"
                    type="text"
                    value={employeeId}
                    onChange={(event) =>
                      setEmployeeId(event.target.value)
                    }
                    placeholder="Enter your employee ID"
                    autoComplete="new-username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                  />

                </div>


                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>


                {/* ERROR MESSAGE */}

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </div>
                )}


                {/* SUBMIT BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Continue to workspace"}
                </button>

              </form>

            ) : (

              /* ==================================================
                  HR PARTNER PLACEHOLDER
              ================================================== */

              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">

                <h3 className="text-lg font-semibold text-slate-900">
                  HR Partner Access
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  HR Partner authentication is coming soon.
                  This access will be available in a future update.
                </p>

                <span className="mt-4 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Coming Soon
                </span>

              </div>

            )}


            {/* FOOTER */}

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Secure employee access to Inclusive Talent Navigator.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LoginPage;
