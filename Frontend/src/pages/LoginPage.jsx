import { useState } from "react"

export default function LoginPage() {
  const users = [
    { label: "Employee", id: "employee" },
    { label: "HR Business Partner", id: "HR" }
  ]

  const [activeUser, setActiveUser] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    // Navigation will be connected later
    // after we build App.jsx
    console.log("Login as:", activeUser)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                IT
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            Inclusive Talent Navigator
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Inclusive Workforce • SAP Hackfest 2026
          </p>

        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8"
        >

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Welcome back
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Select your role to continue
            </p>
          </div>

          {/* User Type */}
          <div className="mb-6">

            <label className="block text-sm font-medium text-slate-700 mb-3">
              Login as
            </label>

            <div className="grid grid-cols-2 gap-3">

              {users.map((user) => (
                <label
                  key={user.id}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    activeUser === user.id
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <input
                      type="radio"
                      name="userType"
                      value={user.id}
                      checked={activeUser === user.id}
                      onChange={(e) => setActiveUser(e.target.value)}
                      className="accent-blue-600"
                      required
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {user.label}
                    </span>

                  </div>

                </label>
              ))}

            </div>

          </div>

          {/* Employee Login */}
          {activeUser === "employee" && (
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Employee ID or Username
                </label>

                <input
                  type="text"
                  placeholder="Enter employee ID"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

            </div>
          )}

          {/* HR Login */}
          {activeUser === "HR" && (
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Admin ID or Username
                </label>

                <input
                  type="text"
                  placeholder="Enter admin ID"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

            </div>
          )}

          {/* Submit */}
          {activeUser && (
            <button
              type="submit"
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Sign in
            </button>
          )}

          {/* Footer */}
          <p className="text-xs text-slate-400 text-center mt-6">
            Prototype • Synthetic data only
          </p>

        </form>

      </div>

    </div>
  )
}