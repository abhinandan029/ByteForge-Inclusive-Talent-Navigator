import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  EyeOff,
  CalendarCheck,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getEmployeeSkills } from "../services/skillsApi";

export default function FairnessReviewPage() {
  const { employee } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!employee?.employee_id) return;
      try {
        const data = await getEmployeeSkills(employee.employee_id);
        setProfileData(data);
      } catch (err) {
        console.error("Failed to load employee profile:", err);
      }
    }
    loadData();
  }, [employee]);

  const confirmedCount = profileData?.confirmed_skills_final?.length || 0;
  const isConfirmed = profileData?.is_confirmed || false;
  const isReadyForMatching = profileData?.employee?.ready_for_matching || false;

  const fairnessPillars = [
    {
      title: "Demographic-Blind Matching",
      icon: EyeOff,
      description:
        "Matching algorithms evaluate strictly verified skills and evidence snippets. Names, gender, age, ethnicity, and graduation years are never supplied to the matching models.",
      benefit: "Eliminates unconscious screening bias across all candidates.",
    },
    {
      title: "Career-Break & Returner Protection",
      icon: CalendarCheck,
      description:
        "Employment pauses, parental leaves, or non-traditional timelines are protected. The Bias Review Agent flags any job requirement demanding 'uninterrupted tenure' as potentially exclusionary.",
      benefit: "Protects career returners and diverse life circumstances from unfair penalties.",
    },
    {
      title: "Objective Taxonomy & Evidence",
      icon: Scale,
      description:
        "Every extracted skill is validated against verified documents and mapped to standardized taxonomies, preventing bias toward specific buzzwords or institutional prestige.",
      benefit: "Scores reflect true capability rather than resume keyword stuffing.",
    },
    {
      title: "Human-in-the-Loop Governance",
      icon: HeartHandshake,
      description:
        "AI agents never execute automatic hiring or rejection decisions. The platform generates fairness indicators and decision recommendations, leaving all final authority with human HR partners.",
      benefit: "Ensures ethical accountability, human empathy, and audit compliance.",
    },
  ];

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
                  Responsible AI Governance
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Fairness & Bias Review
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Learn how the Inclusive Talent Navigator guarantees equitable evaluation, eliminates historical bias, and protects diverse talent.
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-700">
                  <ShieldCheck size={25} />
                </div>
                <div>
                  <p className="font-semibold">Ethical AI Charter</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Demographic-Blind Matching Active
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-3">
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Demographic Screening</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 size={15} className="text-emerald-400" />
                100% Name & Demographic Blind
              </p>
            </div>
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Career-Break Protection</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Tenure-gap penalty disabled
              </p>
            </div>
            <div className="px-7 py-4">
              <p className="text-xs text-slate-400">Governance Model</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <HeartHandshake size={15} className="text-emerald-400" />
                Human-in-the-loop enforced
              </p>
            </div>
          </div>
        </section>

        {/* EMPLOYEE STATUS CARD */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Inclusive Evaluation Status
              </span>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {employee?.full_name || "Employee"} (ID: {employee?.employee_id})
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Current Role: {profileData?.employee?.current_role || "Engineering"} • Experience:{" "}
                {profileData?.employee?.years_experience || 0} years
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isConfirmed
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <CheckCircle2 size={13} />
                {isConfirmed
                  ? `${confirmedCount} Verified Skills`
                  : "Skills Pending Confirmation"}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isReadyForMatching
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <ShieldCheck size={13} />
                {isReadyForMatching
                  ? "Active in Inclusive Matching"
                  : "Complete Profile to Match"}
              </span>
            </div>
          </div>

          {!isConfirmed && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50/70 p-3.5 text-xs text-amber-800 border border-amber-200">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-amber-600 shrink-0" />
                <span>
                  Confirm your extracted skills so the Opportunity Matching Agent can evaluate your profile without bias.
                </span>
              </div>
              <Link
                to="/skills"
                className="inline-flex items-center gap-1 font-bold text-amber-900 underline hover:text-amber-700"
              >
                Confirm Now <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* 4 PILLARS OF RESPONSIBLE AI */}
        <div className="mt-8">
          <h2 className="text-base font-bold text-slate-900">
            Four Pillars of Algorithmic Fairness
          </h2>
          <p className="text-xs text-slate-500">
            Engineered into every agent and MCP tool across our platform.
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {fairnessPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {pillar.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {pillar.description}
                  </p>

                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] font-medium text-slate-700 border border-slate-100">
                    <span className="font-semibold text-indigo-600">Inclusive Impact: </span>
                    {pillar.benefit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ETHICAL AUDITABILITY SECTION */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Verify Your Immutable Audit Trail
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                You can inspect every single algorithmic action and tool invocation performed by the system at any time.
              </p>
            </div>

            <Link
              to="/audit-log"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <ShieldCheck size={14} />
              Open Audit Log
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
