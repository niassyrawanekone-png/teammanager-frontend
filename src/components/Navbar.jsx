import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  compterMessagesNonLus, getNotifications, getNotificationsNonLues,
  marquerNotificationLue,
} from "../services/api";

const activeLink = ({ isActive }) => isActive
  ? "text-sm font-semibold text-blue-600 dark:text-blue-400"
  : "text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400";
const mobileLink = ({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-blue-50 font-semibold text-blue-700 dark:bg-gray-800 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"}`;

export default function Navbar() {
  const { estConnecte, estAdmin, seDeconnecter } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [noticeError, setNoticeError] = useState("");

  const refreshCounts = async () => {
    try {
      const [messages, notices] = await Promise.all([compterMessagesNonLus(), getNotificationsNonLues()]);
      setUnreadMessages(messages?.count || 0);
      setUnreadNotifications(notices?.count || 0);
    } catch { /* L'indisponibilité des compteurs n'empêche pas la navigation. */ }
  };

  useEffect(() => {
    if (!estConnecte) {
      return undefined;
    }
    void Promise.resolve().then(refreshCounts);
    const timer = window.setInterval(refreshCounts, 30000);
    return () => window.clearInterval(timer);
  }, [estConnecte]);

  const openNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (!next) return;
    try {
      setNotifications(await getNotifications());
      setNoticeError("");
    } catch (error) { setNoticeError(error.message || "Notifications indisponibles."); }
  };

  const markRead = async (item) => {
    try {
      await marquerNotificationLue(item.id);
      setNotifications((rows) => rows.map((row) => row.id === item.id ? { ...row, is_read: true } : row));
      await refreshCounts();
    } catch (error) { setNoticeError(error.message || "Mise à jour impossible."); }
  };

  const logout = () => {
    seDeconnecter();
    setMobileOpen(false);
    setUnreadMessages(0);
    setUnreadNotifications(0);
    navigate("/connexion");
  };

  const links = <>
    <NavLink to="/equipe" end className={activeLink}>Équipe</NavLink>
    <NavLink to="/equipe/projets" className={activeLink}>Projets</NavLink>
    {estConnecte && <NavLink to="/espace-partage" className={activeLink}>Discussions {unreadMessages > 0 && <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">{unreadMessages}</span>}</NavLink>}
    {estConnecte && <NavLink to="/assistant-ia" className={activeLink}>Assistant IA</NavLink>}
    {estConnecte && estAdmin && <NavLink to="/administration" className={activeLink}>Administration</NavLink>}
    <NavLink to="/parametres" className={activeLink}>Paramètres</NavLink>
    <NavLink to="/apropos" className={activeLink}>À propos</NavLink>
    {estConnecte && <NavLink to="/profil" className={activeLink}>Mon profil</NavLink>}
  </>;

  return <nav className="sticky top-0 z-50 border-b border-[var(--tm-border)] bg-[var(--tm-surface)] shadow-sm">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <Link to="/" className="flex shrink-0 items-center gap-2"><span className="text-2xl" aria-hidden="true">⚡</span><span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-indigo-400">TeamManager</span></Link>
      <div className="hidden items-center gap-4 md:flex">{links}
        {estConnecte ? <button type="button" onClick={openNotifications} className="relative rounded-lg border border-[var(--tm-border)] px-3 py-2 text-sm" aria-expanded={showNotifications}>Notifications{unreadNotifications > 0 && <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">{unreadNotifications}</span>}</button> :
          <NavLink to="/connexion" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">Connexion</NavLink>}
        {estConnecte && <button type="button" onClick={logout} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">Déconnexion</button>}
      </div>
      <button type="button" className="rounded-lg p-2 md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileOpen}>{mobileOpen ? "✕" : "☰"}</button>
    </div>
    {mobileOpen && <div className="space-y-1 border-t border-[var(--tm-border)] px-4 py-3 md:hidden">{links && <>
      <NavLink to="/equipe" end className={mobileLink} onClick={() => setMobileOpen(false)}>Équipe</NavLink>
      <NavLink to="/equipe/projets" className={mobileLink} onClick={() => setMobileOpen(false)}>Projets</NavLink>
      {estConnecte && <NavLink to="/espace-partage" className={mobileLink} onClick={() => setMobileOpen(false)}>Discussions {unreadMessages > 0 && <span className="ml-1 rounded-full bg-blue-600 px-1.5 text-white">{unreadMessages}</span>}</NavLink>}
      {estConnecte && <NavLink to="/assistant-ia" className={mobileLink} onClick={() => setMobileOpen(false)}>Assistant IA</NavLink>}
      {estConnecte && estAdmin && <NavLink to="/administration" className={mobileLink} onClick={() => setMobileOpen(false)}>Administration</NavLink>}
      <NavLink to="/parametres" className={mobileLink} onClick={() => setMobileOpen(false)}>Paramètres</NavLink>
      <NavLink to="/apropos" className={mobileLink} onClick={() => setMobileOpen(false)}>À propos</NavLink>
      {estConnecte && <><NavLink to="/profil" className={mobileLink} onClick={() => setMobileOpen(false)}>Mon profil</NavLink><button type="button" onClick={openNotifications} className="w-full rounded-lg px-3 py-2 text-left text-sm">Notifications {unreadNotifications > 0 && <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-white">{unreadNotifications}</span>}</button><button type="button" onClick={logout} className="w-full rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">Déconnexion</button></>}
      {!estConnecte && <NavLink to="/connexion" className={mobileLink} onClick={() => setMobileOpen(false)}>Connexion</NavLink>}
    </>}</div>}
    {showNotifications && estConnecte && <aside className="absolute right-4 top-16 z-[60] max-h-[70vh] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-3 shadow-xl" aria-label="Notifications">
      <div className="flex items-center justify-between border-b border-[var(--tm-border)] pb-2"><h2 className="font-semibold">Notifications</h2><button type="button" onClick={() => setShowNotifications(false)} aria-label="Fermer">×</button></div>
      {noticeError && <p role="alert" className="py-2 text-sm text-red-600">{noticeError}</p>}
      {notifications.length === 0 ? <p className="py-5 text-center text-sm opacity-65">Aucune notification.</p> : notifications.map((item) => <article key={item.id} className={`border-b border-[var(--tm-border)] p-3 text-sm ${item.is_read ? "opacity-60" : ""}`}><p className="font-semibold">{item.title}</p><p className="mt-1 whitespace-pre-wrap">{item.body}</p><time className="text-xs opacity-60">{new Date(item.created_at).toLocaleString()}</time>{!item.is_read && <button type="button" onClick={() => markRead(item)} className="ml-3 text-xs text-blue-600 underline">Marquer comme lue</button>}</article>)}
    </aside>}
  </nav>;
}
