import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  TrendingUp,
  ExternalLink,
  Clock,
  Target,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Briefcase,
  BarChart2,
  Info,
} from "lucide-react";
import { getLearningPathway } from "../services/learningApi";
import { getMarketIntelligence } from "../services/marketApi";
import AgentActionCard from "../components/AgentActionCard";

export default function LearningPathPage() {
  const [activeTab, setActiveTab] = useState("pathway"); // "pathway" | "market"

  // Learning pathway state
  const [pathway, setPathway] = useState(null);
  const [pathwayLoading, setPathwayLoading] = useState(true);
  const [pathwayError, setPathwayError] = useState("");

  // Market intelligence state
  const [market, setMarket] = useState(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState("");

  const pathwayRunning = pathwayLoading;
  const marketRunning = marketLoading;

  async function loadPathway() {
    try {
      setPathwayLoading(true);
      setPathwayError("");
      const data = await getLearningPathway();
      setPathway(data);
    } catch (err) {
      setPathwayError(
        err.message ||
          "Unable to generate your learning pathway. Please ensure your skills are confirmed and matching has run."
      );
    } finally {
      setPathwayLoading(false);
    }
  }

  async function loadMarket() {
    try {
      setMarketLoading(true);
      setMarketError("");
      const data = await getMarketIntelligence();
      setMarket(data);
    } catch (err) {
      setMarketError(
        err.message ||
          "Unable to analyze market intelligence. Please confirm your skills first."
      );
    } finally {
      setMarketLoading(false);
    }
  }

  useEffect(() => {
    loadPathway();
    loadMarket();
  }, []);

  function getDemandBadge(level) {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "growing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "stable":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  function getTrendIcon(trend) {
    if (trend?.toLowerCase() === "up" || trend?.toLowerCase() === "growing") {
      return <TrendingUp size={14} className="text-emerald-600" />;
    }
    return <span className="text-xs text-slate-400">→</span>;
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
                  Career Development & Market Intelligence
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Personalized Learning Pathway
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  AI-recommended SAP Learning Hub courses to bridge skill gaps and real-time market demand signals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-700">
                    <GraduationCap size={25} />
                  </div>
                  <div>
                    <p className="font-semibold">{pathway?.target_role || "SAP Career Pathway"}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      SAP Learning Hub · Verified Curricula
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    loadPathway();
                    loadMarket();
                  }}
                  disabled={pathwayLoading || marketLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={pathwayLoading || marketLoading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-3">
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Target Role</p>
              <p className="mt-1 text-sm font-semibold truncate">
                {pathway?.target_role || "Evaluating opportunities"}
              </p>
            </div>
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Skill Gaps Addressed</p>
              <p className="mt-1 text-sm font-semibold">
                {pathway?.skill_gaps_addressed?.length || 0} skill gap{(pathway?.skill_gaps_addressed?.length === 1) ? "" : "s"} targeted
              </p>
            </div>
            <div className="px-7 py-4">
              <p className="text-xs text-slate-400">Market Signals</p>
              <p className="mt-1 text-sm font-semibold">
                {market?.high_demand_count ? `${market.high_demand_count} high-demand skills` : "Real-time demand active"}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <AgentActionCard
            eyebrow="Career development"
            agentName="Learning Pathway Agent"
            description="Map confirmed skill gaps to a practical SAP Learning Hub pathway."
            badges={["Skill-gap mapping", "Course recommendations"]}
            buttonLabel="Generate Pathway"
            runningLabel="Generating..."
            running={pathwayRunning}
            onRun={loadPathway}
          />
          <AgentActionCard
            eyebrow="Market intelligence"
            agentName="Market Intelligence Agent"
            description="Analyze active internal roles and demand signals for your confirmed skills."
            badges={["Role demand", "Trend signals"]}
            buttonLabel="Analyze Market"
            runningLabel="Analyzing..."
            running={marketRunning}
            onRun={loadMarket}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => {
              loadPathway();
              loadMarket();
            }}
            disabled={pathwayLoading || marketLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={pathwayLoading || marketLoading ? "animate-spin" : ""}
            />
            Refresh both agents
          </button>
        </div>

        {/* TABS */}
        <div className="mt-6 flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("pathway")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "pathway"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap size={18} />
            Learning Pathway (SAP Hub)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("market")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "market"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart2 size={18} />
            Market Intelligence
            {market?.high_demand_count ? (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                {market.high_demand_count}
              </span>
            ) : null}
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: LEARNING PATHWAY                                    */}
        {/* ========================================================= */}
        {activeTab === "pathway" && (
          <div className="mt-6 space-y-6">
            {pathwayLoading ? (
              <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
                <div className="text-center">
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-indigo-600"
                  />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Generating your personalized learning pathway...
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    The Career Development Agent is mapping your skill gaps to the SAP Learning Hub catalogue.
                  </p>
                </div>
              </div>
            ) : pathwayError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="shrink-0 text-amber-700" />
                  <div>
                    <h3 className="font-semibold text-amber-800">
                      Learning Pathway Notice
                    </h3>
                    <p className="mt-1 text-sm text-amber-700">
                      {pathwayError}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link
                        to="/skills"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-800"
                      >
                        Confirm Skills First
                      </Link>
                      <button
                        type="button"
                        onClick={loadPathway}
                        className="rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : pathway ? (
              <>
                {/* TARGET ROLE & SUMMARY BANNER */}
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                        <Target size={24} />
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                          <Sparkles size={12} /> Target Aspiration
                        </span>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                          {pathway.target_role || "Internal Career Mobility"}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Status:{" "}
                          <span className="font-semibold text-indigo-700">
                            {pathway.pathway_status || "Active Pathway"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY NARRATIVE */}
                  {pathway.pathway_summary && (
                    <div className="mt-5 rounded-xl border border-indigo-200/60 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Pathway Strategy
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">
                        {pathway.pathway_summary}
                      </p>
                    </div>
                  )}

                  {/* SKILL GAPS ADDRESSED */}
                  {pathway.skill_gaps_addressed && pathway.skill_gaps_addressed.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        Bridging Skill Gaps:
                      </span>
                      {pathway.skill_gaps_addressed.map((gap, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700"
                        >
                          {gap}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* RECOMMENDED COURSES GRID */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Recommended Courses from SAP Learning Hub
                      </h3>
                      <p className="text-xs text-slate-500">
                        Curated specifically to address missing skills for your matched role.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {pathway.recommended_courses?.length || 0} courses
                    </span>
                  </div>

                  {(!pathway.recommended_courses || pathway.recommended_courses.length === 0) ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                      No courses recommended at this time. All target skills are matched!
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pathway.recommended_courses.map((course, idx) => (
                        <div
                          key={course.course_id || idx}
                          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                                {course.course_id}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={13} />
                                {course.duration || "Self-paced"}
                              </span>
                            </div>

                            <h4 className="mt-3 text-base font-bold text-slate-900 line-clamp-2">
                              {course.title}
                            </h4>

                            <div className="mt-3">
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                                Target Skill:
                              </span>
                              <span className="ml-1.5 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                {course.target_skill}
                              </span>
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-100">
                            <a
                              href={course.sap_learning_hub_url || "https://learning.sap.com"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              <span>Enroll in SAP Hub</span>
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MARKET INTELLIGENCE                                */}
        {/* ========================================================= */}
        {activeTab === "market" && (
          <div className="mt-6 space-y-6">
            {marketLoading ? (
              <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
                <div className="text-center">
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-indigo-600"
                  />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Analyzing workforce market demand...
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    The Market Intelligence Agent is querying active open roles and market trends for your confirmed skills.
                  </p>
                </div>
              </div>
            ) : marketError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {marketError}
              </div>
            ) : market ? (
              <>
                {/* SUMMARY & NOTICE */}
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Market Demand Insight
                    </p>
                    <p className="mt-2 text-base font-semibold leading-relaxed text-slate-800">
                      {market.summary_insight || "Market demand analysis complete."}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <Info size={14} className="text-slate-400" />
                      <span>{market.how_this_was_produced}</span>
                    </div>
                    <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {market.is_simulated ? "Simulated fallback" : "Based on active internal roles"}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                      High Demand Skills
                    </p>
                    <p className="mt-2 text-4xl font-extrabold text-rose-700">
                      {market.high_demand_count || 0}
                    </p>
                    <p className="mt-1 text-xs text-rose-600">
                      Confirmed skills currently in high demand across active internal teams.
                    </p>
                  </div>
                </div>

                {/* IN DEMAND SKILLS TABLE */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="font-bold text-slate-900">
                      Skills Market Demand Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">
                      Active internal role requirements matched against your confirmed skillset.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-6 py-3">Skill</th>
                          <th className="px-6 py-3">Your Level</th>
                          <th className="px-6 py-3">Market Demand</th>
                          <th className="px-6 py-3">Trend</th>
                          <th className="px-6 py-3">Open Internal Roles</th>
                          <th className="px-6 py-3">Market Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {market.in_demand_skills && market.in_demand_skills.length > 0 ? (
                          market.in_demand_skills.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/60 transition">
                              <td className="px-6 py-4 font-semibold text-slate-800">
                                {item.skill}
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-600">
                                {item.user_level || "Proficient"}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${getDemandBadge(
                                    item.demand_level
                                  )}`}
                                >
                                  {item.demand_level}
                                </span>
                                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  {item.source === "ACTIVE_INTERNAL_ROLES"
                                    ? "Live internal roles"
                                    : "Simulated fallback"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-xs font-medium">
                                  {getTrendIcon(item.trend)}
                                  <span className="capitalize">{item.trend}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                  <Briefcase size={12} />
                                  {item.open_internal_roles || 0} roles
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">
                                <div>{item.market_note || "—"}</div>
                                {item.role_titles?.length ? (
                                  <div className="mt-1 text-[11px] font-medium text-indigo-600">
                                    {item.role_titles.join(", ")}
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-500">
                              No skill demand data available. Confirm your skills to view market intelligence.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SIMULATED DATASET NOTICE */}
                {market.is_simulated && (
                  <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">
                      Responsible AI Transparency Notice ({market.data_label}):
                    </span>{" "}
                    Market demand data is synthesized from benchmark internal job postings and technology demand projections.
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
