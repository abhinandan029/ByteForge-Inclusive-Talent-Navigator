import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  runInclusiveMatching,
  getHRMatchingResults,
  getMatchingDetails,
} from "../services/matchingApi";
import { getJobRoles } from "../services/jobsApi";
import AgentRunPanel from "../components/AgentRunPanel";

export default function HRMatching() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningMatching, setRunningMatching] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [selectedRoleId, setSelectedRoleId] = useState("ALL");
  const [minScore, setMinScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Match detail modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Run execution summary
  const [runSummary, setRunSummary] = useState(null);

  useEffect(() => {
    if (!runningMatching) return undefined;

    const timers = [
      setTimeout(() => setMatchingStep(1), 900),
      setTimeout(() => setMatchingStep(2), 1800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [runningMatching]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [matchesData, rolesData] = await Promise.all([
        getHRMatchingResults().catch(() => ({ results: [] })),
        getJobRoles().catch(() => ({ job_roles: [] })),
      ]);

      setMatches(matchesData.results || []);
      setRoles(rolesData.job_roles || []);
    } catch (err) {
      setError(err.message || "Failed to load matching results.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRunMatching() {
    if (
      !confirm(
        "Run the Opportunity Matching Agent across all active job roles and ready employees?"
      )
    ) {
      return;
    }

    try {
      setRunningMatching(true);
      setMatchingStep(0);
      setError("");
      setSuccess("");
      setRunSummary(null);

      const result = await runInclusiveMatching();
      setMatchingStep(3);
      setSuccess(
        result.message || "Opportunity matching completed successfully!"
      );
      setRunSummary({
        totalEmployees: result.total_employees_processed,
        totalRoles: result.total_job_roles_processed,
        totalMatches: result.total_matches_generated,
        savedMatches: result.total_matches_saved,
      });

      await loadData();
    } catch (err) {
      setError(err.message || "Matching agent execution failed.");
    } finally {
      setRunningMatching(false);
      setMatchingStep(0);
    }
  }

  async function handleViewDetail(matchId) {
    try {
      setDetailLoading(true);
      const data = await getMatchingDetails(matchId);
      setSelectedMatch(data.result || null);
    } catch (err) {
      setError(err.message || "Unable to fetch match details.");
    } finally {
      setDetailLoading(false);
    }
  }

  const filteredMatches = matches.filter((m) => {
    const roleId = m.job_role_id || m.JOB_ROLE_ID;
    const empName = m.employee_name || m.EMPLOYEE_NAME || "";
    const empId = m.employee_id || m.EMPLOYEE_ID || "";
    const jobTitle = m.job_title || m.JOB_TITLE || "";
    const score = parseFloat(m.match_score || m.MATCH_SCORE || 0);

    const matchesRole = selectedRoleId === "ALL" || roleId === selectedRoleId;
    const matchesScore = score >= minScore;
    const matchesSearch =
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesScore && matchesSearch;
  });

  function getScoreBadge(score) {
    const num = Math.round(score);
    if (num >= 80) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (num >= 60) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <div className="min-h-full bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Internal Talent Discovery
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Opportunity Matching
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Inclusive, criteria-driven skill matching connecting employees with internal vacancies without demographic bias.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading || runningMatching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

          </div>
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-px shadow-sm shadow-indigo-200/50">
          <div className="flex flex-col justify-between gap-5 rounded-[0.95rem] bg-gradient-to-br from-indigo-50/95 via-white/95 to-purple-50/95 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Primary workflow
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Opportunity Matching Agent
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Compare verified employee skills with active roles and
                  generate explainable, bias-aware opportunities.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-indigo-700">
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Skills comparison</span>
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Weighted scoring</span>
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Explainable results</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRunMatching}
              disabled={runningMatching}
              className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-2xl bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={18} className={runningMatching ? "animate-spin" : ""} />
              {runningMatching ? "Agent Running..." : "Run Matching Agent"}
            </button>
          </div>
        </section>

        {/* FEEDBACK & RUN SUMMARY */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {runSummary && (
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Last Agent Execution Summary
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
              <div>
                <span className="text-indigo-600">Employees Evaluated</span>
                <p className="text-lg font-bold text-indigo-950">{runSummary.totalEmployees}</p>
              </div>
              <div>
                <span className="text-indigo-600">Active Roles Evaluated</span>
                <p className="text-lg font-bold text-indigo-950">{runSummary.totalRoles}</p>
              </div>
              <div>
                <span className="text-indigo-600">Matches Generated</span>
                <p className="text-lg font-bold text-indigo-950">{runSummary.totalMatches}</p>
              </div>
              <div>
                <span className="text-indigo-600">Matches Persisted</span>
                <p className="text-lg font-bold text-indigo-950">{runSummary.savedMatches}</p>
              </div>
            </div>
          </div>
        )}

        {runningMatching && (
          <AgentRunPanel
            agentName="Opportunity Matching Agent"
            task="Comparing confirmed employee skills with active internal roles and generating explainable matches."
            steps={[
              "Load candidates",
              "Compare skills",
              "Score opportunities",
              "Save results",
            ]}
            activeStep={matchingStep}
          />
        )}

        {/* CONTROLS */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, ID, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Job Roles</option>
              {roles.map((r) => {
                const rId = r.job_role_id || r.JOB_ROLE_ID;
                const rTitle = r.title || r.TITLE;
                return (
                  <option key={rId} value={rId}>
                    {rTitle} ({rId})
                  </option>
                );
              })}
            </select>

            <select
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value={0}>All Scores (0%+)</option>
              <option value={50}>50%+ Match</option>
              <option value={70}>70%+ Match</option>
              <option value={85}>85%+ Match</option>
            </select>
          </div>
        </div>

        {/* MATCHES LIST */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
              <RefreshCw size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No matching results found. Click &quot;Run Opportunity Matching&quot; to execute the matching agent across confirmed candidates.
            </div>
          ) : (
            filteredMatches.map((match) => {
              const matchId = match.match_id || match.MATCH_ID;
              const empName = match.employee_name || match.EMPLOYEE_NAME || "Candidate";
              const empId = match.employee_id || match.EMPLOYEE_ID;
              const currentRole = match.current_role || match.CURRENT_ROLE;
              const exp = match.years_experience ?? match.YEARS_EXPERIENCE;

              const jobTitle = match.job_title || match.JOB_TITLE;
              const dept = match.department || match.DEPARTMENT;
              const score = parseFloat(match.match_score || match.MATCH_SCORE || 0);

              const matchedSkills = match.matched_skills || [];
              const missingSkills = match.missing_skills || [];
              const expWarning = match.experience_warning || match.EXPERIENCE_WARNING;
              const explanation = match.match_explanation || match.MATCH_EXPLANATION;
              const breakdown = match.score_breakdown || {};

              const pct = Math.min(100, Math.max(0, Math.round(score)));

              return (
                <div
                  key={matchId}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-4">
                      {/* SCORE BADGE */}
                      <div
                        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${getScoreBadge(
                          score
                        )} shadow-sm`}
                      >
                        <span className="text-base font-extrabold">{pct}%</span>
                        <span className="text-[9px] font-bold uppercase">Match</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{empName}</h3>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                            ID: {empId}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          Current: {currentRole || "Team Member"} • {exp != null ? `${exp} yrs experience` : "Experience unstated"}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Target Role:</span>
                          <span className="font-semibold text-slate-800">{jobTitle}</span>
                          {dept && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                              {dept}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(matchId)}
                        disabled={detailLoading}
                        className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        {detailLoading ? "Loading Details..." : "View Full Details"}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/hr/bias-audit")}
                        className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                      >
                        Review Bias Flags
                      </button>
                    </div>
                  </div>

                  {/* EXPERIENCE WARNING (IF ANY) */}
                  {expWarning && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                      <span>{expWarning}</span>
                    </div>
                  )}

                  {/* SKILLS BREAKDOWN */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3">
                    {[
                      ["Skill coverage", breakdown.skill_coverage],
                      ["Evidence strength", breakdown.evidence_strength],
                      ["Experience fit", breakdown.experience_fit],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-slate-50 p-2.5">
                        <div className="flex justify-between gap-2 text-[10px] font-semibold text-slate-500">
                          <span>{label}</span>
                          <span>{value == null ? "—" : `${Math.round(value)}%`}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                          <div
                            className="h-1.5 rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(100, Math.max(0, Number(value || 0)))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-800 text-[11px] uppercase tracking-wider">
                        Matched Skills ({matchedSkills.length})
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {matchedSkills.length === 0 ? (
                          <span className="text-slate-400">No direct skills matched.</span>
                        ) : (
                          matchedSkills.map((s, i) => (
                            <span
                              key={i}
                              className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                            >
                              {s.skill_name || s.name}
                              {s.inferred_proficiency ? ` · ${s.inferred_proficiency}` : ""}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                        Missing Skills ({missingSkills.length})
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {missingSkills.length === 0 ? (
                          <span className="text-slate-400">No missing skills. Full coverage!</span>
                        ) : (
                          missingSkills.map((s, i) => {
                            const isMandatory = s.is_mandatory ?? true;
                            return (
                              <span
                                key={i}
                                className={`rounded border px-2 py-0.5 text-[11px] font-medium ${
                                  isMandatory
                                    ? "border-rose-200 bg-rose-50 text-rose-700"
                                    : "border-slate-200 bg-slate-50 text-slate-600"
                                }`}
                              >
                                {s.skill_name || s.name}
                                {isMandatory && " *"}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI EXPLANATION */}
                  {explanation && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 border border-slate-100">
                      <span className="font-bold text-slate-800">AI Explanation: </span>
                      {explanation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* MATCH DETAILS MODAL */}
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Opportunity Match Details
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <span className="text-slate-400">Candidate</span>
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedMatch.employee_name} ({selectedMatch.employee_id})
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Job Role</span>
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedMatch.job_title} ({selectedMatch.job_role_id})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400">Calculated Match Score</span>
                    <p className="font-extrabold text-indigo-700 text-lg">
                      {Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round(selectedMatch.match_score || 0)
                        )
                      )}%
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Status</span>
                    <p className="font-bold text-emerald-700">Completed</p>
                  </div>
                </div>

                {selectedMatch.match_explanation && (
                  <div>
                    <span className="text-slate-400 font-bold">Comprehensive Rationale:</span>
                    <p className="mt-1 rounded-xl bg-slate-50 p-3 leading-relaxed text-slate-700 border border-slate-100">
                      {selectedMatch.match_explanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
