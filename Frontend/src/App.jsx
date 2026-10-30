import { Routes, Route, Navigate } from "react-router-dom"

import LoginPage from "./pages/LoginPage"
import Dashboard from "./pages/Dashboard"
import SkillsPage from "./pages/SkillsPage"

export default function App() {

  return (
    <Routes>

      <Route
        path="/"
        element={<LoginPage />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/skills"
        element={<SkillsPage />}
      />

      {/* Future pages */}

      <Route
        path="/matching"
        element={
          <ComingSoon title="Role Matching" />
        }
      />

      <Route
        path="/bias-audit"
        element={
          <ComingSoon title="Fairness Review" />
        }
      />

      <Route
        path="/learning"
        element={
          <ComingSoon title="Learning Path" />
        }
      />

      <Route
        path="/audit"
        element={
          <ComingSoon title="Audit Log" />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  )
}


function ComingSoon({ title }) {

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">

      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0a6ed1]">
          ✦
        </div>

        <h1 className="mt-5 text-xl font-semibold text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          This section will be implemented in the next stage.
        </p>

      </div>

    </div>
  )
}