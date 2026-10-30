import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Header from "../components/Header"
import Sidebar from "../components/Sidebar"

import {
  getEmployeeSkills,
  extractSkills,
  confirmSkills,
} from "../services/skillsApi"

export default function SkillsPage() {
  const navigate = useNavigate()

  const [employeeId, setEmployeeId] = useState("emp-ananya")
  const [skills, setSkills] = useState([])
  const [confirmed, setConfirmed] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [newSkill, setNewSkill] = useState("")

  const profileText = `
Ananya Rao, 28, Software Engineer returning from a 14-month caregiving break.
Previously built microservices in Python and FastAPI, deployed containerized apps
on Docker, and optimized PostgreSQL queries. Recently completed a cloud course
on SAP BTP.
`

  // --------------------------------------------------
  // Get employee ID from login session
  // --------------------------------------------------

  useEffect(() => {
    const storedUser = sessionStorage.getItem("itn_user")

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)

        if (user.employeeId) {
          setEmployeeId(user.employeeId)
        }
      } catch {
        // Keep default employee ID
      }
    }
  }, [])

  // --------------------------------------------------
  // Load skills
  // --------------------------------------------------

  useEffect(() => {
    async function loadSkills() {
      try {
        setLoading(true)
        setError("")

        const data = await getEmployeeSkills(employeeId)

        console.log("GET skills response:", data)

        // Backend returns:
        // extracted_skills_draft
        // confirmed_skills_final
        // is_confirmed

        let backendSkills = data.extracted_skills_draft || []

        const confirmedSkills =
          data.confirmed_skills_final || []

        // ------------------------------------------------
        // If confirmed skills exist, display those
        // ------------------------------------------------

        if (
          data.is_confirmed &&
          confirmedSkills.length > 0
        ) {
          backendSkills = confirmedSkills.map(
            (skill, index) => ({
              id: `confirmed-${index}`,
              name: skill.name,
              category:
                skill.taxonomy_category || "General",
              evidence:
                skill.evidence_snippet ||
                "Confirmed by employee",
            })
          )

          setConfirmed(true)
        } else {
          // ------------------------------------------------
          // Otherwise display extracted draft skills
          // ------------------------------------------------

          backendSkills = backendSkills.map(
            (skill, index) => ({
              id:
                skill.skill_id ||
                `skill-${index}`,
              name: skill.name,
              category:
                skill.taxonomy_category || "General",
              evidence:
                skill.evidence_snippet || "",
            })
          )

          setConfirmed(false)
        }

        // ------------------------------------------------
        // If backend has no extracted skills yet,
        // run extraction from frontend.
        // ------------------------------------------------

        if (
          backendSkills.length === 0 &&
          !data.is_confirmed
        ) {
          const extractionResult =
            await extractSkills({
              employee_id: employeeId,
              profile_text: profileText,
            })

          console.log(
            "POST extract response:",
            extractionResult
          )

          const extracted =
            extractionResult.extracted_skills || []

          backendSkills = extracted.map(
            (skill, index) => ({
              id:
                skill.skill_id ||
                `skill-${index}`,
              name: skill.name,
              category:
                skill.taxonomy_category || "General",
              evidence:
                skill.evidence_snippet || "",
            })
          )
        }

        setSkills(backendSkills)
      } catch (err) {
        console.error("Skills page error:", err)

        setError(
          err.message ||
            "Unable to load your skills."
        )
      } finally {
        setLoading(false)
      }
    }

    loadSkills()
  }, [employeeId])

  // --------------------------------------------------
  // Add skill
  // --------------------------------------------------

  function handleAddSkill() {
    const trimmedSkill = newSkill.trim()

    if (!trimmedSkill) {
      return
    }

    const exists = skills.some(
      (skill) =>
        skill.name.toLowerCase() ===
        trimmedSkill.toLowerCase()
    )

    if (exists) {
      alert("This skill already exists.")
      return
    }

    setSkills((previous) => [
      ...previous,
      {
        id: `manual-${Date.now()}`,
        name: trimmedSkill,
        category: "General",
        evidence: "Added manually by employee",
      },
    ])

    setNewSkill("")
    setConfirmed(false)
  }

  // --------------------------------------------------
  // Remove skill
  // --------------------------------------------------

  function handleRemoveSkill(skillId) {
    setSkills((previous) =>
      previous.filter(
        (skill) => skill.id !== skillId
      )
    )

    setConfirmed(false)
  }

  // --------------------------------------------------
  // Confirm skills
  // --------------------------------------------------

  async function handleConfirmSkills() {
    if (skills.length === 0) {
      alert(
        "Please add at least one skill before confirming."
      )
      return
    }

    try {
      setSaving(true)
      setError("")

      // IMPORTANT:
      // Backend expects "confirmed_skills"

      const payload = {
        employee_id: employeeId,

        confirmed_skills: skills.map(
          (skill) => ({
            name: skill.name,
            taxonomy_category:
              skill.category || "General",
            evidence_snippet:
              skill.evidence ||
              "Confirmed/Added by employee",
          })
        ),
      }

      console.log(
        "Confirm skills payload:",
        payload
      )

      const result =
        await confirmSkills(payload)

      console.log(
        "POST confirm response:",
        result
      )

      setConfirmed(true)
    } catch (err) {
      console.error(
        "Confirm skills error:",
        err
      )

      setError(
        err.message ||
          "Unable to confirm skills."
      )
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <div className="flex">
          <Sidebar />

          <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

              <p className="text-sm font-medium text-slate-600">
                Loading your skill profile...
              </p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // Main page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-9">

            {/* Breadcrumb */}

            <div className="mb-6 flex items-center gap-2 text-sm">
              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="text-slate-500 hover:text-slate-900"
              >
                Dashboard
              </button>

              <span className="text-slate-400">
                /
              </span>

              <span className="font-medium text-slate-900">
                Skills Discovery
              </span>
            </div>

            {/* Header */}

            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Step 01 · Skills Discovery
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Your Skill Profile
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Review the skills identified from your
                professional profile and confirm the
                skills you want to use for role matching.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Employee */}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Employee
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    Ananya Rao
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Software Engineer · {employeeId}
                  </p>
                </div>

                <div
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    confirmed
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {confirmed
                    ? "Skills Confirmed"
                    : "Awaiting Confirmation"}
                </div>
              </div>
            </div>

            {/* Skills card */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Identified Skills
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {skills.length} skills identified
                </p>
              </div>

              {/* Skills */}

              <div className="divide-y divide-slate-100">

                {skills.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="font-medium text-slate-700">
                      No skills found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      No skills are currently available
                      for this employee.
                    </p>
                  </div>
                ) : (
                  skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-slate-900">
                            {skill.name}
                          </h3>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {skill.category}
                          </span>

                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          <span className="font-medium text-slate-700">
                            Evidence:
                          </span>{" "}
                          {skill.evidence}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleRemoveSkill(
                            skill.id
                          )
                        }
                        className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add */}

              <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">

                <p className="mb-3 text-sm font-semibold text-slate-800">
                  Add a skill
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <input
                    type="text"
                    value={newSkill}
                    onChange={(event) =>
                      setNewSkill(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        handleAddSkill()
                      }
                    }}
                    placeholder="e.g. Git, React, SQL"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <button
                    onClick={handleAddSkill}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Add Skill
                  </button>

                </div>
              </div>

              {/* Actions */}

              <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Human confirmation required
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Skills are only used for matching
                    after employee confirmation.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <button
                    onClick={() =>
                      navigate("/dashboard")
                    }
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>

                  <button
                    onClick={
                      handleConfirmSkills
                    }
                    disabled={
                      saving ||
                      skills.length === 0 ||
                      confirmed
                    }
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Confirming..."
                      : confirmed
                        ? "Skills Confirmed"
                        : "Confirm Skills"}
                  </button>

                  <button
                    onClick={() =>
                      navigate("/matching")
                    }
                    disabled={!confirmed}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue to Matching →
                  </button>

                </div>
              </div>
            </div>

            {/* Responsible AI */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Responsible AI
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    AI identifies potential skills, but the
                    employee remains in control of which
                    skills are confirmed before matching.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}