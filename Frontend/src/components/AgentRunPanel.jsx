import { CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";

export default function AgentRunPanel({
  agentName,
  task,
  steps,
  activeStep,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-sm"
    >
      <div className="flex items-start gap-3 border-b border-indigo-100 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <Sparkles size={19} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            Agent running
          </p>
          <h2 className="mt-0.5 text-sm font-bold text-slate-900">
            {agentName}
          </h2>
          <p className="mt-1 text-xs text-slate-600">{task}</p>
        </div>
        <LoaderCircle
          size={18}
          className="ml-auto shrink-0 animate-spin text-indigo-600"
          aria-label="In progress"
        />
      </div>

      <div className="grid gap-2 px-5 py-4 sm:grid-cols-4">
        {steps.map((step, index) => {
          const completed = index < activeStep;
          const current = index === activeStep;

          return (
            <div
              key={step}
              className={`rounded-xl border px-3 py-2.5 text-xs ${
                current
                  ? "border-indigo-300 bg-white text-indigo-800 shadow-sm"
                  : completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white/60 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {completed ? (
                  <CheckCircle2 size={14} className="shrink-0" />
                ) : current ? (
                  <LoaderCircle size={14} className="shrink-0 animate-spin" />
                ) : (
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-current text-[9px]">
                    {index + 1}
                  </span>
                )}
                <span className="font-semibold">{step}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
