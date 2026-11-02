
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  Brain,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react";

import { getEmployeeSkills } from "../services/skillsApi";
import { useAuth } from "../contexts/AuthContext";

// ==========================================
// INFO CARD
// ==========================================

function InfoCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={21} />
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <h3 className="mt-1 text-xl font-bold text-slate-800">
        {value}
      </h3>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

// ==========================================
// SKILL LIST
// ==========================================

function SkillList({ title, skills, type }) {
  const isConfirmed = type === "confirmed";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {skills.length} skill{skills.length === 1 ? "" : "s"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isConfirmed
              ? "bg-emerald-50 text-emerald-700"
              : skills.length > 0
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {isConfirmed
            ? "Employee verified"
            : skills.length > 0
              ? "Awaiting confirmation"
              : "No pending skills"}
        </span>
      </div>

      {skills.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          {isConfirmed
            ? "No confirmed skills available yet."
            : "No pending skills. Extract or add skills to get started."}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={skill.skill_id || `${skill.name}-${index}`}
              className={`rounded-lg border px-3 py-2 text-sm ${
                isConfirmed
                  ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                  : "border-indigo-100 bg-indigo-50 text-indigo-800"
              }`}
              title={skill.evidence_snippet || ""}
            >
              {skill.name}

              {skill.taxonomy_category && (
                <span className="ml-2 text-xs opacity-60">
                  {skill.taxonomy_category}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

// ==========================================
// DASHBOARD
// ==========================================

export default function Dashboard() {
  const {
    employee: loggedInEmployee,
    loading: authLoading,
  } = useAuth();

  const employeeId = loggedInEmployee?.employee_id;

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (authLoading) return;

      if (!loggedInEmployee || !employeeId) {
        setError(
          "Your employee session could not be found. Please log in again."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getEmployeeSkills(employeeId);

        if (active) {
          setEmployeeData(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load dashboard.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [employeeId, loggedInEmployee, authLoading]);

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="mx-auto animate-spin text-indigo-600"
            size={30}
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle
          className="mx-auto text-red-600"
          size={32}
        />

        <h2 className="mt-3 font-semibold text-red-800">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Reload page
        </button>
      </div>
    );
  }

  // ==========================================
  // EMPLOYEE AND SKILLS DATA
  // ==========================================

  const employee = employeeData?.employee;

  const isConfirmed = Boolean(
    employee?.is_confirmed ?? employeeData?.is_confirmed
  );

  const readyForMatching = Boolean(
    employee?.ready_for_matching ??
    employeeData?.ready_for_matching
  );

  // If the employee has confirmed their skills,
  // do not display old draft skills as pending.
  const draftSkills = isConfirmed
    ? []
    : employeeData?.extracted_skills_draft || [];

  const confirmedSkills =
    employeeData?.confirmed_skills_final || [];
  const pendingSkillCount = draftSkills.length;
  const confirmedSkillCount = confirmedSkills.length;
  const profileFields = [
    employee?.full_name,
    employee?.current_role,
    employee?.grade,
    employee?.years_experience != null,
  ];
  const profileCompletion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );
  const nextStep = !isConfirmed
    ? "Review and confirm your extracted skills"
    : !readyForMatching
      ? "Complete your profile to unlock matching"
      : "Explore opportunities matched to your skills";
  const nextStepLink = !isConfirmed
    ? "/skills"
    : !readyForMatching
      ? "/skills"
      : "/matching";

  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <section className="mb-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-200">
          <div className="relative p-7 sm:p-9">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                  Employee command center
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome back,{" "}
                  {employee?.full_name ||
                    loggedInEmployee?.full_name ||
                    "Employee"}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Keep your profile ready, validate your skills, and discover opportunities
                  that fit the direction you want to grow.
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-700">
                  <UserRound size={25} />
                </div>
                <div>
                  <p className="font-semibold">{employee?.current_role || "Role not provided"}</p>
                  <p className="mt-1 text-xs text-slate-300">Employee ID: {employee?.employee_id || employeeId}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-3">
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Matching status</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                {readyForMatching ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Clock3 size={15} className="text-amber-300" />}
                {readyForMatching ? "Ready for opportunities" : "Profile needs attention"}
              </p>
            </div>
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Confirmed skills</p>
              <p className="mt-1 text-sm font-semibold">{confirmedSkillCount} verified skill{confirmedSkillCount === 1 ? "" : "s"}</p>
            </div>
            <div className="px-7 py-4">
              <p className="text-xs text-slate-400">Profile readiness</p>
              <p className="mt-1 text-sm font-semibold">{profileCompletion}% complete</p>
            </div>
          </div>
        </section>

        {/* NEXT STEP */}

        <section className="mb-6 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Recommended next step</p>
            <h2 className="mt-2 text-xl font-semibold">{nextStep}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              Complete this step to improve the quality of your opportunity recommendations.
            </p>
            <Link
              to={nextStepLink}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Continue
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Profile readiness</p>
                <p className="mt-1 text-xs text-slate-500">Saved profile details</p>
              </div>
              <Target className="text-indigo-600" size={22} />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{profileCompletion}%</span>
              <span className="text-xs font-medium text-slate-500">{readyForMatching ? "Ready" : "Needs attention"}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
        </section>

        {/* PROFILE SNAPSHOT */}

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <InfoCard
            icon={BriefcaseBusiness}
            title="Current Role"
            value={employee?.current_role || "Not provided"}
          />
          <InfoCard
            icon={GraduationCap}
            title="Grade"
            value={employee?.grade || "Not provided"}
          />
          <InfoCard
            icon={Clock3}
            title="Experience"
            value={employee?.years_experience != null ? `${employee.years_experience} years` : "Not provided"}
          />
          <InfoCard
            icon={Brain}
            title="Career Break"
            value={employee?.has_career_break ? "Yes" : "No"}
          />
          <InfoCard icon={CheckCircle2} title="Confirmed" value={confirmedSkillCount} subtitle="Verified skills" />
          <InfoCard icon={Clock3} title="To review" value={pendingSkillCount} subtitle="Pending skills" />
        </div>

        {/* SKILLS OVERVIEW */}

        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Skills Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Skills extracted from your profile and skills confirmed by you.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SkillList
            title="Extracted Skills"
            skills={draftSkills}
            type="draft"
          />

          <SkillList
            title="Confirmed Skills"
            skills={confirmedSkills}
            type="confirmed"
          />
        </div>

        {/* STATUS */}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* SKILLS CONFIRMATION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Sparkles size={21} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Skills Confirmation
                </h3>

                <p className="text-sm text-slate-500">
                  {isConfirmed
                    ? "Your skills have been confirmed."
                    : "Your extracted skills still need your review."}
                </p>
              </div>
            </div>

            <Link
              to="/skills"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {isConfirmed
                ? "Review skills"
                : "Confirm your skills"}

              <ArrowRight size={16} />
            </Link>
          </div>

        </section>

      </div>
    </main>
  );
}
