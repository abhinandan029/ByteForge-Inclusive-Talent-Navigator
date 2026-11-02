
import { useLocation, useNavigate } from "react-router-dom"

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { label: "Dashboard", path: "/dashboard", icon: "▦" },
    { label: "Skills Discovery", path: "/skills", icon: "✦" },
    { label: "Role Matching", path: "/matching", icon: "↔" },
    { label: "Learning Path", path: "/learning", icon: "◇" },
    { label: "Audit Log", path: "/audit-log", icon: "≡" },
  ]

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-60 shrink-0 flex-col border-r border-slate-200 bg-white">

      {/* SIDEBAR HEADER */}
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Talent Navigator
        </p>

        <p className="mt-1 text-sm font-medium text-slate-700">
          Employee Workspace
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item.path)

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-sm ${
                    active
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

    </aside>
  )
}

export default Sidebar
