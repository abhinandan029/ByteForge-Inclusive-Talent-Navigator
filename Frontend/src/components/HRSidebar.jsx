
import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "/hr/dashboard",
    icon: "▦",
  },
  {
    name: "Job Roles",
    path: "/hr/jobs",
    icon: "▣",
  },
  {
    name: "Talent Matching",
    path: "/hr/matching",
    icon: "⇄",
  },
  {
    name: "Bias Audit",
    path: "/hr/bias-audit",
    icon: "◈",
  },
  {
    name: "Audit Log",
    path: "/hr/audit-log",
    icon: "≡",
  },
];

function HRSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="p-5">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          HR Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <span className="w-5 text-center text-base">
                {item.icon}
              </span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default HRSidebar;
