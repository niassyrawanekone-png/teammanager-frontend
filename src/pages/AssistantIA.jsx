import { useEffect, useMemo, useState } from "react";
import { ajouterTache, demanderAssistantIA, getProjets } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { normalizeRole } from "../services/roles";

const historyKey = (userId, projectId) => `tm-ai-history:${userId}:${projectId || "general"}`;

export default function AssistantIA() {
  const { utilisateurConnecte } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedLines, setSelectedLines] = useState([]);
  const canImport = normalizeRole(utilisateurConnecte?.role) === "CHEF_DE_PROJET";
  const selectedProject = useMemo(() => projects.find((item) => String(item.id) === projectId), [projects, projectId]);

  useEffect(() => { getProjets().then(setProjects).catch((err) => setError(err.message)); }, []);
  useEffect(() => {
    const key = historyKey(utilisateurConnecte?.id, projectId);
    // Synchroniser l'état affiché avec l'historique local lors d'un changement de projet.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setMessages(JSON.parse(localStorage.getItem(key) || "[]")); } catch { setMessages([]); }
    setSelectedLines([]);
  }, [utilisateurConnecte?.id, projectId]);

  const save = (rows) => {
    setMessages(rows);
    localStorage.setItem(historyKey(utilisateurConnecte?.id, projectId), JSON.stringify(rows.slice(-30)));
  };

  const ask = async (event) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;
    const pending = [...messages, { role: "user", content: prompt }];
    save(pending);
    setInput("");
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const result = await demanderAssistantIA({ messages: pending.slice(-10), projectId });
      save([...pending, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setError(err.message || "Assistant IA indisponible.");
    } finally { setLoading(false); }
  };

  const copy = async (content) => {
    try { await navigator.clipboard.writeText(content); setNotice("Réponse copiée."); }
    catch { setNotice("Copie impossible dans ce navigateur."); }
  };

  const importTasks = async () => {
    if (!canImport || !projectId || !selectedLines.length) return;
    if (!window.confirm(`Ajouter ${selectedLines.length} tâche(s) au projet « ${selectedProject?.titre} » ?`)) return;
    try {
      for (const line of selectedLines) {
        await ajouterTache({ project_id: Number(projectId), title: line.slice(0, 200), description: "Proposition issue de l’assistant IA. À valider par l’équipe.", priority: "NORMAL" });
      }
      setSelectedLines([]);
      setNotice("Tâches sélectionnées enregistrées dans le projet.");
    } catch (err) { setError(err.message || "Import impossible."); }
  };

  return <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] shadow-sm">
    <header className="border-b border-[var(--tm-border)] p-5"><h1 className="text-2xl font-bold">Assistant IA</h1><p className="mt-1 text-sm opacity-70">Préparez des plans, des tâches et des critères de réussite. Les suggestions ne sont jamais enregistrées sans votre action.</p>
      <label className="mt-4 block max-w-md text-sm font-medium">Contexte projet<select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--tm-border)] bg-[var(--tm-bg)] p-3"><option value="">Aucun projet</option>{projects.map((p) => <option value={p.id} key={p.id}>{p.titre}</option>)}</select></label>
      {!canImport && <p className="mt-2 text-xs opacity-70">L’import des tâches est réservé au chef de projet.</p>}
    </header>
    {error && <p role="alert" className="m-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">{error}</p>}
    {notice && <p role="status" className="mx-4 mt-3 text-sm text-green-700 dark:text-green-300">{notice}</p>}
    <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
      {messages.length === 0 && <div className="mx-auto max-w-xl py-12 text-center"><p className="font-semibold">Comment avancer sur votre projet ?</p><p className="mt-2 text-sm opacity-70">Exemples : « Décompose cet objectif en étapes » ou « Identifie les principaux risques ».</p></div>}
      {messages.map((message, index) => <article key={`${index}-${message.role}`} className={`rounded-2xl p-4 ${message.role === "user" ? "ml-auto max-w-[90%] bg-blue-50 dark:bg-blue-950/50" : "mr-auto max-w-full bg-[var(--tm-bg)]"}`}>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide opacity-60">{message.role === "user" ? "Vous" : "Assistant de projet"}</p>
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</div>
        {message.role === "assistant" && <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[var(--tm-border)] pt-3">
          <button type="button" onClick={() => copy(message.content)} className="text-xs font-medium text-blue-700 underline dark:text-blue-300">Copier</button>
          {canImport && projectId && <button type="button" onClick={() => { const lines = message.content.split("\n").map((line) => line.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, "")).filter((line) => line.length > 3 && line.length <= 200); setSelectedLines(lines); }} className="text-xs font-medium text-blue-700 underline dark:text-blue-300">Choisir des lignes à ajouter comme tâches</button>}
        </div>}
        {message.role === "assistant" && selectedLines.length > 0 && index === messages.length - 1 && <div className="mt-3 space-y-2 rounded-xl border border-[var(--tm-border)] p-3">
          <p className="text-xs font-semibold">Sélectionnez les propositions à enregistrer</p>
          {selectedLines.map((line) => <label key={line} className="flex gap-2 text-sm"><input type="checkbox" checked={selectedLines.includes(line)} onChange={(e) => setSelectedLines((rows) => e.target.checked ? rows : rows.filter((value) => value !== line))} />{line}</label>)}
          <button type="button" onClick={importTasks} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Ajouter les éléments sélectionnés</button>
        </div>}
      </article>)}
      {loading && <p className="text-sm opacity-70" role="status">L’assistant prépare une réponse…</p>}
    </div>
    <form onSubmit={ask} className="flex items-end gap-2 border-t border-[var(--tm-border)] p-3 sm:p-4"><textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} maxLength={4000} placeholder="Demandez un plan, des étapes ou une analyse de risques…" className="min-h-12 flex-1 resize-y rounded-xl border border-[var(--tm-border)] bg-[var(--tm-bg)] p-3 text-sm" /><button disabled={loading || !input.trim()} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Envoyer</button></form>
  </main>;
}
