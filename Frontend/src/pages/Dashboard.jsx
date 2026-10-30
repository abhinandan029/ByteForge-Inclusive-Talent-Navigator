import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Header from "../components/Header.jsx"
import Sidebar from "../components/Sidebar.jsx"
import { getEmployeeSkills } from "../services/skillsApi.js"


function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const storedUser = sessionStorage.getItem("itn_user")

    if (!storedUser) {
      navigate("/")
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)

      setUser(parsedUser)

      const employeeId =
        parsedUser.employeeId || "emp-ananya"

      loadDashboard(employeeId)
    } catch (err) {
      console.error("Invalid session:", err)

      sessionStorage.removeItem("itn_user")
      navigate("/")
    }
  }, [navigate])


  async function loadDashboard(employeeId) {
    try {
      setLoading(true)
      setError("")

      const data = await getEmployeeSkills(employeeId)

      console.log("Skills state received:", data)

      const employeeData =
        data?.employee ||
        data?.employee_data ||
        data?.employee_profile ||
        data?.profile ||
        null

      const draftSkills =
        data?.draft_skills ||
        data?.extracted_skills ||
        data?.extractedSkills ||
        []

      const confirmedSkills =
        data?.confirmed_skills ||
        data?.confirmedSkills ||
        []

      const directEmployee =
        data?.employee_id ||
        data?.full_name ||
        data?.current_role
          ? data
          : null

      setEmployee(employeeData || directEmployee)

      if (confirmedSkills.length > 0) {
        setSkills(confirmedSkills)
      } else {
        setSkills(draftSkills)
      }

    } catch (err) {
      console.error("Dashboard error:", err)

      setError(
        err.message || "Unable to load employee dashboard."
      )
    } finally {
      setLoading(false)
    }
  }


  function handleLogout() {
    sessionStorage.removeItem("itn_user")
    navigate("/")
  }


  function getSkillName(skill) {
    if (typeof skill === "string") {
      return skill
    }

    return (
      skill?.name ||
      skill?.skill_name ||
      skill?.NAME ||
      "Unnamed skill"
    )
  }


  function getSkillCategory(skill) {
    if (typeof skill === "string") {
      return "General"
    }

    return (
      skill?.taxonomy_category ||
      skill?.category ||
      skill?.TAXONOMY_CATEGORY ||
      "General"
    )
  }


  const employeeName =
    employee?.full_name ||
    employee?.FULL_NAME ||
    employee?.name ||
    "Ananya Rao"

  const employeeRole =
    employee?.current_role ||
    employee?.CURRENT_ROLE ||
    employee?.role ||
    "Software Engineer"

  const employeeGrade =
    employee?.grade ||
    employee?.GRADE ||
    "G4"

  const yearsExperience =
    employee?.years_experience ??
    employee?.YEARS_EXPERIENCE ??
    4

  const hasCareerBreak =
    employee?.has_career_break ??
    employee?.HAS_CAREER_BREAK ??
    true

  const employeeId =
    employee?.employee_id ||
    employee?.EMPLOYEE_ID ||
    user?.employeeId ||
    "emp-ananya"

  const confirmed =
    employee?.is_confirmed ??
    employee?.IS_CONFIRMED ??
    false

  const readyForMatching =
    employee?.ready_for_matching ??
    employee?.READY_FOR_MATCHING ??
    false


  return (
    <div className="min-h-screen bg-slate-50">

      <Header />

      <div className="flex">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

            {/* HEADER */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Employee Dashboard
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  Welcome back, {employeeName.split(" ")[0]}
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                  Your inclusive talent journey starts here.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-fit rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Sign out
              </button>

            </div>


            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* LOADING */}
            {loading ? (
              <div className="space-y-6">

                <div className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />

                <div className="grid gap-6 lg:grid-cols-3">

                  <div className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />

                  <div className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />

                  <div className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />

                </div>

              </div>
            ) : (
              <>

                {/* EMPLOYEE PROFILE */}
                <section className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

                  <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                      <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                          {employeeName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>

                          <h2 className="text-xl font-semibold text-slate-900">
                            {employeeName}
                          </h2>

                          <p className="mt-1 text-sm text-slate-600">
                            {employeeRole} · Grade {employeeGrade}
                          </p>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {employeeId}
                        </span>

                        {hasCareerBreak && (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            Career break recorded
                          </span>
                        )}

                      </div>

                    </div>

                  </div>


                  <div className="grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">

                    <ProfileStat
                      label="Experience"
                      value={`${yearsExperience} years`}
                    />

                    <ProfileStat
                      label="Skills identified"
                      value={skills.length}
                    />

                    <ProfileStat
                      label="Skills status"
                      value={
                        confirmed
                          ? "Confirmed"
                          : "Awaiting confirmation"
                      }
                    />

                  </div>

                </section>


                {/* TALENT JOURNEY */}
                <section className="mb-8">

                  <div className="mb-4">

                    <h2 className="text-xl font-semibold text-slate-900">
                      Your talent journey
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      Review each stage and confirm information before moving forward.
                    </p>

                  </div>


                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                    <JourneyCard
                      number="01"
                      title="Skills Discovery"
                      description="Review skills identified from your profile and confirm what represents you."
                      status={
                        confirmed
                          ? "Completed"
                          : "Action required"
                      }
                      statusType={
                        confirmed
                          ? "success"
                          : "warning"
                      }
                      buttonText="Review skills"
                      onClick={() => navigate("/skills")}
                    />


                    <JourneyCard
                      number="02"
                      title="Role Matching"
                      description="Explore internal opportunities based on your confirmed skills."
                      status={
                        readyForMatching
                          ? "Ready"
                          : confirmed
                            ? "Next step"
                            : "Locked"
                      }
                      statusType={
                        readyForMatching
                          ? "success"
                          : confirmed
                            ? "info"
                            : "neutral"
                      }
                      buttonText="View matching"
                      onClick={() => navigate("/matching")}
                      disabled={!confirmed}
                    />


                    <JourneyCard
                      number="03"
                      title="Fairness Review"
                      description="Review criteria signals that may need additional human review."
                      status="Human review"
                      statusType="info"
                      buttonText="View review"
                      onClick={() => navigate("/bias-audit")}
                    />


                    <JourneyCard
                      number="04"
                      title="Learning Path"
                      description="Discover learning opportunities aligned with your career direction."
                      status="Upcoming"
                      statusType="neutral"
                      buttonText="View learning"
                      onClick={() => navigate("/learning")}
                    />

                  </div>

                </section>


                {/* SKILLS + STATUS */}
                <div className="grid gap-6 lg:grid-cols-3">

                  {/* SKILLS */}
                  <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          Skills snapshot
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                          Skills currently available in your talent profile.
                        </p>
                      </div>

                      <button
                        onClick={() => navigate("/skills")}
                        className="shrink-0 text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600"
                      >
                        Review
                      </button>

                    </div>


                    {skills.length === 0 ? (
                      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">

                        <p className="text-sm font-medium text-slate-700">
                          No skills have been identified yet.
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Open Skills Discovery to extract and review your skills.
                        </p>

                      </div>
                    ) : (
                      <div className="mt-6 flex flex-wrap gap-3">

                        {skills.slice(0, 12).map((skill, index) => (
                          <div
                            key={`${getSkillName(skill)}-${index}`}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >

                            <p className="text-sm font-medium text-slate-900">
                              {getSkillName(skill)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {getSkillCategory(skill)}
                            </p>

                          </div>
                        ))}

                      </div>
                    )}

                  </section>


                  {/* PROFILE STATUS */}
                  <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

                    <h2 className="text-lg font-semibold text-slate-900">
                      Profile status
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      Current progress in your talent journey.
                    </p>

                    <div className="mt-6 space-y-5">

                      <StatusRow
                        label="AI skill discovery"
                        completed={skills.length > 0}
                      />

                      <StatusRow
                        label="Employee confirmation"
                        completed={confirmed}
                      />

                      <StatusRow
                        label="Ready for matching"
                        completed={readyForMatching}
                      />

                      <StatusRow
                        label="Learning pathway"
                        completed={false}
                      />

                    </div>

                  </section>

                </div>


                {/* RESPONSIBLE AI */}
                <section className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div className="max-w-3xl">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                          <span className="text-xs font-semibold">
                            AI
                          </span>
                        </div>

                        <h2 className="text-lg font-semibold">
                          Responsible AI by design
                        </h2>

                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        AI recommendations support employees and HR teams
                        rather than replacing human decisions. Employees
                        confirm their skills before matching, while fairness
                        signals are presented for human review.
                      </p>

                    </div>


                    <div className="shrink-0 rounded-xl bg-white/10 px-4 py-3">

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Principle
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        Agents recommend. Humans decide.
                      </p>

                    </div>

                  </div>

                </section>


                {/* AUDIT */}
                <section className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h3 className="text-sm font-semibold text-slate-900">
                      Transparency & audit trail
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Review recorded actions related to your talent journey.
                    </p>

                  </div>

                  <button
                    onClick={() => navigate("/audit-log")}
                    className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    View audit log
                  </button>

                </section>

              </>
            )}

          </div>

        </main>

      </div>

    </div>
  )
}


/* =====================================================
   PROFILE STAT
===================================================== */

function ProfileStat({ label, value }) {
  return (
    <div className="px-6 py-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-base font-semibold text-slate-900">
        {value}
      </p>

    </div>
  )
}


/* =====================================================
   JOURNEY CARD
===================================================== */

function JourneyCard({
  number,
  title,
  description,
  status,
  statusType,
  buttonText,
  onClick,
  disabled = false,
}) {
  const statusClasses = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
    neutral: "bg-slate-100 text-slate-600",
  }

  return (
    <div
      className={`flex min-h-[260px] flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${
        disabled ? "opacity-75" : ""
      }`}
    >

      <div className="flex items-center justify-between">

        <span className="text-xs font-semibold tracking-widest text-slate-400">
          {number}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            statusClasses[statusType]
          }`}
        >
          {status}
        </span>

      </div>


      <div className="mt-6">

        <h3 className="text-lg font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>

      </div>


      <div className="mt-auto pt-6">

        <button
          onClick={onClick}
          disabled={disabled}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {buttonText}
        </button>

      </div>

    </div>
  )
}


/* =====================================================
   STATUS ROW
===================================================== */

function StatusRow({ label, completed }) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          completed
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {completed ? "✓" : "•"}
      </div>

      <div>

        <p
          className={`text-sm font-medium ${
            completed
              ? "text-slate-900"
              : "text-slate-500"
          }`}
        >
          {label}
        </p>

        <p className="text-xs text-slate-400">
          {completed ? "Completed" : "Pending"}
        </p>

      </div>

    </div>
  )
}


export default Dashboard