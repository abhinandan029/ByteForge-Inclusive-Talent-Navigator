import { useEffect, useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Clock,
  User,
  Bot,
  AlertCircle,
} from "lucide-react";
import { getSkillsAuditLogs } from "../services/skillsApi";
import AuditDetailsViewer from "../components/AuditDetailsViewer";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActor, setSelectedActor] = useState("ALL");

  async function loadLogs() {
    try {
      setLoading(true);
      setError("");
      const data = await getSkillsAuditLogs();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const actors = ["ALL", ...new Set(logs.map((l) => l.ACTOR || l.actor).filter(Boolean))];

  const filteredLogs = logs.filter((log) => {
    const actor = log.ACTOR || log.actor || "";
    const action = log.ACTION || log.action || "";
    const tool = log.TOOL || log.tool || "";
    const details = typeof log.DETAILS === "string" ? log.DETAILS : JSON.stringify(log.DETAILS || "");

    const matchesSearch =
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActor = selectedActor === "ALL" || actor === selectedActor;

    return matchesSearch && matchesActor;
  });

  function getActorBadge(actor) {
    const isAgent = actor?.toLowerCase().includes("agent");
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
          isAgent
            ? "bg-purple-50 text-purple-700 border border-purple-200"
            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
        }`}
      >
        {isAgent ? <Bot size={12} /> : <User size={12} />}
        {actor || "System"}
      </span>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Compliance & Transparency
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <ShieldCheck size={11} /> Immutable Audit Trail
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Employee Audit Log
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Complete verifiable record of all AI actions, tool invocations, and employee skill confirmations.
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

        {/* RESPONSIBLE AI CALLOUT */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Responsible AI & Algorithmic Accountability
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                In compliance with ethical AI principles, every extraction by the Skills Discovery Agent, market match, and employee confirmation is permanently recorded in the central database. You retain full visibility into all automated data processing.
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search actions, tools, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              {actors.map((actor) => (
                <option key={actor} value={actor}>
                  Actor: {actor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center p-8">
              <div className="text-center">
                <RefreshCw
                  size={24}
                  className="mx-auto animate-spin text-indigo-600"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Retrieving central audit trail...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-6 text-sm text-red-700 bg-red-50">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No audit logs match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Actor</th>
                    <th className="px-6 py-3.5">Action</th>
                    <th className="px-6 py-3.5">Tool / System</th>
                    <th className="px-6 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log, idx) => {
                    const logId = log.LOG_ID || log.log_id || idx;
                    const timestamp = log.LOG_TIMESTAMP || log.log_timestamp || log.created_at;
                    const actor = log.ACTOR || log.actor;
                    const action = log.ACTION || log.action;
                    const tool = log.TOOL || log.tool;
                    const details = log.DETAILS || log.details;

                    return (
                      <tr key={logId} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Clock size={12} className="text-slate-400" />
                            {timestamp ? new Date(timestamp).toLocaleString() : "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {getActorBadge(actor)}
                        </td>

                        <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                          {action || "—"}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px]">
                            {tool || "Direct Action"}
                          </span>
                        </td>

                        <td className="px-6 py-4 min-w-[320px] max-w-lg">
                          <AuditDetailsViewer details={details} />
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
