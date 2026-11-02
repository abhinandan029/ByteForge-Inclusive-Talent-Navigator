import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Power,
} from "lucide-react";
import {
  getJobRoles,
  createJobRole,
  updateJobRole,
  updateJobRoleStatus,
  addSkillsToJobRole,
} from "../services/jobsApi";

const initialSkill = {
  skill_name: "",
  taxonomy_category: "General",
  required_proficiency: "Intermediate",
  is_mandatory: true,
  weight: 1.0,
};

const initialRoleForm = {
  title: "",
  department: "",
  description: "",
  experience_min: "",
  experience_max: "",
  required_skills: [{ ...initialSkill }],
};

export default function HRJobRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ ...initialRoleForm });
  const [submitting, setSubmitting] = useState(false);

  // Edit role modal state
  const [editingRole, setEditingRole] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    department: "",
    description: "",
    experience_min: "",
    experience_max: "",
  });

  // Add skill modal state
  const [addSkillRole, setAddSkillRole] = useState(null);
  const [newSkillsList, setNewSkillsList] = useState([{ ...initialSkill }]);

  async function loadRoles() {
    try {
      setLoading(true);
      setError("");
      const data = await getJobRoles();
      setRoles(data.job_roles || []);
    } catch (err) {
      setError(err.message || "Failed to load job roles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  // Filter roles
  const departments = [
    "ALL",
    ...new Set(roles.map((r) => r.department || r.DEPARTMENT).filter(Boolean)),
  ];

  const filteredRoles = roles.filter((role) => {
    const title = role.title || role.TITLE || "";
    const dept = role.department || role.DEPARTMENT || "";
    const status = (role.status || role.STATUS || "active").toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === "ALL" || dept === selectedDept;
    const matchesStatus =
      selectedStatus === "ALL" || status === selectedStatus.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Handle status toggle
  async function handleToggleStatus(role) {
    const roleId = role.job_role_id || role.JOB_ROLE_ID;
    const isPredefined = role.is_predefined || role.IS_PREDEFINED;
    if (isPredefined) {
      alert("Predefined job roles cannot be deactivated.");
      return;
    }

    const currentStatus = (role.status || role.STATUS || "active").toLowerCase();
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      setError("");
      setSuccess("");
      await updateJobRoleStatus(roleId, newStatus);
      setSuccess(`Job role marked as ${newStatus}.`);
      await loadRoles();
    } catch (err) {
      setError(err.message || "Failed to update role status.");
    }
  }

  // Handle Create Role
  function handleAddSkillField() {
    setCreateForm((prev) => ({
      ...prev,
      required_skills: [...prev.required_skills, { ...initialSkill }],
    }));
  }

  function handleRemoveSkillField(index) {
    setCreateForm((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index),
    }));
  }

  function handleSkillChange(index, field, value) {
    setCreateForm((prev) => {
      const updated = [...prev.required_skills];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, required_skills: updated };
    });
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        title: createForm.title.trim(),
        department: createForm.department.trim() || null,
        description: createForm.description.trim() || null,
        experience_min: createForm.experience_min ? parseFloat(createForm.experience_min) : null,
        experience_max: createForm.experience_max ? parseFloat(createForm.experience_max) : null,
        required_skills: createForm.required_skills
          .filter((s) => s.skill_name.trim().length > 0)
          .map((s) => ({
            skill_name: s.skill_name.trim(),
            taxonomy_category: s.taxonomy_category.trim() || "General",
            required_proficiency: s.required_proficiency || null,
            is_mandatory: Boolean(s.is_mandatory),
            weight: parseFloat(s.weight) || 1.0,
          })),
      };

      await createJobRole(payload);
      setSuccess("Job role created successfully!");
      setShowCreateModal(false);
      setCreateForm({ ...initialRoleForm });
      await loadRoles();
    } catch (err) {
      setError(err.message || "Failed to create job role.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Edit Role
  function openEditModal(role) {
    setEditingRole(role);
    setEditForm({
      title: role.title || role.TITLE || "",
      department: role.department || role.DEPARTMENT || "",
      description: role.description || role.DESCRIPTION || "",
      experience_min: role.experience_min != null ? role.experience_min : "",
      experience_max: role.experience_max != null ? role.experience_max : "",
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingRole) return;
    const roleId = editingRole.job_role_id || editingRole.JOB_ROLE_ID;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        title: editForm.title.trim(),
        department: editForm.department.trim() || null,
        description: editForm.description.trim() || null,
        experience_min: editForm.experience_min ? parseFloat(editForm.experience_min) : null,
        experience_max: editForm.experience_max ? parseFloat(editForm.experience_max) : null,
      };

      await updateJobRole(roleId, payload);
      setSuccess("Job role updated successfully!");
      setEditingRole(null);
      await loadRoles();
    } catch (err) {
      setError(err.message || "Failed to update job role.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Add Skills to Role
  function openAddSkillsModal(role) {
    setAddSkillRole(role);
    setNewSkillsList([{ ...initialSkill }]);
  }

  async function handleAddSkillsSubmit(e) {
    e.preventDefault();
    if (!addSkillRole) return;
    const roleId = addSkillRole.job_role_id || addSkillRole.JOB_ROLE_ID;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const skillsPayload = newSkillsList
        .filter((s) => s.skill_name.trim().length > 0)
        .map((s) => ({
          skill_name: s.skill_name.trim(),
          taxonomy_category: s.taxonomy_category.trim() || "General",
          required_proficiency: s.required_proficiency || null,
          is_mandatory: Boolean(s.is_mandatory),
          weight: parseFloat(s.weight) || 1.0,
        }));

      if (skillsPayload.length === 0) {
        throw new Error("Please enter at least one skill name.");
      }

      await addSkillsToJobRole(roleId, skillsPayload);
      setSuccess("Required skills added to job role!");
      setAddSkillRole(null);
      await loadRoles();
    } catch (err) {
      setError(err.message || "Failed to add skills.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeCount = roles.filter(
    (r) => (r.status || r.STATUS || "active").toLowerCase() === "active"
  ).length;

  return (
    <div className="min-h-full bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              HR Partner Workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Job Roles Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Define internal vacancies, configure required competencies, and manage inclusive hiring criteria.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadRoles}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <Plus size={16} />
              Create Job Role
            </button>
          </div>
        </div>

        {/* FEEDBACK MESSAGES */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* METRICS CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Total Roles</span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{roles.length}</p>
            <span className="mt-1 text-[11px] text-slate-500">Configured in system</span>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
            <span className="text-xs font-medium text-emerald-700">Active Roles</span>
            <p className="mt-2 text-2xl font-bold text-emerald-800">{activeCount}</p>
            <span className="mt-1 text-[11px] text-emerald-600">Available for matching</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Inactive Roles</span>
            <p className="mt-2 text-2xl font-bold text-slate-700">{roles.length - activeCount}</p>
            <span className="mt-1 text-[11px] text-slate-500">Excluded from matching</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  Dept: {d}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* ROLES LIST */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
              <RefreshCw size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No job roles match the current filter criteria.
            </div>
          ) : (
            filteredRoles.map((role) => {
              const roleId = role.job_role_id || role.JOB_ROLE_ID;
              const title = role.title || role.TITLE;
              const dept = role.department || role.DEPARTMENT;
              const desc = role.description || role.DESCRIPTION;
              const status = (role.status || role.STATUS || "active").toLowerCase();
              const isPredefined = role.is_predefined || role.IS_PREDEFINED;
              const minExp = role.experience_min ?? role.EXPERIENCE_MIN;
              const maxExp = role.experience_max ?? role.EXPERIENCE_MAX;
              const skills = role.required_skills || role.skills || [];

              const isActive = status === "active";

              return (
                <div
                  key={roleId}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {roleId}
                        </span>

                        {isPredefined && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            Seed Role
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-lg font-bold text-slate-900">
                        {title}
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {dept || "General Engineering"} • Experience:{" "}
                        {minExp != null || maxExp != null
                          ? `${minExp ?? 0} - ${maxExp ?? "+"} yrs`
                          : "Any"}
                      </p>

                      {desc && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                          {desc}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openAddSkillsModal(role)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        + Add Skills
                      </button>

                      {!isPredefined && (
                        <button
                          type="button"
                          onClick={() => openEditModal(role)}
                          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
                          title="Edit role"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}

                      {!isPredefined && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(role)}
                          className={`rounded-xl border p-2 transition ${
                            isActive
                              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                          title={isActive ? "Deactivate role" : "Activate role"}
                        >
                          <Power size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* REQUIRED SKILLS */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Required Competencies ({skills.length}):
                    </span>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {skills.length === 0 ? (
                        <span className="text-xs text-slate-400">No specific skills configured yet.</span>
                      ) : (
                        skills.map((skill, idx) => {
                          const sName = skill.skill_name || skill.SKILL_NAME || skill.name;
                          const sMandatory = skill.is_mandatory ?? skill.IS_MANDATORY ?? true;
                          const sWeight = skill.weight ?? skill.WEIGHT ?? 1.0;

                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                                sMandatory
                                  ? "border-indigo-200 bg-indigo-50/60 text-indigo-800"
                                  : "border-slate-200 bg-slate-50 text-slate-700"
                              }`}
                            >
                              <span>{sName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                (w:{sWeight})
                              </span>
                              {sMandatory && (
                                <span className="rounded bg-indigo-200/60 px-1 py-0.2 text-[9px] font-bold text-indigo-900">
                                  req
                                </span>
                              )}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ========================================================= */}
        {/* CREATE JOB ROLE MODAL                                     */}
        {/* ========================================================= */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Create New Job Role</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Machine Learning Engineer"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Cloud & AI"
                      value={createForm.department}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700">Min Exp (yrs)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={createForm.experience_min}
                        onChange={(e) => setCreateForm({ ...createForm, experience_min: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700">Max Exp (yrs)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="10"
                        value={createForm.experience_max}
                        onChange={(e) => setCreateForm({ ...createForm, experience_max: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe role responsibilities and criteria..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* SKILLS SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">Required Skills</label>
                    <button
                      type="button"
                      onClick={handleAddSkillField}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Another Skill
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {createForm.required_skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Skill name (e.g. Python)"
                          value={skill.skill_name}
                          onChange={(e) => handleSkillChange(index, "skill_name", e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 p-1.5 text-xs focus:outline-none"
                        />

                        <input
                          type="text"
                          placeholder="Category (e.g. Technical)"
                          value={skill.taxonomy_category}
                          onChange={(e) => handleSkillChange(index, "taxonomy_category", e.target.value)}
                          className="w-28 rounded-lg border border-slate-200 p-1.5 text-xs focus:outline-none"
                        />

                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="10"
                          placeholder="Weight"
                          value={skill.weight}
                          onChange={(e) => handleSkillChange(index, "weight", e.target.value)}
                          className="w-16 rounded-lg border border-slate-200 p-1.5 text-xs focus:outline-none"
                          title="Skill Weight"
                        />

                        <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={skill.is_mandatory}
                            onChange={(e) => handleSkillChange(index, "is_mandatory", e.target.checked)}
                          />
                          Req
                        </label>

                        {createForm.required_skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillField(index)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Save Job Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* EDIT JOB ROLE MODAL                                       */}
        {/* ========================================================= */}
        {editingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Edit Job Role</h3>
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Min Exp (yrs)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editForm.experience_min}
                      onChange={(e) => setEditForm({ ...editForm, experience_min: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Max Exp (yrs)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editForm.experience_max}
                      onChange={(e) => setEditForm({ ...editForm, experience_max: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingRole(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? "Updating..." : "Update Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ADD SKILLS MODAL                                          */}
        {/* ========================================================= */}
        {addSkillRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Required Skills</h3>
                  <p className="text-xs text-slate-500">
                    Role: {addSkillRole.title || addSkillRole.TITLE}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddSkillRole(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSkillsSubmit} className="mt-4 space-y-3">
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {newSkillsList.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Skill name"
                        value={skill.skill_name}
                        onChange={(e) => {
                          const updated = [...newSkillsList];
                          updated[index].skill_name = e.target.value;
                          setNewSkillsList(updated);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 p-1.5 text-xs focus:outline-none"
                      />

                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        placeholder="Weight"
                        value={skill.weight}
                        onChange={(e) => {
                          const updated = [...newSkillsList];
                          updated[index].weight = e.target.value;
                          setNewSkillsList(updated);
                        }}
                        className="w-16 rounded-lg border border-slate-200 p-1.5 text-xs focus:outline-none"
                        title="Skill Weight"
                      />

                      <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skill.is_mandatory}
                          onChange={(e) => {
                            const updated = [...newSkillsList];
                            updated[index].is_mandatory = e.target.checked;
                            setNewSkillsList(updated);
                          }}
                        />
                        Req
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setNewSkillsList([...newSkillsList, { ...initialSkill }])}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  + Add another skill
                </button>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddSkillRole(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Skills"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
