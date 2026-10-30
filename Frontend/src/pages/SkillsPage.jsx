
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Header from "../components/Header"
import Sidebar from "../components/Sidebar"

import {
  getEmployee,
  getEmployeeSkills
} from "../services/skillsApi"

export default function SkillsPage() {
  const navigate = useNavigate()

  const [employee, setEmployee] = useState(null)
  const [skills, setSkills] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [newSkill, setNewSkill] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  // Fetch employee profile and skills from backend
  useEffect(() => {
    async function fetchSkillsPageData() {
      try {
        setLoading(true)
        setError("")

        const [employeeData, skillsData] = await Promise.all([
          getEmployee("EMP-1024"),
          getEmployeeSkills("EMP-1024")
        ])

        setEmployee(employeeData)
        setSkills(skillsData.skills)

      } catch (err) {
        setError(err.message || "Unable to load skill profile")
      } finally {
        setLoading(false)
      }
    }

    fetchSkillsPageData()
  }, [])

  // Add a new skill
  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim()

    if (!trimmedSkill) return

    const alreadyExists = skills.some(
      skill => skill.name.toLowerCase() === trimmedSkill.toLowerCase()
    )

    if (alreadyExists) {
      alert("This skill already exists")
      return
    }

    const newSkillData = {
      id: Date.now(),
      name: trimmedSkill,
      category: "Additional Skill",
      confidence: 100,
      evidence: "Added by employee"
    }

    setSkills(previousSkills => [...previousSkills, newSkillData])
    setNewSkill("")
    setConfirmed(false)
  }

  // Remove a skill
  const handleRemoveSkill = (skillId) => {
    setSkills(previousSkills =>
      previousSkills.filter(skill => skill.id !== skillId)
    )

    setConfirmed(false)
  }

  // Confirm skills
  const handleConfirmSkills = () => {
    if (skills.length === 0) {
      alert("Please add at least one skill before confirming")
      return
    }

    setConfirmed(true)
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading skill profile...
          </p>
        </div>
      </div>
    )
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
          <p className="text-red-600 font-medium mb-4">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top Header */}
      <Header />

      <div className="flex min-h-[calc(100vh-64px)]">

        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0">

          <div className="max-w-7xl mx-auto p-5 sm:p-7 lg:p-9">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-blue-600 font-medium">Skills</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2">
                  STEP 01 · SKILLS DISCOVERY
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Your Skill Profile
                </h1>

                <p className="text-slate-500 mt-2">
                  Review the skills identified from your professional profile.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-lg px-4 py-2.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-slate-600">
                  Skills Discovery
                </span>
              </div>
            </div>

            {/* Employee Profile */}
            {employee && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
                    {employee.name
                      .split(" ")
                      .map(word => word[0])
                      .join("")}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">
                      {employee.name}
                    </h2>

                    <p className="text-slate-500 text-sm mt-1">
                      {employee.role} · {employee.department}
                    </p>

                    <p className="text-slate-400 text-sm mt-1">
                      {employee.id} · {employee.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                    <div>
                      <p className="text-xs text-slate-400">Experience</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {employee.experience}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Career Break</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {employee.careerBreak}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Grade</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {employee.grade}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* AI Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
              <div className="text-blue-600 text-xl">✦</div>

              <div>
                <h3 className="font-semibold text-blue-900">
                  AI-assisted Skills Discovery
                </h3>

                <p className="text-sm text-blue-800 mt-1">
                  These skills are suggested based on your professional
                  profile. Please review and confirm them. You remain in
                  control of your skill profile.
                </p>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Discovered Skills
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {skills.length} skills identified
                  </p>
                </div>

                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                  Awaiting confirmation
                </span>
              </div>

              {/* Skill Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {skill.name}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          {skill.category}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="text-slate-400 hover:text-red-600 text-sm"
                        title="Remove skill"
                      >
                        Remove
                      </button>

                    </div>

                    {/* Confidence */}
                    <div className="mt-4">

                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-500">
                          AI confidence
                        </span>

                        <span className="font-semibold text-slate-700">
                          {skill.confidence}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${skill.confidence}%` }}
                        ></div>
                      </div>

                    </div>

                    {/* Evidence */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">
                        Evidence
                      </p>

                      <p className="text-sm text-slate-600">
                        {skill.evidence}
                      </p>
                    </div>

                  </div>
                ))}

              </div>

              {/* Add Skill */}
              <div className="mt-6 pt-6 border-t border-slate-200">

                <h3 className="font-semibold text-slate-800 mb-3">
                  Add another skill
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">

                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                    placeholder="Enter a skill name"
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={handleAddSkill}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
                  >
                    + Add Skill
                  </button>

                </div>
              </div>

            </div>

            {/* Human Confirmation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 text-lg">
                  ✓
                </div>

                <div className="flex-1">

                  <h2 className="font-bold text-slate-900">
                    Employee Confirmation
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Confirm that the displayed skills accurately represent
                    your professional abilities.
                  </p>

                  {confirmed && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Skills confirmed successfully.
                      </p>
                    </div>
                  )}

                </div>

              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-slate-100">

                <button
                  onClick={handleConfirmSkills}
                  disabled={confirmed}
                  className={`px-5 py-2.5 rounded-lg font-medium ${
                    confirmed
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {confirmed ? "Skills Confirmed" : "Confirm My Skills"}
                </button>

                <button
                  onClick={() => navigate("/matching")}
                  disabled={!confirmed}
                  className={`px-5 py-2.5 rounded-lg font-medium ${
                    confirmed
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Continue to Role Matching →
                </button>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
