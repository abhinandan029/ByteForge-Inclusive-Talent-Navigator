import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Target,
  BookOpen,
} from "lucide-react";
import { getLearningPathway } from "../services/learningApi";
import { getEmployeeSkills } from "../services/skillsApi";
import { useAuth } from "../contexts/AuthContext";

export default function MatchingPage() {
  const { employee } = useAuth();
  const [pathway, setPathway] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    if (!employee?.employee_id) return;
    try {
      setLoading(true);
      setError("");

      const [skillsData, pathwayData] = await Promise.all([
        getEmployeeSkills(employee.employee_id).catch(() => null),
        getLearningPathway().catch((err) => ({ error: err.message })),
      ]);

      setProfile(skillsData);
      setPathway(pathwayData);
    } catch (err) {
      setError(err.message || "Failed to load matching status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [employee]);

  const isConfirmed = profile?.is_confirmed || false;
  const targetRole = pathway?.target_role;
  const missingSkills = pathway?.skill_gaps_addressed || [];
  const confirmedSkills = profile?.confirmed_skills_final || [];

  return (
    <div className="min-h-full bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Internal Career Mobility
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                <Sparkles size={11} /> Inclusive Matching Engine
              </span>
            </div>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Role Matching & Opportunities
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Internal career opportunities matched to your verified skills using our name-blind, inclusive matching algorithms.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="mt-8 flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
            <div className="text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-indigo-600"
              />
              <p className="mt-3 text-sm font-medium text-slate-700">
                Loading your matched internal opportunities...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <h2 className="text-xl font-bold text-rose-900">
              Unable to load matching status
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-rose-800">
              {error}
            </p>
            <button
              type="button"
              onClick={loadData}
              className="mt-6 rounded-xl bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-800"
            >
              Try again
            </button>
          </div>
        ) : !isConfirmed ? (
          /* NOT CONFIRMED BANNER */
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Target size={28} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-amber-900">
              Skill Confirmation Required
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-amber-800">
              To match you fairly with active internal job roles, our inclusive algorithms require you to confirm your extracted skills first.
            </p>
            <div className="mt-6">
              <Link
                to="/skills"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-900"
              >
                Go to Skills Discovery <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* MATCHED TARGET ROLE CARD */}
            {targetRole ? (
              <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                        Top Matched Internal Role
                      </span>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {targetRole}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Evaluated by the Opportunity Matching Agent based on your verified skills.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/learning"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <span>View Career Pathway</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* SKILLS BREAKDOWN */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                      <CheckCircle2 size={16} />
                      Your Confirmed Skills ({confirmedSkills.length})
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {confirmedSkills.slice(0, 8).map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {confirmedSkills.length > 8 && (
                        <span className="text-[11px] text-emerald-700 font-medium self-center">
                          +{confirmedSkills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                    <div className="flex items-center gap-2 text-purple-800 font-semibold text-xs">
                      <Target size={16} />
                      Skill Gaps to Bridge ({missingSkills.length})
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {missingSkills.length > 0 ? (
                        missingSkills.map((gap, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-purple-200 bg-white px-2 py-0.5 text-[11px] font-medium text-purple-800"
                          >
                            {gap}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-purple-700">
                          Great job! No skill gaps detected for this role.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {pathway?.pathway_summary && (
                  <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                    <span className="font-semibold text-slate-900">
                      AI Matching Rationale:{" "}
                    </span>
                    {pathway.pathway_summary}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <Target size={32} className="mx-auto text-slate-400" />
                <h3 className="mt-3 text-base font-bold text-slate-800">
                  Profile Ready for Internal Matching
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                  Your confirmed skills are active in the matching pool. When HR runs internal talent discovery, matches will be reflected here.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Link
                    to="/learning"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <BookOpen size={13} />
                    Explore Learning Pathways
                  </Link>
                </div>
              </div>
            )}

            {/* RESPONSIBLE AI PRINCIPLES IN MATCHING */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                How Our Inclusive Matching Algorithm Works
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs text-slate-600">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-bold text-slate-900">1. Strict Normalization</span>
                  <p className="mt-1 text-slate-500">
                    Matches use exact normalized skill taxonomy and evidence snippets rather than speculative similarity.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-bold text-slate-900">2. Blind Evaluation</span>
                  <p className="mt-1 text-slate-500">
                    Algorithms operate exclusively on verified competencies, completely blind to demographic or career gap data.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-bold text-slate-900">3. Human HR Authority</span>
                  <p className="mt-1 text-slate-500">
                    HR partners review all matches alongside bias flags and retain final decision-making power.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
