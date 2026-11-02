
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  BriefcaseBusiness,
  GitCompareArrows,
  ShieldAlert,
} from "lucide-react";

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
          cache: "no-store",
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

  const totalEmployees = Number(stats?.total_employees || 0);
  const readyEmployees = Number(stats?.employees_ready_for_matching || 0);
  const readinessRate = totalEmployees
    ? Math.round((readyEmployees / totalEmployees) * 100)
    : 0;
  const pendingReviews = Number(stats?.pending_bias_reviews || 0);
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

        {/* KEY METRICS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <div
              key={card.key}
              className={`rounded-xl border p-5 shadow-sm ${
                card.key === "pending_bias_reviews" && pendingReviews > 0
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                {card.icon === "users" && <Users size={18} className="text-slate-500" />}
                {card.icon === "user-check" && <UserCheck size={18} className="text-emerald-600" />}
                {card.icon === "briefcase-business" && <BriefcaseBusiness size={18} className="text-indigo-600" />}
                {card.icon === "git-compare-arrows" && <GitCompareArrows size={18} className="text-violet-600" />}
                {card.icon === "shield-alert" && <ShieldAlert size={18} className="text-amber-600" />}
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                {renderStatValue(card.key)}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Workforce readiness
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">{readinessRate}%</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {readyEmployees.toLocaleString()} of {totalEmployees.toLocaleString()} employees ready for matching
                </p>
              </div>
              <UserCheck className="text-emerald-600" size={24} />
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${readinessRate}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Use matching to connect ready employees with active internal roles.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Operational snapshot</h2>
              <p className="mt-1 text-sm text-slate-500">
                Current signals from the talent operations workspace.
              </p>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <div className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                pendingReviews ? "border-amber-200 bg-amber-50/60" : "border-emerald-200 bg-emerald-50/50"
              }`}>
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${pendingReviews ? "bg-amber-500" : "bg-emerald-500"}`} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Fairness queue</p>
                  <p className="truncate text-sm font-medium text-slate-800">
                    {pendingReviews ? `${pendingReviews} pending review${pendingReviews === 1 ? "" : "s"}` : "Queue clear"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Matching coverage</p>
                  <p className="truncate text-sm font-medium text-slate-800">{readinessRate}% workforce ready</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* FOOTNOTE */}
        <p className="mt-6 text-xs text-slate-400">
          Dashboard statistics are retrieved directly from the HR backend.
        </p>

      </div>
    </div>
  );
}

export default HRDashboard;
