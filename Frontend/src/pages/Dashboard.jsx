
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
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getEmployeeSkills } from "../services/skillsApi";
// Adjust this import path to match your project structure.


function getLoggedInUser() {
  try {
    const storedUser = sessionStorage.getItem("itn_user");

    if (!storedUser) return null;

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}


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


function SkillList({ title, skills, type }) {
  const isConfirmed = type === "confirmed";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {skills.length} skill{skills.length === 1 ? "" : "s"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isConfirmed
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isConfirmed ? "Employee verified" : "Awaiting confirmation"}
        </span>
      </div>

      {skills.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No skills available yet.
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


export default function Dashboard() {
  const [employeeId] = useState(() => {
    const user = getLoggedInUser();

    return user?.employeeId || user?.employee_id || "";
  });

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!employeeId) {
        setError("Your employee ID could not be found. Please log in again.");
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
  }, [employeeId]);


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin text-indigo-600" size={30} />
          <p className="mt-3 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto text-red-600" size={32} />

        <h2 className="mt-3 font-semibold text-red-800">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-red-700">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Reload page
        </button>
      </div>
    );
  }


  const employee = employeeData?.employee;
  const draftSkills = employeeData?.extracted_skills_draft || [];
  const confirmedSkills = employeeData?.confirmed_skills_final || [];

  const isConfirmed = Boolean(
    employee?.is_confirmed ?? employeeData?.is_confirmed
  );

  const readyForMatching = Boolean(employee?.ready_for_matching);


  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              INCLUSIVE TALENT NAVIGATOR
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome, {employee?.full_name || "Employee"}
            </h1>

            <p className="mt-2 text-slate-500">
              Your employee profile and skills overview.
            </p>
          </div>

          <Link
            to="/skills"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Manage Skills
            <ArrowRight size={17} />
          </Link>
        </div>


        {/* EMPLOYEE PROFILE */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <UserRound size={30} />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                {employee?.full_name || "Employee"}
              </h2>

              <p className="mt-1 text-slate-500">
                {employee?.current_role || "Role not provided"}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Employee ID: {employee?.employee_id || employeeId}
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-medium sm:self-center ${
                readyForMatching
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {readyForMatching ? (
                <CheckCircle2 size={17} />
              ) : (
                <Clock3 size={17} />
              )}

              {readyForMatching ? "Ready for matching" : "Not ready for matching"}
            </div>
          </div>
        </section>


        {/* PROFILE INFORMATION */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            value={
              employee?.years_experience != null
                ? `${employee.years_experience} years`
                : "Not provided"
            }
          />

          <InfoCard
            icon={Brain}
            title="Career Break"
            value={employee?.has_career_break ? "Yes" : "No"}
          />
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
              {isConfirmed ? "Review skills" : "Confirm your skills"}
              <ArrowRight size={16} />
            </Link>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Responsible AI
                </h3>

                <p className="text-sm text-slate-500">
                  Skills are presented for employee review and confirmation
                  before matching readiness is enabled.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
