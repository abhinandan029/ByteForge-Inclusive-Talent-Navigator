import { useNavigate } from "react-router-dom"

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

      <div className="flex h-16 items-center justify-between px-6 lg:px-8">

        {/* Logo */}

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a6ed1]">
            <span className="text-sm font-bold text-white">
              IT
            </span>
          </div>

          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Inclusive Talent Navigator
            </h1>

            <p className="text-[11px] text-slate-500">
              Inclusive Workforce
            </p>
          </div>

        </div>


        {/* Right */}

        <div className="flex items-center gap-4">

          <button
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            title="Notifications"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 17h5l-1.5-2V10a6.5 6.5 0 10-13 0v5L4 17h5m6 0a3 3 0 01-6 0"
              />
            </svg>

            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>


          <div className="h-7 w-px bg-slate-200" />


          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              AR
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-800">
                Ananya Rao
              </p>

              <p className="text-xs text-slate-500">
                Employee
              </p>
            </div>

          </div>


          <button
            onClick={() => navigate("/")}
            className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:block"
          >
            Sign out
          </button>

        </div>

      </div>

    </header>
  )
}