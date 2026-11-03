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
    const details = typeof log.DETAILS === "string" ? log.DETAILS : JSON.stringify(log.DETAILS || "");

    const matchesSearch =
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HERO BANNER (DASHBOARD STYLE) */}
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-200">
          <div className="relative p-7 sm:p-9">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                  Compliance & Transparency
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Employee Audit Log
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Complete verifiable record of AI actions, document extractions, and employee skill confirmations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-700">
                    <ShieldCheck size={25} />
                  </div>
                  <div>
                    <p className="font-semibold">Immutable Audit Trail</p>
                    <p className="mt-1 text-xs text-slate-300">
                      Algorithmic Accountability · SAP Database
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadLogs}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh Logs
                </button>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-3">
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Recorded Audit Events</p>
              <p className="mt-1 text-sm font-semibold">
                {logs.length} logged event{logs.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Visible Events</p>
              <p className="mt-1 text-sm font-semibold">
                {filteredLogs.length} matching event{filteredLogs.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="px-7 py-4">
              <p className="text-xs text-slate-400">Decision Model</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={15} className="text-emerald-400" />
                Human-in-the-loop enforced
              </p>
            </div>
          </div>
        </section>

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
              placeholder="Search actions or keywords..."
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
                    <th className="px-6 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log, idx) => {
                    const logId = log.LOG_ID || log.log_id || idx;
                    const timestamp = log.LOG_TIMESTAMP || log.log_timestamp || log.created_at;
                    const actor = log.ACTOR || log.actor;
                    const action = log.ACTION || log.action;
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
