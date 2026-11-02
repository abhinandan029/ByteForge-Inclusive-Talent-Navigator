
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  getBiasFlags,
  getBiasFlagDetails,
  getMatchDecision,
  reviewBiasFlag,
  submitMatchDecision,
  runBiasAudit,
} from "../services/hrApi";
import AgentActionCard from "../components/AgentActionCard";
import AgentRunPanel from "../components/AgentRunPanel";

const initialFilters = {
  review_status: "",
  flag_type: "",
};

const decisionOptions = [
  { value: "shortlist", label: "Shortlist" },
  { value: "hold", label: "Hold" },
  { value: "needs_further_review", label: "Needs Further Review" },
  { value: "reject", label: "Reject" },
];

function formatLabel(value) {
  if (!value) return "N/A";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "N/A";

  return new Date(value).toLocaleString();
}

function getSeverityStyle(severity) {
  switch (severity?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getReviewStyle(status) {
  switch (status?.toLowerCase()) {
    case "concerning":
      return "bg-red-100 text-red-700";
    case "not_concerning":
      return "bg-green-100 text-green-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function HRBiasAudit() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState(initialFilters);

  const [selectedFlag, setSelectedFlag] = useState(null);
  const [existingDecision, setExistingDecision] = useState(null);

  const [currentStage, setCurrentStage] = useState(1);

  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewComments, setReviewComments] = useState("");

  const [decision, setDecision] = useState("");
  const [decisionComments, setDecisionComments] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const [savingReview, setSavingReview] = useState(false);
  const [savingDecision, setSavingDecision] = useState(false);

  const [runningAudit, setRunningAudit] = useState(false);
  const [auditRunResult, setAuditRunResult] = useState(null);

  const [error, setError] = useState("");

  async function handleRunAudit() {
    if (
      !confirm(
        "Run the Bias Review Agent across all active job roles and matching results?"
      )
    ) {
      return;
    }

    try {
      setRunningAudit(true);
      setError("");
      setAuditRunResult(null);

      const result = await runBiasAudit();
      setAuditRunResult(result);
      await loadFlags();
    } catch (err) {
      setError(err.message || "Failed to execute Bias Review Agent.");
    } finally {
      setRunningAudit(false);
    }
  }

  useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    try {
      setLoading(true);
      setError("");

      const data = await getBiasFlags(filters);

      setFlags(Array.isArray(data) ? data : data.flags || []);
    } catch (err) {
      setError(err.message || "Failed to load bias flags.");
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters(event) {
    event.preventDefault();
    await loadFlags();
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function closeModal(force = false) {
    if (!force && (savingReview || savingDecision)) return;

    setSelectedFlag(null);
    setExistingDecision(null);
    setCurrentStage(1);

    setReviewStatus("");
    setReviewComments("");

    setDecision("");
    setDecisionComments("");
    setOverrideReason("");

    setError("");
  }

  async function openModal(flag) {
    try {
      setError("");
      setCurrentStage(1);
      setSelectedFlag(flag);
      setExistingDecision(null);

      setReviewStatus(flag.review_status || "");
      setReviewComments(flag.review_comments || "");

      setDecision("");
      setDecisionComments("");
      setOverrideReason("");

      const details = await getBiasFlagDetails(flag.flag_id);

      setSelectedFlag((previous) => ({
        ...previous,
        ...details,
      }));

      if (flag.match_id) {
        try {
          const result = await getMatchDecision(flag.match_id);

          setExistingDecision(result);

          if (result?.decision) {
            setDecision(result.decision);
          }

          if (result?.comments) {
            setDecisionComments(result.comments);
          }

          if (result?.override_reason) {
            setOverrideReason(result.override_reason);
          }
        } catch {
          // No existing decision may be available.
          setExistingDecision(null);
        }
      }
    } catch (err) {
      setError(err.message || "Unable to load flag details.");
    }
  }

  async function handleReviewSubmit() {
    if (!reviewStatus) {
      setError("Please select an HR review status.");
      return;
    }

    try {
      setSavingReview(true);
      setError("");

      await reviewBiasFlag(selectedFlag.flag_id, {
        review_status: reviewStatus,
        review_comments: reviewComments.trim() || undefined,
      });

      setSelectedFlag((previous) => ({
        ...previous,
        review_status: reviewStatus,
        review_comments: reviewComments,
      }));

      await loadFlags();

      setCurrentStage(3);
    } catch (err) {
      setError(err.message || "Failed to submit HR review.");
    } finally {
      setSavingReview(false);
    }
  }

  async function handleDecisionSubmit(event) {
    event.preventDefault();

    if (!selectedFlag?.match_id) {
      setError("A match ID is not available for this flag.");
      return;
    }

    if (!decision) {
      setError("Please select a final decision.");
      return;
    }

    if (decision === "reject" && !overrideReason.trim()) {
      setError("Please provide an override reason before rejecting.");
      return;
    }

    try {
      setSavingDecision(true);
      setError("");

      const payload = {
        decision,
        comments: decisionComments.trim() || undefined,
        override_reason:
          decision === "reject"
            ? overrideReason.trim()
            : undefined,
      };

      await submitMatchDecision(selectedFlag.match_id, payload);

      await loadFlags();

      // Close the wizard after successful final submission.
      // Force is required because savingDecision is still true here.
      closeModal(true);
    } catch (err) {
      setError(err.message || "Failed to submit final decision.");
    } finally {
      setSavingDecision(false);
    }
  }

  function goToNextStage() {
    setError("");

    if (currentStage === 1) {
      setCurrentStage(2);
    }
  }

  function goToPreviousStage() {
    setError("");

    if (currentStage === 3) {
      setCurrentStage(2);
    } else if (currentStage === 2) {
      setCurrentStage(1);
    }
  }

  const stages = [
    { number: 1, label: "Details" },
    { number: 2, label: "HR Review" },
    { number: 3, label: "Final Decision" },
  ];

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Bias Audit
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Review AI-generated bias flags and make final candidate decisions.
            </p>
          </div>

        </div>

        <div className="mb-6">
          <AgentActionCard
            eyebrow="Responsible AI governance"
            agentName="Bias Review Agent"
            description="Audit matches and roles for explainable fairness risks before HR decisions are made."
            badges={["Fairness signals", "Human review", "Decision safeguards"]}
            buttonLabel="Run Bias Review"
            runningLabel="Auditing..."
            running={runningAudit}
            disabled={loading}
            onRun={handleRunAudit}
          />
        </div>

        {runningAudit && (
          <AgentRunPanel
            agentName="Bias Review Agent"
            task="Reviewing matching outcomes, role requirements, and fairness indicators for HR review."
            steps={["Load matches", "Check fairness", "Classify flags", "Prepare report"]}
            activeStep={1}
          />
        )}

        {/* AUDIT EXECUTION SUMMARY */}
        {auditRunResult && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Agent Execution Results ({auditRunResult.audit_status || "COMPLETE"})
              </h3>
              <button
                type="button"
                onClick={() => setAuditRunResult(null)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                ✕ Dismiss
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
              <div className="rounded-lg bg-white p-3 border border-indigo-100">
                <span className="text-slate-400">Roles Audited</span>
                <p className="text-base font-bold text-slate-800">{auditRunResult.total_roles_audited}</p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-indigo-100">
                <span className="text-slate-400">Matches Audited</span>
                <p className="text-base font-bold text-slate-800">{auditRunResult.total_matches_audited}</p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-indigo-100">
                <span className="text-rose-500 font-semibold">High Severity</span>
                <p className="text-base font-bold text-rose-600">{auditRunResult.high_severity_count}</p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-indigo-100">
                <span className="text-amber-500 font-semibold">Medium Severity</span>
                <p className="text-base font-bold text-amber-600">{auditRunResult.medium_severity_count}</p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-indigo-100">
                <span className="text-emerald-500 font-semibold">Low Severity</span>
                <p className="text-base font-bold text-emerald-600">{auditRunResult.low_severity_count}</p>
              </div>
            </div>

            {auditRunResult.hr_summary_recommendation && (
              <div className="mt-3 rounded-lg bg-white p-3 text-xs leading-relaxed text-slate-700 border border-indigo-100">
                <span className="font-bold text-indigo-950">HR Recommendation: </span>
                {auditRunResult.hr_summary_recommendation}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <form
          onSubmit={applyFilters}
          className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Review Status
            </label>

            <select
              name="review_status"
              value={filters.review_status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="concerning">Concerning</option>
              <option value="not_concerning">Not Concerning</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Flag Type
            </label>

            <input
              type="text"
              name="flag_type"
              value={filters.flag_type}
              onChange={handleFilterChange}
              placeholder="Enter flag type"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={() => {
              setFilters(initialFilters);
              setTimeout(() => loadFlags(), 0);
            }}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </form>

        {/* Error */}
        {error && !selectedFlag && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Flags table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Bias Flags
            </h2>

            <span className="text-sm text-gray-500">
              {flags.length} records
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading bias flags...
            </div>
          ) : flags.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No bias flags found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Job Role</th>
                    <th className="px-5 py-4">Flag Type</th>
                    <th className="px-5 py-4">Severity</th>
                    <th className="px-5 py-4">Review Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {flags.map((flag) => (
                    <tr
                      key={flag.flag_id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {flag.employee_name || flag.employee_id || "N/A"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {flag.job_title || flag.job_role_id || "N/A"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatLabel(flag.flag_type)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityStyle(
                            flag.severity
                          )}`}
                        >
                          {formatLabel(flag.severity)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getReviewStyle(
                            flag.review_status
                          )}`}
                        >
                          {formatLabel(flag.review_status || "pending")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => openModal(flag)}
                          className="rounded-lg bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          Review Flag
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Three-stage wizard modal */}
      {selectedFlag && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bias-review-title"
            className="my-8 flex max-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 id="bias-review-title" className="text-lg font-bold text-slate-900">
                  Bias Flag Review
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Complete all three stages to finalize your decision.
                </p>
              </div>

              <button
                type="button"
                onClick={() => closeModal()}
                disabled={savingReview || savingDecision}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stage indicator */}
            <div className="flex justify-center border-b border-slate-100 px-6 py-4">
              <div className="flex w-full max-w-md items-center justify-center">
                {stages.map((stage, index) => (
                  <div
                    key={stage.number}
                    className="flex flex-1 items-center"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          currentStage >= stage.number
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {stage.number}
                      </div>

                      <span
                        className={`mt-2 whitespace-nowrap text-xs font-medium ${
                          currentStage === stage.number
                            ? "text-indigo-700"
                            : "text-slate-500"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>

                    {index !== stages.length - 1 && (
                      <div
                        className={`mx-3 mb-5 h-1 flex-1 rounded ${
                          currentStage > stage.number
                            ? "bg-indigo-600"
                            : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* STAGE 1: Details */}
              {currentStage === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Stage 1: Bias Flag Details
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Examine the employee, job role, and AI-generated flag.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Employee
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {selectedFlag.employee_name || "N/A"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        ID: {selectedFlag.employee_id || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Job Role
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {selectedFlag.job_title || "N/A"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Role ID: {selectedFlag.job_role_id || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Flag Type
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {formatLabel(selectedFlag.flag_type)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Severity
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getSeverityStyle(
                          selectedFlag.severity
                        )}`}
                      >
                        {formatLabel(selectedFlag.severity)}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Match Score
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {selectedFlag.match_score ?? "N/A"}
                        {selectedFlag.match_score != null ? "%" : ""}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-xs font-bold text-slate-700">
                      Flag Description
                    </h4>

                    <div className="rounded-xl border border-slate-200 p-4 text-xs leading-6 text-slate-700">
                      {selectedFlag.description || "No description provided."}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-xs font-bold text-slate-700">
                      AI Recommendation
                    </h4>

                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs leading-6 text-indigo-900">
                      {selectedFlag.recommendation ||
                        "No recommendation provided."}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    AI-generated flags are advisory. The final candidate
                    decision must be made by HR.
                  </p>
                </div>
              )}

              {/* STAGE 2: HR Review */}
              {currentStage === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Stage 2: HR Review
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Decide whether the identified flag is a genuine concern.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                        reviewStatus === "concerning"
                          ? "border-red-400 bg-red-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reviewStatus"
                        value="concerning"
                        checked={reviewStatus === "concerning"}
                        onChange={(event) =>
                          setReviewStatus(event.target.value)
                        }
                        className="mt-1"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Concerning
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          The flag represents a genuine concern that requires
                          attention.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                        reviewStatus === "not_concerning"
                          ? "border-green-400 bg-green-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reviewStatus"
                        value="not_concerning"
                        checked={reviewStatus === "not_concerning"}
                        onChange={(event) =>
                          setReviewStatus(event.target.value)
                        }
                        className="mt-1"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Not Concerning
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          The flag does not represent a genuine concern.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      HR Review Comments
                    </label>

                    <textarea
                      rows={4}
                      value={reviewComments}
                      onChange={(event) =>
                        setReviewComments(event.target.value)
                      }
                      placeholder="Explain your assessment..."
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* STAGE 3: Final Decision */}
              {currentStage === 3 && (
                <form
                  id="finalDecisionForm"
                  onSubmit={handleDecisionSubmit}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Stage 3: Final Candidate Decision
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Make the final decision for this candidate.
                    </p>
                  </div>

                  {existingDecision?.decision && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">
                        Previously Submitted Decision
                      </p>

                      <p className="mt-2 text-sm font-semibold text-blue-900">
                        {formatLabel(existingDecision.decision)}
                      </p>

                      {existingDecision.comments && (
                        <p className="mt-1 text-xs text-blue-800">
                          {existingDecision.comments}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      HR Review Result
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatLabel(reviewStatus || selectedFlag.review_status)}
                    </p>

                    {reviewComments && (
                      <p className="mt-2 text-xs text-slate-600">
                        {reviewComments}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Final Decision
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {decisionOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                            decision === option.value
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="finalDecision"
                            value={option.value}
                            checked={decision === option.value}
                            onChange={(event) =>
                              setDecision(event.target.value)
                            }
                          />

                          <span className="text-xs font-semibold text-slate-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {decision === "reject" && (
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700">
                        Override Reason <span className="text-red-500">*</span>
                      </label>

                      <textarea
                        rows={3}
                        value={overrideReason}
                        onChange={(event) =>
                          setOverrideReason(event.target.value)
                        }
                        required
                        placeholder="Explain why this candidate is being rejected..."
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Decision Comments
                    </label>

                    <textarea
                      rows={3}
                      value={decisionComments}
                      onChange={(event) =>
                        setDecisionComments(event.target.value)
                      }
                      placeholder="Add any additional comments..."
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <button
                type="button"
                onClick={goToPreviousStage}
                disabled={currentStage === 1 || savingReview || savingDecision}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              {currentStage < 3 ? (
                <button
                  type="button"
                  onClick={
                    currentStage === 1
                      ? goToNextStage
                      : handleReviewSubmit
                  }
                  disabled={savingReview || savingDecision}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingReview
                    ? "Saving Review..."
                    : currentStage === 1
                    ? "Continue"
                    : "Submit Review & Continue"}
                </button>
              ) : (
                <button
                  type="submit"
                  form="finalDecisionForm"
                  disabled={savingDecision || savingReview}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingDecision ? "Submitting..." : "Submit Final Decision"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HRBiasAudit;
