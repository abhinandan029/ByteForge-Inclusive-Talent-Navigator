import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {

  const navigate = useNavigate()

  const [userType, setUserType] = useState("employee")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (userType === "employee") {
      navigate("/dashboard")
    } else {
      alert("HR workspace will be implemented later.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left visual */}

        <div className="relative hidden overflow-hidden lg:flex">

          <div className="absolute inset-0 bg-gradient-to-br from-[#075eac] via-[#0a6ed1] to-[#084b8a]" />

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-[30rem] w-[30rem] rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white backdrop-blur">
                IT
              </div>

              <div>
                <p className="font-semibold text-white">
                  Inclusive Talent
                </p>

                <p className="text-xs text-blue-100">
                  Navigator
                </p>
              </div>

            </div>


            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Inclusive Workforce
              </div>

              <h1 className="text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Make your skills visible.
                <span className="text-blue-200">
                  {" "}Own your career journey.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-6 text-blue-100 xl:text-base">
                A skills-first talent experience that helps employees
                discover their strengths and make their capabilities
                visible across the organization.
              </p>

            </div>


            <div className="flex items-center gap-3 text-xs text-blue-100">
              <span>AI-assisted</span>
              <span className="h-1 w-1 rounded-full bg-blue-300" />
              <span>Human confirmed</span>
              <span className="h-1 w-1 rounded-full bg-blue-300" />
              <span>Skills-first</span>
            </div>

          </div>

        </div>


        {/* Login */}

        <div className="flex items-center justify-center bg-slate-50 px-6 py-10">

          <div className="w-full max-w-md">

            <div className="mb-8 lg:hidden">

              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a6ed1] text-xs font-bold text-white">
                IT
              </div>

              <h1 className="text-2xl font-semibold text-slate-900">
                Inclusive Talent Navigator
              </h1>

            </div>


            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

              <div className="mb-8">

                <p className="text-xs font-semibold uppercase tracking-wider text-[#0a6ed1]">
                  Welcome back
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Sign in to your workspace
                </h2>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Continue your inclusive talent journey.
                </p>

              </div>


              <form onSubmit={handleSubmit}>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  I am signing in as
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setUserType("employee")}
                    className={`rounded-xl border p-4 text-left transition ${
                      userType === "employee"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >

                    <div className="mb-2 text-lg">
                      👤
                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      Employee
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Explore your skills
                    </p>

                  </button>


                  <button
                    type="button"
                    onClick={() => setUserType("hr")}
                    className={`rounded-xl border p-4 text-left transition ${
                      userType === "hr"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >

                    <div className="mb-2 text-lg">
                      ◈
                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      HR Partner
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Review talent signals
                    </p>

                  </button>

                </div>


                <div className="mt-6 space-y-4">

                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      {userType === "employee"
                        ? "Employee ID"
                        : "HR ID"}
                    </label>

                    <input
                      required
                      type="text"
                      placeholder={
                        userType === "employee"
                          ? "e.g. EMP-1024"
                          : "Enter your HR ID"
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />

                  </div>


                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Password
                    </label>

                    <input
                      required
                      type="password"
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />

                  </div>

                </div>


                <button
                  type="submit"
                  className="mt-6 w-full rounded-lg bg-[#0a6ed1] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#085caf] active:scale-[0.99]"
                >
                  Sign in
                </button>

              </form>


              <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="h-px flex-1 bg-slate-100" />
                Demo environment
                <span className="h-px flex-1 bg-slate-100" />
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}