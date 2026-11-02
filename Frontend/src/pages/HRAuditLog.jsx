import { useEffect, useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Clock,
  Briefcase,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";
import { getHRAuditLogs } from "../services/jobsApi";

export default function HRAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  async function loadLogs() {
    try {
      setLoading(true);
      setError("");
      const data = await getHRAuditLogs();
      setLogs(data.audit_logs || []);
    } catch (err) {
      setError(err.message || "Failed to load HR audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function formatDetails(details) {
    if (!details) return "—";
    if (typeof details === "object") {
      return JSON.stringify(details, null, 2);
    }
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  }

  const filteredLogs = logs.filter((log) => {
    const action = log.ACTION || log.action || "";
    const roleId = log.JOB_ROLE_ID || log.job_role_id || "";
    const details = typeof log.DETAILS === "string" ? log.DETAILS : JSON.stringify(log.DETAILS || "");

    return (
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-full bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Compliance & Governance
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <ShieldCheck size={11} /> HR Activity Audit
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              HR Audit Log & Governance
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Complete chronological audit trail of all job role configurations, status modifications, and criteria updates.
            </p>
          </div>

          <button
            type="button"
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh Logs
          </button>
        </div>

        {/* SEARCH */}
        <div className="mt-6 max-w-md">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by action, role ID, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center p-8">
              <RefreshCw size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-6 text-sm text-red-700 bg-red-50">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No audit logs recorded for HR actions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Action</th>
                    <th className="px-6 py-3.5">Job Role ID</th>
                    <th className="px-6 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log, idx) => {
                    const logId = log.LOG_ID || log.log_id || idx;
                    const timestamp = log.LOG_TIMESTAMP || log.log_timestamp || log.created_at;
                    const action = log.ACTION || log.action;
                    const roleId = log.JOB_ROLE_ID || log.job_role_id;
                    const details = log.DETAILS || log.details;

                    return (
                      <tr key={logId} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Clock size={12} className="text-slate-400" />
                            {timestamp ? new Date(timestamp).toLocaleString() : "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">
                            {action || "HR_ACTION"}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono font-medium text-slate-700">
                          {roleId || "—"}
                        </td>

                        <td className="px-6 py-4 max-w-md">
                          <pre className="max-h-24 overflow-y-auto rounded-lg bg-slate-50 p-2 text-[10px] text-slate-700 font-mono border border-slate-100">
                            {formatDetails(details)}
                          </pre>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

