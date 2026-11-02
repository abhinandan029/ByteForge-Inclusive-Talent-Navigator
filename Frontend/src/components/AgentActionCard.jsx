import { LoaderCircle, Sparkles } from "lucide-react";

export default function AgentActionCard({
  eyebrow,
  agentName,
  description,
  badges,
  buttonLabel,
  runningLabel,
  running,
  onRun,
  disabled,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-px shadow-sm shadow-indigo-200/50">
      <div className="flex flex-col justify-between gap-5 rounded-[0.95rem] bg-gradient-to-br from-indigo-50/95 via-white/95 to-purple-50/95 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {agentName}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              {description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-indigo-700">
              {badges.map((badge) => (
                <span key={badge} className="rounded-full bg-white px-3 py-1.5 shadow-sm">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onRun}
          disabled={disabled || running}
          className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-2xl bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running && <LoaderCircle size={18} className="animate-spin" />}
          {running ? runningLabel : buttonLabel}
        </button>
      </div>
    </section>
  );
}
