
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
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getEmployeeSkills,
  extractSkills,
  confirmSkills,
} from "../services/skillsApi";

import { useAuth } from "../contexts/AuthContext";
import DocumentManager from "../components/DocumentManager";
import AgentRunPanel from "../components/AgentRunPanel";


export default function SkillsPage() {
  const { employee: user } = useAuth();

  const employeeId = user?.employee_id || "";

  const [employee, setEmployee] = useState(null);
  const [draftSkills, setDraftSkills] = useState([]);
  const [confirmedSkills, setConfirmedSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  const [extractionSummary, setExtractionSummary] = useState(null);

  // Tracks additions/removals made by the employee.
  const [reviewChanged, setReviewChanged] = useState(false);

  useEffect(() => {
    if (!extracting) return undefined;

    const timers = [
      setTimeout(() => setExtractionStep(1), 700),
      setTimeout(() => setExtractionStep(2), 1400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [extracting]);


  // =====================================================
  // LOAD AUTHORITATIVE SKILLS STATE
  // =====================================================

  async function refreshSkills() {
    const data = await getEmployeeSkills(employeeId);

    setEmployee(data.employee || null);
    setDraftSkills(data.extracted_skills_draft || []);
    setConfirmedSkills(data.confirmed_skills_final || []);

    return data;
  }

  async function handleDocumentsChanged({ action, result } = {}) {
    if (action === "upload" && result?.uploaded_count > 0) {
      await handleExtractSkills();
      return;
    }

    await refreshSkills();
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

        setReviewChanged(false);

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


  // =====================================================
  // EXTRACTION SUMMARY
  // =====================================================

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

      categories[category] = (
        categories[category] || 0
      ) + 1;
    });

    return {
      total: skills.length,
      matched: matched.length,
      unmapped: unmapped.length,
      categories,
    };
  }


  // =====================================================
  // EXTRACT SKILLS
  // =====================================================

  async function handleExtractSkills() {
    if (!employeeId) {
      setError("Employee ID is missing. Please log in again.");
      return;
    }

    // Do not overwrite a selection that the employee has edited.
    if (reviewChanged) {
      setError(
        "Please confirm your current changes before running extraction again."
      );
      return;
    }

    try {
      setExtracting(true);
      setExtractionStep(0);
      setError("");
      setSuccess("");

      // Profile text is retrieved by the backend from the database.
      const data = await extractSkills({
        employee_id: employeeId,
      });

      setExtractionStep(2);
      const extracted = data.extracted_skills || [];

      setExtractionSummary(
        buildExtractionSummary(extracted)
      );

      // Reload the authoritative state from the database.
      const latestState = await refreshSkills();
      setExtractionStep(3);

      const pendingCount =
        latestState.extracted_skills_draft?.length || 0;

      setReviewChanged(false);

      setSuccess(
        pendingCount > 0
          ? `${pendingCount} skills are ready for your review. Previously confirmed skills have been preserved.`
          : "Extraction completed. No new skills are awaiting confirmation."
      );

    } catch (err) {
      setError(err.message || "Skill extraction failed.");
    } finally {
      setExtracting(false);
      setExtractionStep(0);
    }
  }


  // =====================================================
  // ADD MANUAL SKILL
  // =====================================================

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
      setError(
        "This skill already exists in your pending or confirmed skills."
      );
      return;
    }

    const newItem = {
      skill_id: `manual-${Date.now()}`,
      name,
      taxonomy_category: newCategory,
      evidence_snippet: "Self-reported and added by employee",
    };

    const updatedSkills = [
      ...draftSkills,
      newItem
    ];

    setDraftSkills(updatedSkills);
    setReviewChanged(true);

    if (extractionSummary) {
      setExtractionSummary(
        buildExtractionSummary(updatedSkills)
      );
    }

    setNewSkill("");
    setNewCategory("General");

    setError("");
    setSuccess(
      "Skill added. Confirm your changes to save them."
    );
  }


  // =====================================================
  // REMOVE PENDING SKILL
  // =====================================================

  function handleRemoveSkill(skillId) {
    const updatedSkills = draftSkills.filter(
      (skill) => skill.skill_id !== skillId
    );

    setDraftSkills(updatedSkills);
    setReviewChanged(true);

    if (extractionSummary) {
      setExtractionSummary(
        buildExtractionSummary(updatedSkills)
      );
    }

    setError("");
    setSuccess(
      "Skill removed from the review list. Confirm your changes to save this decision."
    );
  }


  // =====================================================
  // CONFIRM FINAL SKILL SELECTION
  // =====================================================

  async function handleConfirmSkills() {
    if (!employeeId) {
      setError("Employee ID is missing. Please log in again.");
      return;
    }

    if (!draftSkills.length && !reviewChanged) {
      setError(
        "There are no skill changes to confirm."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        employee_id: employeeId,

        // This is the employee's FINAL selection.
        // An empty list means all pending suggestions were rejected.
        confirmed_skills: draftSkills.map((skill) => ({
          name: skill.name,
          taxonomy_category: (
            skill.taxonomy_category || "General"
          ),
          evidence_snippet: (
            skill.evidence_snippet || ""
          ),
        })),
      };

      const result = await confirmSkills(payload);

      // Always reload the state saved by the backend.
      await refreshSkills();

      setExtractionSummary(null);
      setReviewChanged(false);

      if (result.ready_for_matching) {
        setSuccess(
          "Your skills have been confirmed successfully. Your profile is ready for matching."
        );
      } else {
        setSuccess(
          "Your review has been saved. No confirmed skills remain, so matching is not available yet."
        );
      }

    } catch (err) {
      setError(
        err.message || "Unable to confirm skills."
      );
    } finally {
      setSaving(false);
    }
  }


  // =====================================================
  // LOADING STATE
  // =====================================================

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


  // =====================================================
  // ERROR STATE
  // =====================================================

  if (
    error &&
    !employee &&
    !draftSkills.length &&
    !confirmedSkills.length
  ) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle
          className="mx-auto text-red-600"
          size={32}
        />

        <h2 className="mt-3 font-semibold text-red-800">
          Unable to load skills
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>

        <Link
          to="/dashboard"
          className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }


  // =====================================================
  // EMPLOYEE STATUS
  // =====================================================

  const isConfirmed = Boolean(employee?.is_confirmed);

  const readyForMatching = Boolean(
    employee?.ready_for_matching
  );

  const confirmationStatus = readyForMatching
    ? "Ready for matching"
    : isConfirmed
      ? "Review completed"
      : "Review pending";


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* BACK LINK */}
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        {/* HERO BANNER (DASHBOARD STYLE) */}
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-200">
          <div className="relative p-7 sm:p-9">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                  Skills Discovery & Extraction
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Review Your Skills
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Review the skills identified from your employee profile and uploaded documents.
                  You remain in control of what gets confirmed.
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-700">
                  <Brain size={25} />
                </div>
                <div>
                  <p className="font-semibold">{employee?.full_name || "Employee"}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {employee?.current_role || "Role not provided"} · ID: {employee?.employee_id || employeeId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-3">
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Confirmation status</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                {readyForMatching ? (
                  <CheckCircle2 size={15} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={15} className="text-amber-300" />
                )}
                {confirmationStatus}
              </p>
            </div>
            <div className="border-b border-white/10 px-7 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs text-slate-400">Pending review</p>
              <p className="mt-1 text-sm font-semibold">
                {draftSkills.length} skill{draftSkills.length === 1 ? "" : "s"} awaiting confirmation
              </p>
            </div>
            <div className="px-7 py-4">
              <p className="text-xs text-slate-400">Confirmed skills</p>
              <p className="mt-1 text-sm font-semibold">
                {confirmedSkills.length} verified skill{confirmedSkills.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </section>


        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            {error}
          </div>
        )}


        {/* SUCCESS MESSAGE */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            {success}
          </div>
        )}


        {/* DOCUMENT MANAGEMENT */}
        <div className="mb-6">
          <DocumentManager
            employeeId={employeeId}
            onDocumentsChanged={handleDocumentsChanged}
          />
        </div>

        {extracting && (
          <AgentRunPanel
            agentName="Skills Discovery Agent"
            task="Reading your profile, identifying evidence, and normalizing skills against the enterprise taxonomy."
            steps={[
              "Read profile",
              "Extract skills",
              "Normalize taxonomy",
              "Save review draft",
            ]}
            activeStep={extractionStep}
          />
        )}

        {/* AI EXTRACTION (DASHBOARD STYLE) */}
        <section className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur">
                <Sparkles size={24} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                  Run Agent
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Skills Discovery Agent
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-indigo-100">
                  Analyze your uploaded documents, identify evidence, and prepare skills for your review.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExtractSkills}
              disabled={extracting || saving || reviewChanged}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-indigo-100">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur border border-white/20">Evidence-based</span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur border border-white/20">Taxonomy normalized</span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur border border-white/20">Human reviewed</span>
          </div>
        </section>


        {/* EXTRACTION SUMMARY */}

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
                {Object.entries(
                  extractionSummary.categories
                ).map(([category, count]) => {
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
                          style={{
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
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
                  Review the extracted skills below. They will only be
                  used for matching after you confirm them.
                </p>
              </div>
            </div>
          </section>
        )}


        {/* PENDING SKILLS */}

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
              <Brain
                className="mx-auto text-slate-400"
                size={32}
              />

              <h3 className="mt-3 font-semibold text-slate-700">
                No pending skills
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Use the Extract Skills button to identify new skills
                from your uploaded documents.
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
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">
                        {skill.evidence_snippet}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveSkill(skill.skill_id)}
                    disabled={saving || extracting}
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


          {/* ADD MANUAL SKILL */}

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
                disabled={
                  !newSkill.trim() ||
                  saving ||
                  extracting
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
              >
                <Plus size={17} />
                Add
              </button>
            </div>
          </div>


          {/* CONFIRM BUTTON */}

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
                (
                  draftSkills.length === 0 &&
                  !reviewChanged
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
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


        {/* CONFIRMED SKILLS */}

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
                  {skill.inferred_proficiency
                    ? ` · ${skill.inferred_proficiency}`
                    : ""}

                  <span className="ml-2 text-xs opacity-60">
                    {skill.taxonomy_category}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Matching is accessible only after successful confirmation. */}
          {readyForMatching && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <Link
                to="/matching"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Continue to Matching
                <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
