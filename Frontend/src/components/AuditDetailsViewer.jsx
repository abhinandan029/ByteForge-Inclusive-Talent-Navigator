import { useState } from "react";
import { Code, Check } from "lucide-react";

function formatKeyLabel(key) {
  if (!key) return "";
  const customLabels = {
    employee_id: "Employee ID",
    target_role: "Target Role",
    confirmed_count: "Confirmed Skills",
    extracted_count: "Extracted Skills",
    courses_recommended: "Courses Recommended",
    skill_gaps_addressed: "Skill Gaps",
    high_demand_count: "High Demand Skills",
    matched_skills: "Matched Skills",
    total_matches: "Total Matches",
    ready_for_matching: "Ready for Matching",
    role_id: "Role ID",
    job_role_id: "Job Role ID",
    skills: "Skills",
  };

  if (customLabels[key]) {
    return customLabels[key];
  }

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AuditDetailsViewer({ details }) {
  const [showRaw, setShowRaw] = useState(false);
  const [expandedArrays, setExpandedArrays] = useState({});

  if (!details) {
    return <span className="text-slate-400 italic">No details provided</span>;
  }

  // Parse details
  let parsed = null;
  let isJson = false;

  if (typeof details === "object" && details !== null) {
    parsed = details;
    isJson = true;
  } else if (typeof details === "string") {
    const trimmed = details.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        parsed = JSON.parse(trimmed);
        isJson = true;
      } catch {
        parsed = details;
        isJson = false;
      }
    } else {
      parsed = details;
      isJson = false;
    }
  }

  // If plain text (not JSON)
  if (!isJson) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-700 leading-relaxed">
          {String(parsed)}
        </span>
      </div>
    );
  }

  function toggleExpandArray(key) {
    setExpandedArrays((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  // Render raw JSON when toggled
  if (showRaw) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase text-slate-400">
            Raw JSON Payload
          </span>
          <button
            type="button"
            onClick={() => setShowRaw(false)}
            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
          >
            Formatted view
          </button>
        </div>
        <pre className="max-h-36 overflow-y-auto rounded-lg bg-slate-900 p-2.5 text-[10px] font-mono text-emerald-400">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </div>
    );
  }

  // If it's an array
  if (Array.isArray(parsed)) {
    return (
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-1">
          {parsed.map((item, idx) => (
            <span
              key={idx}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {typeof item === "object" ? JSON.stringify(item) : String(item)}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowRaw(true)}
          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600"
        >
          <Code size={11} /> View raw
        </button>
      </div>
    );
  }

  // If it's an object
  const entries = Object.entries(parsed);
  if (entries.length === 0) {
    return <span className="text-slate-400 italic">Empty payload</span>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {entries.map(([key, val]) => {
          const label = formatKeyLabel(key);

          // Boolean values
          if (typeof val === "boolean") {
            return (
              <div
                key={key}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px]"
              >
                <span className="font-semibold text-slate-500">{label}:</span>
                {val ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <Check size={12} className="stroke-[3]" /> Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-slate-400">
                    ✕ No
                  </span>
                )}
              </div>
            );
          }

          // Number values
          if (typeof val === "number") {
            return (
              <div
                key={key}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px]"
              >
                <span className="font-medium text-slate-500">{label}:</span>
                <span className="font-bold text-indigo-700 font-mono">
                  {val}
                </span>
              </div>
            );
          }

          // Array of strings (e.g. skills or skill gaps)
          if (Array.isArray(val)) {
            const isExpanded = expandedArrays[key];
            const maxPreview = 4;
            const displayItems = isExpanded ? val : val.slice(0, maxPreview);
            const remaining = val.length - maxPreview;

            return (
              <div
                key={key}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">
                    {label} ({val.length}):
                  </span>
                  {val.length > maxPreview && (
                    <button
                      type="button"
                      onClick={() => toggleExpandArray(key)}
                      className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {isExpanded ? "Show less" : `+${remaining} more`}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {displayItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-800"
                    >
                      {typeof item === "object" ? JSON.stringify(item) : String(item)}
                    </span>
                  ))}
                </div>
              </div>
            );
          }

          // Nested object
          if (typeof val === "object" && val !== null) {
            return (
              <div
                key={key}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-[11px]"
              >
                <span className="font-bold text-slate-700">{label}:</span>
                <div className="mt-1 pl-2 border-l-2 border-slate-200 space-y-0.5">
                  {Object.entries(val).map(([subK, subV]) => (
                    <div key={subK} className="flex items-center gap-1 text-[10px]">
                      <span className="text-slate-500">{formatKeyLabel(subK)}:</span>
                      <span className="font-semibold text-slate-800">
                        {typeof subV === "object" ? JSON.stringify(subV) : String(subV)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // String values
          return (
            <div
              key={key}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px]"
            >
              <span className="font-medium text-slate-500">{label}:</span>
              <span className="font-semibold text-slate-900">{String(val)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowRaw(true)}
          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 transition"
          title="Inspect raw JSON"
        >
          <Code size={11} />
          <span>JSON</span>
        </button>
      </div>
    </div>
  );
}
