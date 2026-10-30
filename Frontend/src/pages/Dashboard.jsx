import { Link } from "react-router-dom"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { employeeData, extractedSkills } from "../data/dummyData"

export default function Dashboard() {

  return (
    <div className="min-h-screen bg-slate-50">

      <Header />

      <div className="flex">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-9">

            {/* Welcome */}

            <div className="mb-8">

              <p className="text-xs font-semibold uppercase tracking-wider text-[#0a6ed1]">
                Employee Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, Ananya
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Build a clear, skills-first view of your career profile.
              </p>

            </div>


            {/* Profile + Progress */}

            <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-lg font-semibold text-[#0a6ed1]">
                    AR
                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-lg font-semibold text-slate-900">
                        {employeeData.name}
                      </h2>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                        ACTIVE
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {employeeData.role} · {employeeData.department}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>{employeeData.id}</span>
                      <span>{employeeData.location}</span>
                      <span>{employeeData.experience}</span>
                    </div>

                  </div>

                </div>

              </div>


              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Profile completion
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      40%
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-blue-100 text-xs font-semibold text-[#0a6ed1]">
                    40%
                  </div>

                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[40%] rounded-full bg-[#0a6ed1]" />
                </div>

                <p className="mt-3 text-[11px] text-slate-400">
                  Confirm your skills to continue building your profile.
                </p>

              </div>

            </div>


            {/* Main action */}

            <div className="mt-6">

              <Link
                to="/skills"
                className="group block overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >

                <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-7">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0a6ed1] text-white shadow-sm">
                      ✦
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-base font-semibold text-slate-900">
                          Complete your Skill Profile
                        </h2>

                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-[#0a6ed1]">
                          NEXT STEP
                        </span>

                      </div>

                      <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-500">
                        Review the skills identified from your profile,
                        remove anything inaccurate, and add skills that
                        represent your current capabilities.
                      </p>

                    </div>

                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0a6ed1]">
                    Review skills
                    <span className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                </div>

              </Link>

            </div>


            {/* Modules */}

            <div className="mt-8">

              <div className="mb-4">

                <h2 className="text-base font-semibold text-slate-900">
                  Your Talent Journey
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Progress through each stage of your profile.
                </p>

              </div>


              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <JourneyCard
                  number="01"
                  title="Skill Profile"
                  description="Discover and confirm your capabilities."
                  status="Available"
                  active
                />

                <JourneyCard
                  number="02"
                  title="Role Matching"
                  description="Find opportunities aligned with your skills."
                  status="Coming soon"
                />

                <JourneyCard
                  number="03"
                  title="Fairness Review"
                  description="Surface criteria that may need human review."
                  status="Coming soon"
                />

                <JourneyCard
                  number="04"
                  title="Learning Path"
                  description="Explore learning aligned with your goals."
                  status="Coming soon"
                />

              </div>

            </div>


            {/* Skill preview */}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Current skill snapshot
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    AI-discovered skills awaiting your confirmation.
                  </p>
                </div>

                <Link
                  to="/skills"
                  className="text-xs font-semibold text-[#0a6ed1] hover:underline"
                >
                  View all
                </Link>

              </div>


              <div className="mt-5 flex flex-wrap gap-2">

                {extractedSkills.slice(0, 6).map((skill) => (

                  <span
                    key={skill.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    {skill.name}
                  </span>

                ))}

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  )
}


function JourneyCard({
  number,
  title,
  description,
  status,
  active = false,
}) {

  return (
    <div
      className={`rounded-2xl border p-5 ${
        active
          ? "border-blue-100 bg-white shadow-sm"
          : "border-slate-200 bg-slate-50/70"
      }`}
    >

      <div className="flex items-center justify-between">

        <span
          className={`text-xs font-semibold ${
            active
              ? "text-[#0a6ed1]"
              : "text-slate-400"
          }`}
        >
          {number}
        </span>

        <span
          className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${
            active
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-200 text-slate-400"
          }`}
        >
          {status}
        </span>

      </div>

      <h3 className="mt-6 text-sm font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  )
}