import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { normalizeRole } from "../services/roles";
import {
  createAdminProject, createAdminWorkspace, deleteAdminUser, getAdminOverview, getAdminProjects,
  getAdminUsers, getAdminWorkspaces, updateAdminMemberRole, updateAdminProject,
  updateAdminWorkspace,
} from "../services/api";

const inputClass = "mt-1 w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-bg)] px-3 py-2 text-sm";
const buttonClass = "rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";
const cardClass = "rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 shadow-sm";
const displayName = (user) => [user.prenom, user.nom].filter(Boolean).join(" ") || `Utilisateur ${user.id}`;
const isSuperUser = (user) => normalizeRole(user.role) === "SUPER_ADMIN";

export default function Administration() {
  const { estConnecte, estAdmin } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceOwner, setWorkspaceOwner] = useState("");
  const [projectDraft, setProjectDraft] = useState({ workspace_id: "", titre: "", description: "" });
  const [workspaceDrafts, setWorkspaceDrafts] = useState({});
  const [projectDrafts, setProjectDrafts] = useState({});
  const [roleDrafts, setRoleDrafts] = useState({});

  const load = useCallback(async () => {
    setError("");
    try {
      const [nextOverview, nextUsers, nextWorkspaces, nextProjects] = await Promise.all([
        getAdminOverview(), getAdminUsers(), getAdminWorkspaces(), getAdminProjects(),
      ]);
      setOverview(nextOverview);
      setUsers(nextUsers);
      setWorkspaces(nextWorkspaces);
      setProjects(nextProjects);
      setWorkspaceDrafts(Object.fromEntries(nextWorkspaces.map((space) => [space.id, { name: space.name, owner: "" }])));
      setProjectDrafts(Object.fromEntries(nextProjects.map((project) => [project.id, { titre: project.titre, description: project.description || "" }])));
      setRoleDrafts(Object.fromEntries(nextUsers.map((user) => [user.id, {
        role: normalizeRole(user.role) === "SOUS_CHEF_DE_PROJET" ? "SOUS_CHEF_DE_PROJET" : "MEMBRE",
        can_manage_tasks: Boolean(user.can_manage_tasks),
      }])));
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger les données d’administration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const ownersAvailable = useMemo(() => users.filter((user) => !user.workspace_id && !isSuperUser(user)), [users]);
  const ownerIds = useMemo(() => new Set(workspaces.map((space) => space.owner_user_id)), [workspaces]);

  if (!estConnecte) return <Navigate to="/connexion" replace />;
  if (!estAdmin) return <Navigate to="/" replace />;

  const perform = async (action, successMessage) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(successMessage);
      await load();
    } catch (actionError) {
      setError(actionError.message || "L’opération a échoué.");
    } finally {
      setBusy(false);
    }
  };

  const submitWorkspace = (event) => {
    event.preventDefault();
    if (!workspaceOwner) return;
    void perform(() => createAdminWorkspace({ name: workspaceName.trim(), owner_user_id: Number(workspaceOwner) }), "Espace créé.");
    setWorkspaceName("");
    setWorkspaceOwner("");
  };

  const submitProject = (event) => {
    event.preventDefault();
    void perform(() => createAdminProject({ ...projectDraft, workspace_id: Number(projectDraft.workspace_id) }), "Projet créé.");
    setProjectDraft({ workspace_id: "", titre: "", description: "" });
  };

  const saveWorkspace = (space) => {
    const draft = workspaceDrafts[space.id] || {};
    const changes = { name: draft.name?.trim() };
    if (draft.owner) changes.new_owner_user_id = Number(draft.owner);
    void perform(() => updateAdminWorkspace(space.id, changes), "Espace mis à jour.");
  };

  const saveProject = (project) => {
    const draft = projectDrafts[project.id] || {};
    void perform(() => updateAdminProject(project.id, { ...draft }), "Projet mis à jour.");
  };

  const saveRole = (user) => {
    const draft = roleDrafts[user.id];
    void perform(() => updateAdminMemberRole(user.id, draft.role, draft.can_manage_tasks), "Rôle mis à jour.");
  };

  const removeUser = (user) => {
    const deleteWorkspace = ownerIds.has(user.id);
    const description = deleteWorkspace
      ? `Supprimer ${displayName(user)} ainsi que son espace, ses projets, tâches, messages, vocaux, photos et notifications ? Cette action est irréversible.`
      : `Supprimer le compte ${displayName(user)} ? Ses messages existants seront conservés.`;
    if (!window.confirm(description)) return;
    void perform(
      () => deleteAdminUser(user.id, deleteWorkspace),
      deleteWorkspace ? "Le compte et son espace ont été supprimés." : "Le compte a été supprimé.",
    );
  };

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Administration globale</p><h1 className="mt-1 text-3xl font-bold">Vue d’ensemble</h1><p className="mt-2 text-sm opacity-70">Les contrôles d’autorisation restent appliqués par l’API à chaque opération.</p></div>
      <button type="button" className={buttonClass} disabled={loading || busy} onClick={() => { setLoading(true); void load(); }}>Actualiser</button>
    </header>
    {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">{notice}</p>}
    {loading ? <p role="status" className="py-12 text-center">Chargement des données globales…</p> : <>
      <section aria-label="Statistiques globales" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[["Utilisateurs", overview?.users], ["Espaces", overview?.workspaces], ["Projets", overview?.projects], ["Tâches", overview?.tasks], ["Messages", overview?.messages]].map(([label, count]) => <article key={label} className={cardClass}><p className="text-sm opacity-70">{label}</p><p className="mt-2 text-3xl font-bold">{count ?? "—"}</p></article>)}
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-bold">Espaces de travail</h2>
        <p className="mt-1 text-sm opacity-70">La suppression d’un compte propriétaire efface aussi son espace et les données associées, après confirmation.</p>
        <div className="mt-4 space-y-3">{workspaces.length ? workspaces.map((space) => {
          const members = users.filter((user) => user.workspace_id === space.id && !isSuperUser(user));
          const draft = workspaceDrafts[space.id] || { name: space.name, owner: "" };
          const owner = users.find((user) => user.id === space.owner_user_id);
          return <article key={space.id} className="rounded-xl border border-[var(--tm-border)] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">{space.name}</h3><p className="text-xs opacity-65">{space.members_count} membre(s) · {space.projects_count} projet(s) · Responsable: {owner ? displayName(owner) : "non renseigné"}</p></div><span className="text-xs opacity-60">Espace #{space.id}</span></div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="text-sm">Nom de l’espace<input className={inputClass} maxLength={160} value={draft.name} onChange={(event) => setWorkspaceDrafts((old) => ({ ...old, [space.id]: { ...old[space.id], name: event.target.value } }))} /></label>
              <label className="text-sm">Transférer la propriété<select className={inputClass} value={draft.owner} onChange={(event) => setWorkspaceDrafts((old) => ({ ...old, [space.id]: { ...old[space.id], owner: event.target.value } }))}><option value="">Conserver le propriétaire actuel</option>{members.filter((user) => user.id !== space.owner_user_id).map((user) => <option key={user.id} value={user.id}>{displayName(user)}</option>)}</select></label>
              <button type="button" className={buttonClass} disabled={busy || !draft.name?.trim()} onClick={() => saveWorkspace(space)}>Enregistrer</button>
            </div>
          </article>;
        }) : <p className="py-4 text-sm opacity-70">Aucun espace enregistré.</p>}</div>
        <form onSubmit={submitWorkspace} className="mt-5 grid gap-3 rounded-xl bg-[var(--tm-surface-muted)] p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="text-sm">Créer un espace<input className={inputClass} value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} maxLength={160} required placeholder="Nom de l’espace" /></label>
          <label className="text-sm">Compte propriétaire<select className={inputClass} value={workspaceOwner} onChange={(event) => setWorkspaceOwner(event.target.value)} required><option value="">Choisir un compte sans espace</option>{ownersAvailable.map((user) => <option key={user.id} value={user.id}>{displayName(user)} · #{user.id}</option>)}</select></label>
          <button className={buttonClass} disabled={busy || !ownersAvailable.length}>Créer l’espace</button>
          {!ownersAvailable.length && <p className="text-xs opacity-65 md:col-span-3">Aucun compte disponible sans espace.</p>}
        </form>
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-bold">Projets globaux</h2>
        <div className="mt-4 space-y-3">{projects.length ? projects.map((project) => {
          const draft = projectDrafts[project.id] || { titre: project.titre, description: project.description || "" };
          return <article key={project.id} className="grid gap-3 rounded-xl border border-[var(--tm-border)] p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="text-sm">{project.titre}<span className="block text-xs opacity-60">{project.workspace_name || `Espace #${project.workspace_id ?? "—"}`} · #{project.id}</span><input className={inputClass} value={draft.titre} maxLength={200} onChange={(event) => setProjectDrafts((old) => ({ ...old, [project.id]: { ...old[project.id], titre: event.target.value } }))} /></label>
            <label className="text-sm">Description<textarea className={inputClass} rows={2} value={draft.description} onChange={(event) => setProjectDrafts((old) => ({ ...old, [project.id]: { ...old[project.id], description: event.target.value } }))} /></label>
            <button type="button" className={buttonClass} disabled={busy || !draft.titre?.trim()} onClick={() => saveProject(project)}>Enregistrer</button>
          </article>;
        }) : <p className="py-4 text-sm opacity-70">Aucun projet enregistré.</p>}</div>
        <form onSubmit={submitProject} className="mt-5 grid gap-3 rounded-xl bg-[var(--tm-surface-muted)] p-4 md:grid-cols-2">
          <label className="text-sm">Espace<select className={inputClass} value={projectDraft.workspace_id} onChange={(event) => setProjectDraft((old) => ({ ...old, workspace_id: event.target.value }))} required><option value="">Choisir un espace</option>{workspaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}</select></label>
          <label className="text-sm">Titre du projet<input className={inputClass} value={projectDraft.titre} onChange={(event) => setProjectDraft((old) => ({ ...old, titre: event.target.value }))} maxLength={200} required /></label>
          <label className="text-sm md:col-span-2">Description<textarea className={inputClass} rows={3} value={projectDraft.description} onChange={(event) => setProjectDraft((old) => ({ ...old, description: event.target.value }))} /></label>
          <button className={`${buttonClass} md:col-span-2 md:justify-self-start`} disabled={busy || !workspaces.length}>Créer le projet</button>
        </form>
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-bold">Utilisateurs et rôles</h2>
        <p className="mt-1 text-sm opacity-70">Les rôles super administrateur et chef propriétaire ne peuvent pas être modifiés depuis cette liste.</p>
        <div className="mt-4 space-y-3">{users.map((user) => {
          const protectedUser = isSuperUser(user) || ownerIds.has(user.id) || !user.workspace_id;
          const draft = roleDrafts[user.id] || { role: "MEMBRE", can_manage_tasks: false };
          return <article key={user.id} className="grid gap-3 rounded-xl border border-[var(--tm-border)] p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div><h3 className="font-semibold">{displayName(user)}</h3><p className="text-xs opacity-65">{user.workspace_name || "Aucun espace"} · {isSuperUser(user) ? "Super administrateur" : ownerIds.has(user.id) ? "Propriétaire d’espace" : user.workspace_id ? "Membre" : "Compte sans espace"}</p></div>
            {protectedUser ? <p className="text-sm opacity-65">Rôle protégé</p> : <div className="flex flex-wrap items-end gap-3"><label className="flex-1 text-sm">Rôle<select className={inputClass} value={draft.role} onChange={(event) => setRoleDrafts((old) => ({ ...old, [user.id]: { ...old[user.id], role: event.target.value } }))}><option value="MEMBRE">Membre</option><option value="SOUS_CHEF_DE_PROJET">Sous-chef de projet</option></select></label><label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={draft.can_manage_tasks} disabled={draft.role !== "SOUS_CHEF_DE_PROJET"} onChange={(event) => setRoleDrafts((old) => ({ ...old, [user.id]: { ...old[user.id], can_manage_tasks: event.target.checked } }))} />Gérer les tâches</label></div>}
            {!protectedUser && <button type="button" className={buttonClass} disabled={busy} onClick={() => saveRole(user)}>Enregistrer</button>}
            {!isSuperUser(user) && <button type="button" className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40" disabled={busy} onClick={() => removeUser(user)}>{ownerIds.has(user.id) ? "Supprimer le compte et son espace" : "Supprimer le compte"}</button>}
          </article>;
        })}</div>
      </section>
    </>}
  </div>;
}
