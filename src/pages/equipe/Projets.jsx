import { useCallback, useEffect, useState } from "react";
import {
  ajouterProjet, ajouterTache, getProjets, getTaches, getUtilisateurs,
  modifierEtatTache, modifierProjet, supprimerProjet, supprimerTache,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { normalizeRole } from "../../services/roles";

const blankTask = { title: "", description: "", assigned_to: "", due_date: "", priority: "NORMAL" };
const statusLabels = { TODO: "À faire", IN_PROGRESS: "En cours", DONE: "Terminée" };

function ouvrirExportProjet(project, tasks) {
  const printWindow = window.open("about:blank", "_blank");
  if (!printWindow) throw new Error("Autorisez l’ouverture de la fenêtre d’export pour enregistrer le PDF.");
  printWindow.opener = null;
  const doc = printWindow.document;
  doc.open();
  doc.write("<!doctype html><html lang=\"fr\"><head><meta charset=\"utf-8\"><title>Export du projet</title><style>body{font:14px/1.55 system-ui,sans-serif;color:#172033;max-width:850px;margin:40px auto;padding:0 24px}h1{font-size:26px}h2{margin-top:24px;border-bottom:1px solid #dbe2ea;padding-bottom:6px}p{white-space:pre-wrap;overflow-wrap:anywhere}.task{break-inside:avoid;border:1px solid #dbe2ea;border-radius:8px;padding:10px;margin:8px 0}.muted{color:#64748b;font-size:12px}@page{margin:18mm}@media print{body{margin:0;padding:0}}</style></head><body></body></html>");
  doc.close();

  const addText = (tag, text, parent = doc.body, className = "") => {
    const node = doc.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    parent.appendChild(node);
    return node;
  };
  addText("h1", project.titre || "Projet");
  addText("p", `Exporté le ${new Date().toLocaleString("fr-FR")}`, doc.body, "muted");
  for (const [heading, value] of [["Description", project.description], ["Objectifs", project.objectifs], ["Résultats attendus", project.resultats_attendus]]) {
    addText("h2", heading);
    addText("p", value || "Non renseigné.");
  }
  addText("h2", `Tâches (${tasks.length})`);
  if (tasks.length === 0) addText("p", "Aucune tâche enregistrée.");
  tasks.forEach((task) => {
    const item = addText("article", "", doc.body, "task");
    addText("strong", task.title, item);
    addText("p", task.description || "", item);
    addText("p", `${statusLabels[task.status] || task.status} · ${task.assignee_name || "Sans responsable"} · ${task.due_date || "Sans échéance"} · Priorité ${task.priority}`, item, "muted");
  });
  printWindow.focus();
  printWindow.setTimeout(() => printWindow.print(), 250);
}

export default function Projets() {
  const { utilisateurConnecte } = useAuth();
  const role = normalizeRole(utilisateurConnecte?.role);
  const canLead = role === "CHEF_DE_PROJET";
  const canManageTasks = canLead || (role === "SOUS_CHEF_DE_PROJET" && utilisateurConnecte?.can_manage_tasks);
  const canManage = canManageTasks;
  const isSuper = role === "SUPER_ADMIN";
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tasksError, setTasksError] = useState("");
  const [editing, setEditing] = useState(null);
  const [taskFor, setTaskFor] = useState("");
  const [task, setTask] = useState(blankTask);
  const [notice, setNotice] = useState({ message: "", type: "success" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [projectsResult, usersResult, tasksResult] = await Promise.allSettled([
      getProjets(), getUtilisateurs(), getTaches(),
    ]);
    const coreError = projectsResult.status === "rejected" ? projectsResult.reason :
      usersResult.status === "rejected" ? usersResult.reason : null;
    if (coreError) {
      setError(coreError.message || "Chargement des projets impossible.");
    } else {
      setProjects(projectsResult.value || []);
      setUsers(usersResult.value || []);
      setError("");
    }
    if (tasksResult.status === "rejected") {
      setTasks([]);
      setTasksError(tasksResult.reason.message || "Chargement des tâches impossible.");
    } else {
      setTasks(tasksResult.value || []);
      setTasksError("");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const createProject = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await ajouterProjet({
        titre: data.get("titre"), description: data.get("description"),
        objectifs: data.get("objectifs"), resultats_attendus: data.get("resultats_attendus"),
      });
      form.reset();
      await load();
      setNotice({ message: "Projet enregistré.", type: "success" });
    } catch (err) { setNotice({ message: err.message || "Création impossible.", type: "error" }); }
  };

  const saveProject = async (project) => {
    try {
      await modifierProjet(project.id, {
        titre: project.titre, description: project.description || "",
        objectifs: project.objectifs || "", resultats_attendus: project.resultats_attendus || "",
        statut: project.statut || "En cours",
      });
      setEditing(null);
      await load();
      setNotice({ message: "Projet mis à jour.", type: "success" });
    } catch (err) { setNotice({ message: err.message || "Modification impossible.", type: "error" }); }
  };

  const changeProjectStatus = async (project, statut) => {
    try {
      await modifierProjet(project.id, {
        titre: project.titre, description: project.description || "",
        objectifs: project.objectifs || "", resultats_attendus: project.resultats_attendus || "", statut,
      });
      await load();
      setNotice({ message: "État du projet mis à jour.", type: "success" });
    } catch (err) { setNotice({ message: err.message || "Mise à jour impossible.", type: "error" }); }
  };

  const createTask = async (event) => {
    event.preventDefault();
    try {
      await ajouterTache({
        project_id: Number(taskFor), title: task.title, description: task.description,
        assigned_to: task.assigned_to ? Number(task.assigned_to) : null,
        due_date: task.due_date || null, priority: task.priority,
      });
      setTask(blankTask);
      setTaskFor("");
      await load();
      setNotice({ message: "Tâche enregistrée et attribuée.", type: "success" });
    } catch (err) { setNotice({ message: err.message || "Création de tâche impossible.", type: "error" }); }
  };

  const updateStatus = async (taskId, status) => {
    try { await modifierEtatTache(taskId, status); await load(); }
    catch (err) { setNotice({ message: err.message || "Mise à jour impossible.", type: "error" }); }
  };

  const removeTask = async (taskId) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try { await supprimerTache(taskId); await load(); }
    catch (err) { setNotice({ message: err.message || "Suppression impossible.", type: "error" }); }
  };

  const removeProject = async (id) => {
    if (!window.confirm("Supprimer le projet et ses tâches associées ?")) return;
    try { await supprimerProjet(id); await load(); }
    catch (err) { setNotice({ message: err.message || "Suppression impossible.", type: "error" }); }
  };

  const field = "w-full rounded-xl border border-[var(--tm-border)] bg-[var(--tm-bg)] p-3 text-sm";
  return <section className="mx-auto max-w-6xl space-y-6">
    <Toast message={notice.message} type={notice.type} onClose={() => setNotice({ message: "", type: "success" })} />
    <header><h1 className="text-2xl font-bold">Projets et tâches</h1><p className="mt-1 text-sm opacity-70">Objectifs structurés, responsabilités et suivi de l’avancement.</p></header>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>}
    {tasksError && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">Les projets sont disponibles, mais les tâches ne peuvent pas être chargées : {tasksError}</p>}

    {canLead && <form onSubmit={createProject} className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 shadow-sm md:grid-cols-2">
      <h2 className="md:col-span-2 text-lg font-semibold">Créer un projet</h2>
      <input required name="titre" maxLength={200} placeholder="Titre du projet" className={field} />
      <div className="hidden md:block" />
      <label className="text-sm font-medium">Description<textarea name="description" rows={5} placeholder="Contexte et description générale…" className={`${field} mt-1 whitespace-pre-wrap`} /></label>
      <label className="text-sm font-medium">Objectifs<textarea name="objectifs" rows={5} placeholder="Un objectif par ligne…" className={`${field} mt-1 whitespace-pre-wrap`} /></label>
      <label className="text-sm font-medium md:col-span-2">Résultats attendus<textarea name="resultats_attendus" rows={3} placeholder="Livrables et critères de réussite…" className={`${field} mt-1 whitespace-pre-wrap`} /></label>
      <button className="w-fit rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Créer le projet</button>
    </form>}

    {canManage && projects.length > 0 && !tasksError && <form onSubmit={createTask} className="grid grid-cols-1 gap-3 rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 md:grid-cols-2">
      <h2 className="md:col-span-2 text-lg font-semibold">Ajouter une tâche</h2>
      <select required value={taskFor} onChange={(e) => setTaskFor(e.target.value)} className={field}><option value="">Projet concerné</option>{projects.map((p) => <option value={p.id} key={p.id}>{p.titre}</option>)}</select>
      <input required maxLength={200} value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} placeholder="Intitulé" className={field} />
      <textarea rows={2} value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} placeholder="Description / consignes" className={field} />
      <select value={task.assigned_to} onChange={(e) => setTask({ ...task, assigned_to: e.target.value })} className={field}><option value="">Sans responsable</option>{users.filter((u) => normalizeRole(u.role) !== "SUPER_ADMIN").map((u) => <option key={u.id} value={u.id}>{[u.prenom, u.nom].filter(Boolean).join(" ") || u.email}</option>)}</select>
      <label className="text-sm">Échéance<input type="date" value={task.due_date} onChange={(e) => setTask({ ...task, due_date: e.target.value })} className={`${field} mt-1`} /></label>
      <label className="text-sm">Priorité<select value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })} className={`${field} mt-1`}><option value="LOW">Basse</option><option value="NORMAL">Normale</option><option value="HIGH">Haute</option><option value="URGENT">Urgente</option></select></label>
      <button disabled={!taskFor} className="w-fit rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Enregistrer la tâche</button>
    </form>}

    <div className="grid grid-cols-1 gap-4">
      {projects.length === 0 ? <p className="rounded-xl border border-dashed border-[var(--tm-border)] p-8 text-center opacity-70">Aucun projet dans cet espace.</p> : projects.map((project) => {
        const projectTasks = tasks.filter((item) => item.project_id === project.id);
        return <article key={project.id} className="space-y-4 rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 shadow-sm">
          {editing?.id === project.id ? <div className="grid gap-3">
            <input value={editing.titre} onChange={(e) => setEditing({ ...editing, titre: e.target.value })} className={field} />
            {["description", "objectifs", "resultats_attendus"].map((key) => <label key={key} className="text-sm capitalize">{key.replace("_", " ")}<textarea rows={key === "description" ? 5 : 3} value={editing[key] || ""} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} className={`${field} mt-1 whitespace-pre-wrap`} /></label>)}
            <div className="flex gap-2"><button onClick={() => saveProject(editing)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Enregistrer</button><button onClick={() => setEditing(null)} className="rounded-lg border border-[var(--tm-border)] px-4 py-2 text-sm">Annuler</button></div>
          </div> : <>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{project.titre}</h2>{isSuper && <p className="mt-1 text-xs opacity-65">Espace : {project.workspace_name || "Historique non attribué"}</p>}</div><div className="flex flex-wrap items-center gap-2">{canLead ? <select aria-label="État du projet" value={project.statut} onChange={(e) => changeProjectStatus(project, e.target.value)} className="rounded-full border border-[var(--tm-border)] bg-[var(--tm-bg)] px-3 py-1 text-xs font-semibold"><option>En cours</option><option>En attente</option><option>Terminé</option></select> : <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-100">{project.statut}</span>}<button type="button" onClick={() => { try { ouvrirExportProjet(project, projectTasks); } catch (err) { setNotice({ message: err.message, type: "error" }); } }} className="rounded-lg border border-[var(--tm-border)] px-3 py-2 text-sm">Exporter en PDF</button></div></div>
            <div className="grid gap-3 md:grid-cols-3">
              {[["Description", project.description], ["Objectifs", project.objectifs], ["Résultats attendus", project.resultats_attendus]].map(([label, value]) => <div key={label} className="rounded-xl bg-[var(--tm-bg)] p-3"><h3 className="mb-1 text-xs font-bold uppercase tracking-wide opacity-65">{label}</h3><p className="whitespace-pre-wrap text-sm leading-relaxed">{value || "Non renseigné."}</p></div>)}
            </div>
            {canLead && <div className="flex flex-wrap gap-2 border-t border-[var(--tm-border)] pt-3"><button onClick={() => setEditing({ ...project })} className="rounded-lg border border-[var(--tm-border)] px-3 py-2 text-sm">Modifier le projet</button><button onClick={() => removeProject(project.id)} className="rounded-lg px-3 py-2 text-sm text-red-600">Supprimer</button></div>}
          </>}
          <section className="border-t border-[var(--tm-border)] pt-3"><h3 className="mb-2 font-semibold">Tâches ({projectTasks.length})</h3>{projectTasks.length === 0 ? <p className="text-sm opacity-60">{tasksError ? "Tâches indisponibles tant que l’API n’est pas à jour." : "Aucune tâche enregistrée."}</p> : <ul className="space-y-2">{projectTasks.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--tm-bg)] p-3"><div className="min-w-0 flex-1"><p className="font-medium">{item.title}</p>{item.description && <p className="whitespace-pre-wrap text-sm opacity-70">{item.description}</p>}<p className="mt-1 text-xs opacity-60">{item.assignee_name || "Sans responsable"} · {item.due_date || "Sans échéance"} · priorité {item.priority}</p></div>{!isSuper && <select aria-label={`État de ${item.title}`} value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)} className="rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface)] p-2 text-sm"><option value="TODO">{statusLabels.TODO}</option><option value="IN_PROGRESS">{statusLabels.IN_PROGRESS}</option><option value="DONE">{statusLabels.DONE}</option></select>}{canManage && <button onClick={() => removeTask(item.id)} className="text-xs text-red-600 underline">Supprimer</button>}</li>)}</ul>}</section>
        </article>;
      })}
    </div>
  </section>;
}
