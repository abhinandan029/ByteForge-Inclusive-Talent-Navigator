
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const statCards = [
  {
    key: "total_employees",
    label: "Total Employees",
    description: "Employees registered on the platform",
    icon: "users",
  },
  {
    key: "employees_ready_for_matching",
    label: "Ready for Matching",
    description: "Employees ready to explore opportunities",
    icon: "user-check",
  },
  {
    key: "active_job_roles",
    label: "Active Job Roles",
    description: "Currently available internal roles",
    icon: "briefcase-business",
  },
  {
    key: "total_matches",
    label: "Total Matches",
    description: "Generated employee-role matches",
    icon: "git-compare-arrows",
  },
  {
    key: "pending_bias_reviews",
    label: "Pending Bias Reviews",
    description: "Fairness flags awaiting HR review",
    icon: "shield-alert",
  },
];

function HRDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hr/dashboard`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your HR session has expired. Please sign in again.");
      }

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Unable to load dashboard."
        );
      }

      setStats(data.stats);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  function renderStatValue(key) {
    if (loading && !stats) return "—";
    if (!stats) return "—";

    return Number(stats[key] ?? 0).toLocaleString();
  }

  return (
    <div className="min-h-full bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADING */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              HR Partner Workspace
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Overview of workforce readiness, role matching, and fairness reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchDashboard}
              className="text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>

                  <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                    {renderStatValue(card.key)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-700">
                  {card.icon === "users" && "♙"}
                  {card.icon === "user-check" && "✓"}
                  {card.icon === "briefcase-business" && "▣"}
                  {card.icon === "git-compare-arrows" && "⇄"}
                  {card.icon === "shield-alert" && "⚑"}
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              HR Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review fairness signals and make informed decisions.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/hr/bias-audit")}
              className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-400 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-lg text-amber-700">
                  ⚑
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Review Bias Flags
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Inspect and review AI-generated fairness flags.
                  </p>
                </div>
              </div>
            </button>

            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-700">
                  ✓
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Human-in-the-loop decisions
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    HR retains final authority over candidate decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTNOTE */}
        <p className="mt-6 text-xs text-slate-400">
          Dashboard statistics are retrieved directly from the HR backend.
        </p>

      </div>
    </div>
  );
}

export default HRDashboard;
