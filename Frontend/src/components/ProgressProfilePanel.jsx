import { useEffect, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";
import { addProject, deleteProject, getProgress, saveGoals } from "../services/progressApi";

export default function ProgressProfilePanel() {
  const [progress, setProgress] = useState(null);
  const [goals, setGoals] = useState({ target_role: "", preferred_department: "" });
  const [project, setProject] = useState({
    project_name: "", description: "", skills_used: "", outcome: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const data = await getProgress();
    setProgress(data);
    setGoals(data.goals || { target_role: "", preferred_department: "" });
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  async function handleGoals(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveGoals(goals);
      setMessage("Career goals saved.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleProject(event) {
    event.preventDefault();
    if (!project.project_name.trim() || !project.description.trim()) return;
    setSaving(true);
    try {
      await addProject({
        ...project,
        skills_used: project.skills_used.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      setProject({ project_name: "", description: "", skills_used: "", outcome: "" });
      await load();
      setMessage("Project evidence added.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(projectId) {
    setSaving(true);
    try {
      await deleteProject(projectId);
      await load();
      setMessage("Project removed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-sky-50 p-2 text-sky-700"><BriefcaseBusiness size={19} /></div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Progress profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add structured evidence so matching can evaluate progress beyond documents.
          </p>
        </div>
      </div>

      <form onSubmit={handleGoals} className="mt-5 grid gap-3 sm:grid-cols-3">
        <input value={goals.target_role || ""} onChange={(event) => setGoals({ ...goals, target_role: event.target.value })} placeholder="Target role" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        <input value={goals.preferred_department || ""} onChange={(event) => setGoals({ ...goals, preferred_department: event.target.value })} placeholder="Preferred department" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} /> Save goals</button>
      </form>

      <form onSubmit={handleProject} className="mt-5 grid gap-3 border-t border-slate-100 pt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={project.project_name} onChange={(event) => setProject({ ...project, project_name: event.target.value })} placeholder="Project name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <input value={project.skills_used} onChange={(event) => setProject({ ...project, skills_used: event.target.value })} placeholder="Skills used (comma-separated)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        </div>
        <textarea value={project.description} onChange={(event) => setProject({ ...project, description: event.target.value })} placeholder="What did you build or contribute?" rows={2} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        <div className="flex gap-3">
          <input value={project.outcome} onChange={(event) => setProject({ ...project, outcome: event.target.value })} placeholder="Outcome or measurable result" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-semibold text-sky-700 disabled:opacity-50"><Plus size={15} /> Add project</button>
        </div>
      </form>

      {progress?.projects?.length ? (
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
          {progress.projects.map((item) => (
            <div key={item.project_id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.project_name}</p>
                <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                {item.skills_used?.length ? <p className="mt-1 text-[11px] text-sky-700">{item.skills_used.join(" · ")}</p> : null}
              </div>
              <button type="button" onClick={() => handleDelete(item.project_id)} disabled={saving} className="text-slate-400 hover:text-rose-600"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      ) : null}
      {message ? <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600"><CheckCircle2 size={14} className="text-emerald-600" /> {message}</p> : null}
    </section>
  );
}
