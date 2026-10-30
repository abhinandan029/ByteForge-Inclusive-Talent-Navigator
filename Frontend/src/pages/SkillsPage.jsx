import { useState } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import {
  employeeData,
  extractedSkills,
} from "../data/dummyData"

export default function SkillsPage() {

  const [skills, setSkills] = useState(extractedSkills)
  const [newSkill, setNewSkill] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const removeSkill = (id) => {
    setSkills((current) =>
      current.filter((skill) => skill.id !== id)
    )
  }

  const addSkill = () => {

    const value = newSkill.trim()

    if (!value) return

    const exists = skills.some(
      (skill) =>
        skill.name.toLowerCase() === value.toLowerCase()
    )

    if (exists) {
      setNewSkill("")
      return
    }

    setSkills((current) => [
      ...current,
      {
        id: Date.now(),
        name: value,
        category: "Employee added",
        confidence: null,
        evidence: "Added by employee",
      },
    ])

    setNewSkill("")
  }

  const confirmSkills = () => {
    setConfirmed(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <Header />

      <div className="flex">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-9">

            {/* Breadcrumb */}

            <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">

              <Link
                to="/dashboard"
                className="hover:text-slate-700"
              >
                Dashboard
              </Link>

              <span>/</span>

              <span className="font-medium text-slate-600">
                Skill Profile
              </span>

            </div>


            {/* Heading */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0a6ed1]">
                    Skills Discovery
                  </span>

                  <span className="text-xs text-slate-400">
                    Step 1 of your talent journey
                  </span>

                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Your Skill Profile
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-500">
                  Review the capabilities identified from your profile.
                  You stay in control of what gets added to your
                  confirmed skill profile.
                </p>

              </div>


              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0a6ed1]">
                  ✦
                </div>

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    AI assistance
                  </p>

                  <p className="text-xs font-medium text-slate-700">
                    Recommendations require confirmation
                  </p>

                </div>

              </div>

            </div>


            {/* Employee Profile */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-lg font-semibold text-[#0a6ed1]">
                  AR
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-lg font-semibold text-slate-900">
                      {employeeData.name}
                    </h2>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                      {employeeData.id}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {employeeData.role} · {employeeData.department}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">

                    <span>
                      📍 {employeeData.location}
                    </span>

                    <span>
                      💼 {employeeData.experience}
                    </span>

                    <span>
                      Grade {employeeData.grade}
                    </span>

                  </div>

                </div>


                <div className="rounded-xl bg-slate-50 px-4 py-3">

                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Profile status
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span
                      className={`h-2 w-2 rounded-full ${
                        confirmed
                          ? "bg-emerald-500"
                          : "bg-amber-400"
                      }`}
                    />

                    <span className="text-xs font-semibold text-slate-700">
                      {confirmed
                        ? "Skills confirmed"
                        : "Awaiting confirmation"}
                    </span>

                  </div>

                </div>

              </div>

            </section>


            {/* AI section */}

            <section className="mt-6">

              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-base font-semibold text-slate-900">
                      Skills identified from your profile
                    </h2>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      {skills.length}
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Review each skill and remove anything that doesn't
                    accurately represent your current capabilities.
                  </p>

                </div>

              </div>


              {/* Skills grid */}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {skills.map((skill) => (

                  <div
                    key={skill.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-[#0a6ed1]">
                        {skill.name.charAt(0)}
                      </div>

                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      >
                        Remove
                      </button>

                    </div>


                    <div className="mt-4">

                      <div className="flex items-center justify-between gap-2">

                        <h3 className="font-semibold text-slate-800">
                          {skill.name}
                        </h3>

                        <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-medium text-slate-400">
                          {skill.category}
                        </span>

                      </div>

                      <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                        {skill.evidence}
                      </p>

                    </div>


                    {skill.confidence !== null ? (

                      <div className="mt-5">

                        <div className="mb-2 flex items-center justify-between">

                          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            AI confidence
                          </span>

                          <span className="text-xs font-semibold text-slate-700">
                            {skill.confidence}%
                          </span>

                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-[#0a6ed1]"
                            style={{
                              width: `${skill.confidence}%`,
                            }}
                          />

                        </div>

                      </div>

                    ) : (

                      <div className="mt-5 rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-medium text-emerald-700">
                        ✓ Added by you
                      </div>

                    )}

                  </div>

                ))}


                {/* Add skill card */}

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    +
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    Add another skill
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add a capability that isn't currently shown.
                  </p>


                  <div className="mt-4 flex gap-2">

                    <input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addSkill()
                      }}
                      placeholder="e.g. Docker"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      onClick={addSkill}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                      Add
                    </button>

                  </div>

                </div>

              </div>

            </section>


            {/* Human confirmation */}

            <section className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">

              <div className="h-1 bg-[#0a6ed1]" />

              <div className="p-6 lg:p-7">

                <div className="flex flex-col gap-5 sm:flex-row">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0a6ed1]">
                    ✓
                  </div>

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-base font-semibold text-slate-900">
                        Your confirmation
                      </h2>

                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                        HUMAN CHECK
                      </span>

                    </div>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      AI has suggested these skills based on your
                      profile. Please review them before continuing.
                      You can remove skills that aren't accurate or
                      add skills that are missing.
                    </p>


                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">

                      {!confirmed ? (

                        <button
                          onClick={confirmSkills}
                          className="rounded-lg bg-[#0a6ed1] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#085caf] active:scale-[0.99]"
                        >
                          Confirm my skills
                        </button>

                      ) : (

                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                          <span>✓</span>
                          Skills confirmed
                        </div>

                      )}

                      <span className="text-[11px] text-slate-400">
                        {skills.length} skills in your profile
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </section>


            {/* Next step */}

            <div className="mt-5 flex justify-end">

              <button
                disabled={!confirmed}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                  confirmed
                    ? "bg-slate-900 text-white hover:bg-slate-700"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                Continue to Role Matching →
              </button>

            </div>

          </div>

        </main>

      </div>

    </div>
  )
}