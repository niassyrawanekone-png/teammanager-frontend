import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ajouterAudioMessage,
  ajouterPhotoMessage,
  getMessagesPartage,
  getPieceJointePartage,
  getProjets,
  publierMessagePartage,
  supprimerMessagePartage,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { normalizeRole } from "../services/roles";

const dateMessage = (value) => new Date(value).toLocaleString();

function AttachmentMedia({ attachment }) {
  const [resource, setResource] = useState({ url: "", src: "", error: "" });
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    if (attachment.url?.startsWith("/partage/attachments/")) {
      getPieceJointePartage(attachment.url).then((url) => {
        if (!active) {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url.startsWith("blob:") ? url : "";
        setResource({ url: attachment.url, src: url, error: "" });
      }).catch(() => {
        if (active) setResource({ url: attachment.url, src: "", error: "Impossible de charger cette pièce jointe." });
      });
    }
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.url]);
  const isPrivateAttachment = attachment.url?.startsWith("/partage/attachments/");
  const displaySrc = isPrivateAttachment
    ? resource.url === attachment.url ? resource.src : ""
    : attachment.url || "";
  if (!attachment.url) return <p className="mt-2 text-xs opacity-70">Le lien privé de cette pièce jointe est indisponible.</p>;
  if (!displaySrc) return <p className="mt-2 text-xs opacity-70">{isPrivateAttachment && resource.url === attachment.url && resource.error ? resource.error : "Chargement de la pièce jointe…"}</p>;
  if (attachment.content_type?.startsWith("audio/")) {
    return <div className="mt-2"><p className="mb-1 text-xs opacity-70">Message vocal</p><audio controls preload="metadata" src={displaySrc} className="max-w-full">Votre navigateur ne peut pas lire ce message vocal.</audio></div>;
  }
  return <a href={displaySrc} target="_blank" rel="noreferrer" className="mt-2 block"><img src={displaySrc} alt={attachment.original_name} loading="lazy" className="max-h-72 rounded-lg object-contain" /></a>;
}

export default function EspacePartage() {
  const { utilisateurConnecte } = useAuth();
  const [projets, setProjets] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [conversation, setConversation] = useState("team");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const previewRef = useRef("");
  const [voice, setVoice] = useState(null);
  const [voicePreview, setVoicePreview] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const voicePreviewRef = useRef("");
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const discardRecordingRef = useRef(false);
  const recordingStartedAtRef = useRef(0);
  const recordingTimerRef = useRef(null);
  const textareaRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const isSuper = normalizeRole(utilisateurConnecte?.role) === "SUPER_ADMIN";
  const selectedProjectId = conversation === "project" ? Number(projectId) || null : null;

  const refresh = useCallback(async () => {
    if (conversation === "project" && !selectedProjectId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getMessagesPartage({ conversation, projectId: selectedProjectId });
      setMessages(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Impossible de charger la discussion.");
    } finally {
      setLoading(false);
    }
  }, [conversation, selectedProjectId]);

  useEffect(() => {
    let active = true;
    getProjets().then((items) => { if (active) setProjets(items || []); })
      .catch((err) => { if (active) setError(err.message || "Impossible de charger les projets."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    const interval = window.setInterval(() => { void refresh(); }, 10000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    if (voicePreviewRef.current) URL.revokeObjectURL(voicePreviewRef.current);
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const selectPhoto = (file) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = file ? URL.createObjectURL(file) : "";
    setPreview(previewRef.current);
    setPhoto(file);
  };

  const clearVoicePreview = () => {
    if (voicePreviewRef.current) URL.revokeObjectURL(voicePreviewRef.current);
    voicePreviewRef.current = "";
    setVoicePreview("");
    setVoice(null);
    setRecordSeconds(0);
  };

  const startVoiceRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("L’enregistrement vocal n’est pas pris en charge par ce navigateur.");
      return;
    }
    try {
      clearVoicePreview();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const supportedType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/ogg"]
        .find((type) => MediaRecorder.isTypeSupported(type));
      if (!supportedType) throw new Error("Ce navigateur ne propose pas de format WebM ou Ogg compatible.");
      const recorder = new MediaRecorder(stream, { mimeType: supportedType });
      recorderRef.current = recorder;
      chunksRef.current = [];
      discardRecordingRef.current = false;
      recordingStartedAtRef.current = Date.now();
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onerror = () => setError("Une erreur est survenue pendant l’enregistrement vocal.");
      recorder.onstop = () => {
        if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          chunksRef.current = [];
          return;
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType.split(";")[0] });
        chunksRef.current = [];
        if (!blob.size) { setError("L’enregistrement ne contient aucun son."); return; }
        const url = URL.createObjectURL(blob);
        voicePreviewRef.current = url;
        setVoicePreview(url);
        setVoice(blob);
        setRecordSeconds(Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000)));
      };
      recorder.start();
      setRecording(true);
      setRecordSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordSeconds(Math.floor((Date.now() - recordingStartedAtRef.current) / 1000));
      }, 250);
    } catch (recordError) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecording(false);
      setError(recordError.message || "Impossible d’accéder au microphone.");
    }
  };

  const stopVoiceRecording = (discard = false) => {
    discardRecordingRef.current = discard;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const canDelete = isSuper;
  const title = useMemo(() => conversation === "team" ? "Discussion de l’équipe" :
    projets.find((item) => Number(item.id) === Number(projectId))?.titre || "Discussion de projet", [conversation, projets, projectId]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [text]);

  const send = async (event) => {
    event.preventDefault();
    if ((!text.trim() && !photo && !voice) || recording || (conversation === "project" && !selectedProjectId) || isSuper) return;
    if (photo && photo.size > 5 * 1024 * 1024) {
      setError("La photo dépasse la limite de 5 Mio.");
      return;
    }
    setSending(true);
    setError("");
    let created;
    try {
      created = await publierMessagePartage(text.trim() || (photo ? "Photo jointe" : "Message vocal"), selectedProjectId);
      try {
        if (photo) await ajouterPhotoMessage(created.id, photo);
        if (voice) {
          const extension = voice.type === "audio/ogg" ? "ogg" : "webm";
          await ajouterAudioMessage(created.id, new File([voice], `message-vocal.${extension}`, { type: voice.type }));
        }
      } catch (attachmentError) {
        try {
          await supprimerMessagePartage(created.id);
        } catch (cleanupError) {
          setError(`La pièce jointe a échoué (${attachmentError.message || "erreur inconnue"}) et le message provisoire n’a pas pu être retiré (${cleanupError.message || "erreur inconnue"}).`);
          return;
        }
        setError(`La pièce jointe n’a pas été envoyée et le message provisoire a été retiré : ${attachmentError.message || "erreur inconnue"}`);
        return;
      }
      setText("");
      selectPhoto(null);
      clearVoicePreview();
      await refresh();
    } catch (err) {
      setError(err.message || "L’envoi du message a échoué.");
    } finally {
      setSending(false);
    }
  };

  const remove = async (message) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      await supprimerMessagePartage(message.id);
      await refresh();
    } catch (err) {
      setError(err.message || "Impossible de supprimer le message.");
    }
  };

  return (
    <section className="mx-auto flex h-[min(78vh,850px)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--tm-border)] p-4 sm:p-5">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm opacity-70">Messages persistants, actualisés automatiquement.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--tm-border)] p-1">
            <button type="button" onClick={() => setConversation("team")} className={`rounded-md px-3 py-2 text-sm ${conversation === "team" ? "bg-blue-600 text-white" : ""}`}>Équipe</button>
            <button type="button" onClick={() => setConversation("project")} className={`rounded-md px-3 py-2 text-sm ${conversation === "project" ? "bg-blue-600 text-white" : ""}`}>Projet</button>
          </div>
          {conversation === "project" && (
            <select aria-label="Projet de la discussion" className="max-w-48 rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface)] p-2" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              <option value="">Choisir un projet</option>
              {projets.map((project) => <option key={project.id} value={project.id}>{project.titre}</option>)}
            </select>
          )}
        </div>
      </header>
      {error && <p className="mx-4 mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200" role="alert">{error}</p>}
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {conversation === "project" && !selectedProjectId ? <p className="py-12 text-center opacity-65">Choisissez un projet pour ouvrir sa discussion.</p> :
          loading && messages.length === 0 ? <p className="py-12 text-center opacity-65">Chargement des messages…</p> :
            messages.length === 0 ? <p className="py-12 text-center opacity-65">Aucun message. Lancez la conversation de l’équipe.</p> :
              messages.map((message) => {
                const own = message.auteur_id === utilisateurConnecte?.id;
                return <article key={message.id} className={`max-w-[92%] rounded-2xl border border-[var(--tm-border)] p-3 sm:max-w-[75%] ${own ? "ml-auto bg-blue-50 dark:bg-blue-950/40" : "bg-[var(--tm-bg)]"}`}>
                  <div className="mb-1 flex items-center justify-between gap-4 text-xs opacity-70"><strong>{message.auteur_nom || "Utilisateur"}</strong><time>{dateMessage(message.created_at)}</time></div>
                  <p className="whitespace-pre-wrap break-words text-sm">{message.contenu}</p>
                  {(message.attachments || []).map((attachment) => <AttachmentMedia key={attachment.id} attachment={attachment} />)}
                  {canDelete && <button type="button" onClick={() => remove(message)} className="mt-2 text-xs text-red-600 underline">Supprimer</button>}
                </article>;
              })}
      </div>
      {isSuper ? <div className="border-t border-[var(--tm-border)] p-4 text-center text-sm opacity-70">Le super administrateur consulte les discussions en lecture seule.</div> :
        <form onSubmit={send} className="border-t border-[var(--tm-border)] p-3 sm:p-4">
          {preview && <div className="mb-3 flex items-start gap-3"><img src={preview} alt="Aperçu de la photo jointe" className="h-20 w-20 rounded-lg object-cover" /><button type="button" className="text-sm text-red-600 underline" onClick={() => selectPhoto(null)}>Retirer</button></div>}
          {voicePreview && <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--tm-border)] p-3"><audio controls src={voicePreview}>Votre navigateur ne peut pas lire cet aperçu.</audio><span className="text-xs opacity-70">{recordSeconds} s</span><button type="button" className="text-sm text-red-600 underline" onClick={clearVoicePreview}>Annuler le vocal</button></div>}
          {recording && <p className="mb-2 text-sm text-red-600" role="status" aria-live="polite">Enregistrement en cours · {recordSeconds} s</p>}
          <div className="flex items-end gap-2 rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-bg)] p-2">
            <div className="relative">
              <button type="button" aria-label="Ajouter une pièce jointe" aria-expanded={attachmentMenuOpen} onClick={() => setAttachmentMenuOpen((open) => !open)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-2xl leading-none text-white hover:bg-blue-700">+</button>
              {attachmentMenuOpen && <label className="absolute bottom-12 left-0 z-10 cursor-pointer whitespace-nowrap rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-4 py-3 text-sm shadow-lg">Ajouter une photo<input className="sr-only" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(event) => { selectPhoto(event.target.files?.[0] || null); setAttachmentMenuOpen(false); event.target.value = ""; }} /></label>}
            </div>
            <textarea ref={textareaRef} value={text} onChange={(event) => setText(event.target.value)} rows={1} maxLength={5000} disabled={conversation === "project" && !selectedProjectId} placeholder="Écrire un message…" className="max-h-36 min-h-10 min-w-0 flex-1 resize-none self-center bg-transparent px-2 py-2 text-sm outline-none" />
            {recording ? <button type="button" aria-label="Arrêter l’enregistrement" onClick={() => stopVoiceRecording()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-600 text-white" title="Arrêter l’enregistrement">■</button> : <button type="button" aria-label="Enregistrer un message vocal" onClick={() => void startVoiceRecording()} disabled={sending || (conversation === "project" && !selectedProjectId)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-950" title="Message vocal">🎙</button>}
            <button aria-label="Envoyer le message" disabled={sending || recording || (!text.trim() && !photo && !voice) || (conversation === "project" && !selectedProjectId)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-lg text-white hover:bg-blue-700 disabled:opacity-50">{sending ? "…" : "➤"}</button>
          </div>
          {photo && photo.size > 5 * 1024 * 1024 && <p className="mt-2 text-xs text-red-600">La photo dépasse la limite de 5 Mio.</p>}
        </form>}
    </section>
  );
}
