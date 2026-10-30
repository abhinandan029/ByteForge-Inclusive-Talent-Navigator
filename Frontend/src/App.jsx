import { Routes, Route } from "react-router-dom"

import LoginPage from "./pages/LoginPage.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import SkillsPage from "./pages/SkillsPage.jsx"


function PlaceholderPage({ title, description }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Inclusive Talent Navigator
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}


function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/"
        element={<LoginPage />}
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      {/* SKILLS */}
      <Route
        path="/skills"
        element={<SkillsPage />}
      />

      {/* FUTURE MODULES */}
      <Route
        path="/matching"
        element={
          <PlaceholderPage
            title="Role Matching"
            description="Recommended internal roles will appear here after employee skill confirmation."
          />
        }
      />

      <Route
        path="/bias-audit"
        element={
          <PlaceholderPage
            title="Fairness Review"
            description="Fairness signals and human review will be implemented in the next stage."
          />
        }
      />

      <Route
        path="/learning"
        element={
          <PlaceholderPage
            title="Learning Path"
            description="Recommended learning opportunities will appear here."
          />
        }
      />

      <Route
        path="/audit-log"
        element={
          <PlaceholderPage
            title="Audit Log"
            description="The audit trail for AI actions and employee confirmations will appear here."
          />
        }
      />

    </Routes>
  )
}

export default App