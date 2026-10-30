import { useLocation, useNavigate } from "react-router-dom"

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      label: "Skills Discovery",
      path: "/skills",
      icon: "✦",
    },
    {
      label: "Role Matching",
      path: "/matching",
      icon: "↔",
    },
    {
      label: "Fairness Review",
      path: "/bias-audit",
      icon: "✓",
    },
    {
      label: "Learning Path",
      path: "/learning",
      icon: "◇",
    },
    {
      label: "Audit Log",
      path: "/audit-log",
      icon: "≡",
    },
  ]

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">

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
        <nav className="flex-1 px-3 py-5">
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

        {/* RESPONSIBLE AI */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">
              Responsible AI
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              AI provides recommendations and signals. People remain
              responsible for final decisions.
            </p>
          </div>
        </div>

      </div>
    </aside>
  )
}

export default Sidebar