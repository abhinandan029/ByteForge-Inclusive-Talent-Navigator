import re

file_path = r'Frontend\src\pages\MatchingPage.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace main wrapper and header
old_pattern = re.compile(
    r'<div className="min-h-full bg-slate-50 px-5 py-8 sm:px-8">.*?{/\* HEADER \*/}.*?<\/div>\s*<\/div>',
    re.DOTALL
)

new_header = """<div className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HERO BANNER (DASHBOARD STYLE) */}
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-200">
          <div className="relative p-7 sm:p-9">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                  Internal Career Mobility
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Role Matching & Opportunities
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Internal career opportunities matched to your verified skills using our name-blind, inclusive matching algorithms.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-700">
                    <Briefcase size={25} />
                  </div>
                  <div>
                    <p className="font-semibold">{targetRole || "Matching Engine Active"}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      Inclusive Matching · Verified Skills
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition disabled:opacity-50"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-3">
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Confirmation status</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                {isConfirmed ? (
                  <CheckCircle2 size={15} className="text-emerald-400" />
                ) : (
                  <Target size={15} className="text-amber-300" />
                )}
                {isConfirmed ? "Skills Confirmed" : "Requires Confirmation"}
              </p>
            </div>
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Confirmed skills</p>
              <p className="mt-1 text-sm font-semibold">
                {confirmedSkills.length} verified skill{confirmedSkills.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="px-7 py-4">
              <p className="text-xs text-slate-400">Skill gaps addressed</p>
              <p className="mt-1 text-sm font-semibold">
                {missingSkills.length} skill gap{missingSkills.length === 1 ? "" : "s"} identified
              </p>
            </div>
          </div>
        </section>"""

content, count = old_pattern.subn(new_header, content, count=1)
print("Replaced MatchingPage header count:", count)

# Replace target role card with dashboard high-contrast style
old_role_pattern = re.compile(
    r'{\/\* MATCHED TARGET ROLE CARD \*\/}\s*\{targetRole \? \(.*?\n\s*<div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">',
    re.DOTALL
)

new_role = """{/* MATCHED TARGET ROLE CARD (DASHBOARD STYLE) */}
            {targetRole ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100">"""

content, count_role = old_role_pattern.subn(new_role, content, count=1)
print("Replaced MatchingPage role card header count:", count_role)

# Also update the inner text colors of that card to look right on indigo bg
old_inner = """                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                        Top Matched Internal Role
                      </span>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {targetRole}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Evaluated by the Opportunity Matching Agent based on your verified skills.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/learning"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <span>View Career Pathway</span>
                    <ArrowRight size={14} />
                  </Link>"""

new_inner = """                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                        Top Matched Internal Role
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-white">
                        {targetRole}
                      </h2>
                      <p className="mt-1 text-sm text-indigo-100">
                        Evaluated by the Opportunity Matching Agent based on your verified skills.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/learning"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                  >
                    <span>View Career Pathway</span>
                    <ArrowRight size={15} />
                  </Link>"""

if old_inner in content:
    content = content.replace(old_inner, new_inner, 1)
    print("Replaced inner role details: OK")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("MatchingPage updated successfully")

