
import { useEffect, useState } from "react";
import {
  Brain,
  Check,
  CheckCircle2,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getEmployeeSkills,
  extractSkills,
  confirmSkills,
} from "../services/skillsApi";

import { useAuth } from "../contexts/AuthContext";

export default function SkillsPage() {
  const { employee: user } = useAuth();

  const employeeId = user?.employee_id || "";
  const profileText =
    user?.profile_text ||
    user?.profile?.profile_text ||
    "";

  const [employee, setEmployee] = useState(null);
  const [draftSkills, setDraftSkills] = useState([]);
  const [confirmedSkills, setConfirmedSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  const [extractionSummary, setExtractionSummary] = useState(null);

  // Load the authoritative skills state from the backend.
  async function refreshSkills() {
    const data = await getEmployeeSkills(employeeId);

    setEmployee(data.employee || null);
    setDraftSkills(data.extracted_skills_draft || []);
    setConfirmedSkills(data.confirmed_skills_final || []);

    return data;
  }

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      if (!employeeId) {
        setError("Employee ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getEmployeeSkills(employeeId);

        if (!active) return;

        setEmployee(data.employee || null);
        setDraftSkills(data.extracted_skills_draft || []);
        setConfirmedSkills(data.confirmed_skills_final || []);
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load skills.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      active = false;
    };
  }, [employeeId]);

  function buildExtractionSummary(skills) {
    const matched = skills.filter(
      (skill) =>
        skill.taxonomy_category !== "Unmapped / Emerging Skill"
    );

    const unmapped = skills.filter(
      (skill) =>
        skill.taxonomy_category === "Unmapped / Emerging Skill"
    );

    const categories = {};

    skills.forEach((skill) => {
      const category = skill.taxonomy_category || "General";
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      total: skills.length,
      matched: matched.length,
      unmapped: unmapped.length,
      categories,
    };
  }

  // Extract only new, unconfirmed skills.
  async function handleExtractSkills() {
    if (!employeeId) {
      setError("Employee ID is missing. Please log in again.");
      return;
    }

    if (!profileText.trim()) {
      setError(
        "Your profile text is not available in your login data. Please make sure your employee profile contains profile_text."
      );
      return;
    }

    try {
      setExtracting(true);
      setError("");
      setSuccess("");

      const data = await extractSkills({
        employee_id: employeeId,
        profile_text: profileText,
      });

      const extracted = data.extracted_skills || [];

      // Display the newly extracted pending skills.
      setExtractionSummary(buildExtractionSummary(extracted));

      // Reload both pending and confirmed skills from HANA.
      const latestState = await refreshSkills();

      const pendingCount =
        latestState.extracted_skills_draft?.length || 0;

      setSuccess(
        pendingCount > 0
          ? `${pendingCount} skills are ready for your review. Previously confirmed skills have been preserved.`
          : "Extraction completed. No new skills are awaiting confirmation."
      );
    } catch (err) {
      setError(err.message || "Skill extraction failed.");
    } finally {
      setExtracting(false);
    }
  }

  // Add a manual skill to the review list.
  function handleAddSkill() {
    const name = newSkill.trim();

    if (!name) return;

    const normalizedName = name.toLowerCase();

    const alreadyExists = [
      ...draftSkills,
      ...confirmedSkills,
    ].some(
      (skill) =>
        skill.name?.trim().toLowerCase() === normalizedName
    );

    if (alreadyExists) {
      setError("This skill already exists in your pending or confirmed skills.");
      return;
    }

    const newItem = {
      skill_id: `manual-${Date.now()}`,
      name,
      taxonomy_category: newCategory,
      evidence_snippet: "Added by employee",
    };

    const updatedSkills = [...draftSkills, newItem];

    setDraftSkills(updatedSkills);

    if (extractionSummary) {
      setExtractionSummary(buildExtractionSummary(updatedSkills));
    }

    setNewSkill("");
    setNewCategory("General");
    setError("");
    setSuccess("Skill added. Confirm your changes to save them.");
  }

  // Remove a skill from the pending review list.
  function handleRemoveSkill(skillId) {
    const updatedSkills = draftSkills.filter(
      (skill) => skill.skill_id !== skillId
    );

    setDraftSkills(updatedSkills);

    if (extractionSummary) {
      setExtractionSummary(buildExtractionSummary(updatedSkills));
    }

    setSuccess("Skill removed from the review list.");
  }

  // Confirm pending and manually added skills.
  async function handleConfirmSkills() {
    if (!draftSkills.length) {
      setError("Add or extract at least one skill before confirming.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        employee_id: employeeId,
        confirmed_skills: draftSkills.map((skill) => ({
          name: skill.name,
          taxonomy_category: skill.taxonomy_category || "General",
          evidence_snippet: skill.evidence_snippet || "",
        })),
      };

      await confirmSkills(payload);

      // Always use the backend's saved state.
      await refreshSkills();

      setExtractionSummary(null);

      setSuccess(
        "Your skills have been confirmed successfully. Previously confirmed skills have been preserved."
      );
    } catch (err) {
      setError(err.message || "Unable to confirm skills.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-indigo-600"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading your skills...
          </p>
        </div>
      </div>
    );
  }

  if (
    error &&
    !employee &&
    !draftSkills.length &&
    !confirmedSkills.length
  ) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto text-red-600" size={32} />

        <h2 className="mt-3 font-semibold text-red-800">
          Unable to load skills
        </h2>

        <p className="mt-2 text-sm text-red-700">{error}</p>

        <Link
          to="/dashboard"
          className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isConfirmed = Boolean(employee?.is_confirmed);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-indigo-600">
                SKILLS DISCOVERY
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Review Your Skills
              </h1>

              <p className="mt-2 text-slate-500">
                Review the skills identified from your employee profile.
                You remain in control of what gets confirmed.
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-medium ${
                isConfirmed
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isConfirmed ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertCircle size={17} />
              )}

              {isConfirmed ? "Skills confirmed" : "Review pending"}
            </div>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Employee</p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            {employee?.full_name || "Employee"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {employee?.current_role || "Role not provided"}
            {" · "}
            ID: {employee?.employee_id || employeeId}
          </p>
        </section>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {success}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
                <Sparkles size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  AI Skills Extraction
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Extract skills from your employee profile. Review and edit
                  the results before confirming.
                </p>
              </div>
            </div>

            <button
              onClick={handleExtractSkills}
              disabled={extracting || saving}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {extracting ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Brain size={17} />
                  Extract Skills
                </>
              )}
            </button>
          </div>
        </section>

        {extractionSummary && (
          <section className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Skills Extraction Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overview of newly identified skills.
                </p>
              </div>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={15} />
                Completed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-indigo-50 p-4">
                <p className="text-2xl font-bold text-indigo-700">
                  {extractionSummary.total}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Skills extracted
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-2xl font-bold text-emerald-700">
                  {extractionSummary.matched}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Taxonomy matched
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-2xl font-bold text-amber-700">
                  {extractionSummary.unmapped}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Unmapped skills
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4">
                <p className="text-2xl font-bold text-purple-700">
                  {Object.keys(extractionSummary.categories).length}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Skill categories
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-4 font-semibold text-slate-800">
                Category Distribution
              </h3>

              <div className="space-y-4">
                {Object.entries(extractionSummary.categories).map(
                  ([category, count]) => {
                    const percentage =
                      extractionSummary.total > 0
                        ? (count / extractionSummary.total) * 100
                        : 0;

                    return (
                      <div key={category}>
                        <div className="mb-1.5 flex justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-700">
                            {category}
                          </span>

                          <span className="text-slate-500">
                            {count} {count === 1 ? "skill" : "skills"}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  {extractionSummary.total} skills extracted successfully!
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Review the extracted skills below. They will only be used
                  for matching after you confirm them.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Extracted Skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add or remove skills before confirming.
              </p>
            </div>

            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {draftSkills.length} skills
            </span>
          </div>

          {draftSkills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <Brain className="mx-auto text-slate-400" size={32} />

              <h3 className="mt-3 font-semibold text-slate-700">
                No pending skills
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Use the Extract Skills button to identify new skills from
                your profile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {draftSkills.map((skill) => (
                <div
                  key={skill.skill_id || skill.name}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800">
                      {skill.name}
                    </h3>

                    <p className="mt-1 text-xs text-indigo-600">
                      {skill.taxonomy_category || "General"}
                    </p>

                    {skill.evidence_snippet && (
                      <p className="mt-2 text-sm text-slate-500">
                        {skill.evidence_snippet}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveSkill(skill.skill_id)}
                    disabled={saving}
                    aria-label={`Remove ${skill.name}`}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 sm:self-center"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="mb-3 font-semibold text-slate-800">
              Add a skill manually
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleAddSkill();
                  }
                }}
                placeholder="Enter skill name"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <select
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option>General</option>
                <option>Programming</option>
                <option>AI</option>
                <option>Database</option>
                <option>Communication</option>
                <option>Leadership</option>
                <option>Management</option>
                <option>Design</option>
              </select>

              <button
                onClick={handleAddSkill}
                disabled={!newSkill.trim() || saving || extracting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
              >
                <Plus size={17} />
                Add
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Ready to confirm your skills?
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Only the skills in this list will be submitted.
              </p>
            </div>

            <button
              onClick={handleConfirmSkills}
              disabled={
                saving ||
                extracting ||
                draftSkills.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Confirm Skills
                </>
              )}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Confirmed Skills
              </h2>

              <p className="text-sm text-slate-500">
                Skills saved as confirmed in your employee record.
              </p>
            </div>
          </div>

          {confirmedSkills.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              You have not confirmed any skills yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {confirmedSkills.map((skill, index) => (
                <span
                  key={`${skill.name}-${index}`}
                  className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                >
                  {skill.name}

                  <span className="ml-2 text-xs opacity-60">
                    {skill.taxonomy_category}
                  </span>
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
