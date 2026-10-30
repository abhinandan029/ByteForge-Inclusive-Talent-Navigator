
import { Routes, Route } from "react-router-dom"

import Header from "./components/Header.jsx"
import Sidebar from "./components/Sidebar.jsx"

import LoginPage from "./pages/LoginPage.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import SkillsPage from "./pages/SkillsPage.jsx"


function PlaceholderPage({ title, description }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-6">
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
  )
}


function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">

      {/* FIXED HEADER */}
      <div className="z-50 h-16 shrink-0">
        <Header />
      </div>

      {/* REMAINING VIEWPORT */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* FIXED SIDEBAR */}
        <Sidebar />

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="min-h-0 w-full flex-1 overflow-y-auto lg:ml-60">

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

        </main>
      </div>
    </div>
  )
}

export default App
