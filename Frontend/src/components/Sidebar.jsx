import { NavLink } from "react-router-dom"

const navigation = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: "grid",
  },
  {
    name: "Skill Profile",
    path: "/skills",
    icon: "spark",
  },
  {
    name: "Role Matching",
    path: "/matching",
    icon: "target",
  },
  {
    name: "Fairness Review",
    path: "/bias-audit",
    icon: "shield",
  },
  {
    name: "Learning Path",
    path: "/learning",
    icon: "book",
  },
  {
    name: "Audit Log",
    path: "/audit",
    icon: "clock",
  },
]

function Icon({ type }) {

  const paths = {
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),

    spark: (
      <>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
        <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
      </>
    ),

    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4V2M20 12h2M12 20v2M4 12H2" />
      </>
    ),

    shield: (
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    ),

    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z" />
        <path d="M4 20.5A2.5 2.5 0 016.5 18H20" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  }

  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[type]}
    </svg>
  )
}

export default function Sidebar() {

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">

      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col">

        {/* Navigation */}

        <div className="px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            My Workspace
          </p>

          <nav className="space-y-1">

            {navigation.map((item) => (

              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-[#0a6ed1]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >

                {({ isActive }) => (
                  <>
                    <Icon type={item.icon} />

                    <span>{item.name}</span>

                    {item.path !== "/dashboard" &&
                      item.path !== "/skills" && (
                        <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                          SOON
                        </span>
                      )}
                  </>
                )}

              </NavLink>

            ))}

          </nav>

        </div>


        {/* Bottom info */}

        <div className="mt-auto p-4">

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0a6ed1] shadow-sm">
              ✦
            </div>

            <p className="text-xs font-semibold text-slate-800">
              Inclusive Talent Navigator
            </p>

            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              AI recommendations support your career journey.
              You remain in control of your profile.
            </p>

          </div>

        </div>

      </div>

    </aside>
  )
}