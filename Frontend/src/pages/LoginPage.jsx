import { useState } from "react"
import { useNavigate } from "react-router-dom"


function LoginPage() {
  const navigate = useNavigate()

  const [activeUser, setActiveUser] = useState("employee")

  const [employeeId, setEmployeeId] = useState("emp-ananya")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")


  function handleSubmit(event) {
    event.preventDefault()

    const user = {
      role: activeUser,
      username:
        username ||
        (activeUser === "employee"
          ? "Ananya Rao"
          : "HR Business Partner"),
      employeeId:
        activeUser === "employee"
          ? employeeId || "emp-ananya"
          : null,
    }

    sessionStorage.setItem(
      "itn_user",
      JSON.stringify(user)
    )

    navigate("/dashboard")
  }


  return (
    <div className="min-h-screen bg-slate-50">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRANDING */}
        <div className="hidden bg-slate-900 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-900">
                SAP
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Inclusive Talent Navigator
                </p>

                <p className="text-xs text-slate-400">
                  SAP Hackfest 2026
                </p>
              </div>

            </div>

          </div>


          <div className="max-w-xl">

            <p className="text-sm font-medium text-slate-400">
              Inclusive Workforce
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Make skills visible.
              <br />
              Make opportunities fair.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              An AI-assisted talent platform that helps employees
              surface their skills, explore internal opportunities,
              and keep people involved in important decisions.
            </p>

          </div>


          <div className="text-xs text-slate-500">
            Agents recommend. Humans decide.
          </div>

        </div>


        {/* LOGIN */}
        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}
            <div className="mb-10 lg:hidden">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                  SAP
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-900">
                    Inclusive Talent Navigator
                  </p>

                  <p className="text-xs text-slate-500">
                    SAP Hackfest 2026
                  </p>

                </div>

              </div>

            </div>


            <div className="mb-8">

              <p className="text-sm font-medium text-slate-500">
                Welcome
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Sign in to your workspace
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Select your role to continue to the prototype.
              </p>

            </div>


            {/* ROLE SELECTOR */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">

              <button
                type="button"
                onClick={() => setActiveUser("employee")}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  activeUser === "employee"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Employee
              </button>

              <button
                type="button"
                onClick={() => setActiveUser("hr")}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  activeUser === "hr"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                HR Partner
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {activeUser === "employee" && (
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Employee ID
                  </label>

                  <input
                    type="text"
                    value={employeeId}
                    onChange={(event) =>
                      setEmployeeId(event.target.value)
                    }
                    placeholder="emp-ananya"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />

                </div>
              )}


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder={
                    activeUser === "employee"
                      ? "Ananya Rao"
                      : "HR Business Partner"
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

              </div>


              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue to workspace
              </button>

            </form>


            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Prototype access. Authentication will be connected
              to the final identity layer later.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}


export default LoginPage