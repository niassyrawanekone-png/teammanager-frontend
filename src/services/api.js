// URL de votre backend hébergé sur Render
export const API_URL = import.meta.env.VITE_API_URL || "https://teammanager-fl0y.onrender.com";

/**
 * Helper pour obtenir les headers avec le Token JWT
 */
function getHeaders() {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function lireReponse(reponse, messageErreur) {
  const texte = await reponse.text();
  let data = null;

  if (texte) {
    try {
      data = JSON.parse(texte);
    } catch {
      if (reponse.ok) {
        throw new Error("Le serveur a renvoyé une réponse invalide.");
      }
      data = { detail: texte };
    }
  }

  if (!reponse.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((erreur) => {
          const champ = Array.isArray(erreur.loc) ? erreur.loc.slice(1).join(".") : "";
          return champ ? `${champ}: ${erreur.msg}` : erreur.msg;
        }).join(" ")
      : detail;
    throw new Error(message || messageErreur);
  }

  return data;
}

// ================= AUTHENTIFICATION & PROFIL =================

export async function seConnecter({ email, password, motDePasse }) {
  const pass = password || motDePasse;

  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", pass);

  const reponse = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  const data = await lireReponse(reponse, "Email ou mot de passe incorrect.");

  sessionStorage.setItem("token", data.access_token);
  localStorage.setItem("token", data.access_token);

  const user = await obtenirProfil();
  sessionStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("user", JSON.stringify(user));

  return { token: data.access_token, utilisateur: user };
}

export async function inscrireUtilisateur({ nom, email, password, motDePasse }) {
  const pass = password || motDePasse;

  const reponse = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom, email, password: pass }),
  });

  await lireReponse(reponse, "Erreur lors de l'inscription.");

  return await seConnecter({ email, password: pass });
}

export async function obtenirProfil() {
  const reponse = await fetch(`${API_URL}/me`, {
    headers: getHeaders(),
  });

  return await lireReponse(reponse, "Impossible de récupérer le profil.");
}

export async function modifierProfil(donnees) {
  const reponse = await fetch(`${API_URL}/me`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ nom: donnees.nom }),
  });
  return await lireReponse(reponse, "Impossible de modifier le profil.");
}

export async function modifierMotDePasseUtilisateur({ ancienMotDePasse, nouveauMotDePasse }) {
  const reponse = await fetch(`${API_URL}/me/mot-de-passe`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      ancien_mot_de_passe: ancienMotDePasse,
      nouveau_mot_de_passe: nouveauMotDePasse,
    }),
  });
  return await lireReponse(reponse, "Impossible de modifier le mot de passe.");
}

export async function demanderReinitialisationMotDePasse(email) {
  const reponse = await fetch(`${API_URL}/password/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await lireReponse(reponse, "Impossible de traiter la demande pour le moment.");
}

export async function accepterInvitation({ token, nouveauMotDePasse, confirmation }) {
  const reponse = await fetch(`${API_URL}/invitations/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, nouveau_mot_de_passe: nouveauMotDePasse, confirmation }),
  });
  return await lireReponse(reponse, "Cette invitation est invalide ou expirée.");
}

export async function reinitialiserMotDePasse({ token, nouveauMotDePasse, confirmation }) {
  const reponse = await fetch(`${API_URL}/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      nouveau_mot_de_passe: nouveauMotDePasse,
      confirmation,
    }),
  });
  return await lireReponse(reponse, "Le lien de réinitialisation est invalide ou expiré.");
}

// ================= UTILISATEURS / MEMBRES =================

export async function getUtilisateurs() {
  const reponse = await fetch(`${API_URL}/utilisateurs/`, {
    headers: getHeaders(),
  });
  return await lireReponse(reponse, "Impossible de récupérer les utilisateurs.");
}

export async function ajouterUtilisateur({ prenom, nom, email, role }) {
  const reponse = await fetch(`${API_URL}/utilisateurs/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ prenom, nom, email, role }),
  });
  return await lireReponse(reponse, "Impossible d'ajouter cet utilisateur.");
}

export async function modifierRoleUtilisateur(userId, role, canManageTasks = false) {
  const reponse = await fetch(`${API_URL}/utilisateurs/${userId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ role, can_manage_tasks: canManageTasks }),
  });
  return await lireReponse(reponse, "Impossible de modifier le rôle.");
}

export async function supprimerUtilisateur(userId) {
  const reponse = await fetch(`${API_URL}/utilisateurs/${userId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  await lireReponse(reponse, "Impossible de supprimer cet utilisateur.");
  return true;
}

// ================= PROJETS =================

export async function getProjets() {
  const reponse = await fetch(`${API_URL}/projets/`, {
    headers: getHeaders(),
  });
  return await lireReponse(reponse, "Impossible de récupérer les projets.");
}

export async function ajouterProjet(projet) {
  const reponse = await fetch(`${API_URL}/projets/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(projet),
  });
  return await lireReponse(reponse, "Impossible de créer le projet.");
}

export async function modifierProjet(projetId, projet) {
  const reponse = await fetch(`${API_URL}/projets/${projetId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(projet),
  });
  return await lireReponse(reponse, "Impossible de modifier le projet.");
}

export async function supprimerProjet(projetId) {
  const reponse = await fetch(`${API_URL}/projets/${projetId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  await lireReponse(reponse, "Impossible de supprimer le projet.");
  return true;
}

// ================= TÂCHES & NOTIFICATIONS =================

export async function getTaches(projectId) {
  const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : "";
  const reponse = await fetch(`${API_URL}/tasks/${query}`, { headers: getHeaders() });
  return await lireReponse(reponse, "Impossible de récupérer les tâches.");
}

export async function ajouterTache(tache) {
  const reponse = await fetch(`${API_URL}/tasks/`, {
    method: "POST", headers: getHeaders(), body: JSON.stringify(tache),
  });
  return await lireReponse(reponse, "Impossible de créer cette tâche.");
}

export async function modifierTache(tacheId, tache) {
  const reponse = await fetch(`${API_URL}/tasks/${tacheId}`, {
    method: "PUT", headers: getHeaders(), body: JSON.stringify(tache),
  });
  return await lireReponse(reponse, "Impossible de modifier cette tâche.");
}

export async function modifierEtatTache(tacheId, status) {
  const reponse = await fetch(`${API_URL}/tasks/${tacheId}/status`, {
    method: "PATCH", headers: getHeaders(), body: JSON.stringify({ status }),
  });
  return await lireReponse(reponse, "Impossible de modifier l'état de cette tâche.");
}

export async function supprimerTache(tacheId) {
  const reponse = await fetch(`${API_URL}/tasks/${tacheId}`, { method: "DELETE", headers: getHeaders() });
  await lireReponse(reponse, "Impossible de supprimer cette tâche.");
  return true;
}

export async function getNotifications() {
  const reponse = await fetch(`${API_URL}/notifications/`, { headers: getHeaders() });
  return await lireReponse(reponse, "Impossible de récupérer les notifications.");
}

export async function getNotificationsNonLues() {
  const reponse = await fetch(`${API_URL}/notifications/unread-count`, { headers: getHeaders() });
  return await lireReponse(reponse, "Impossible de récupérer le compteur de notifications.");
}

export async function demanderAssistantIA({ messages, projectId }) {
  const reponse = await fetch(`${API_URL}/assistant/chat`, {
    method: "POST", headers: getHeaders(),
    body: JSON.stringify({ messages, project_id: projectId || null }),
  });
  return await lireReponse(reponse, "L'assistant IA est indisponible.");
}

export async function marquerNotificationLue(notificationId) {
  const reponse = await fetch(`${API_URL}/notifications/${notificationId}/read`, { method: "POST", headers: getHeaders() });
  return await lireReponse(reponse, "Impossible de marquer la notification comme lue.");
}

// ================= ESPACE DE PARTAGE =================

export async function getMessagesPartage({ conversation = "all", projectId } = {}) {
  const query = new URLSearchParams({ conversation });
  if (projectId) query.set("project_id", projectId);
  const reponse = await fetch(`${API_URL}/partage/?${query}`, {
    headers: getHeaders(),
  });
  return await lireReponse(reponse, "Impossible de récupérer les messages.");
}

export async function publierMessagePartage(contenu, projectId = null) {
  const reponse = await fetch(`${API_URL}/partage/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ contenu, project_id: projectId }),
  });
  return await lireReponse(reponse, "Impossible de publier le message.");
}

export async function compterMessagesNonLus({ conversation = "all", projectId } = {}) {
  const query = new URLSearchParams({ conversation });
  if (projectId) query.set("project_id", projectId);
  const reponse = await fetch(`${API_URL}/partage/unread-count?${query}`, { headers: getHeaders() });
  return await lireReponse(reponse, "Impossible de récupérer les messages non lus.");
}

export async function marquerMessagesLus(messageIds) {
  const reponse = await fetch(`${API_URL}/partage/read`, {
    method: "POST", headers: getHeaders(), body: JSON.stringify({ message_ids: messageIds }),
  });
  return await lireReponse(reponse, "Impossible de marquer les messages comme lus.");
}

export async function ajouterPhotoMessage(messageId, file) {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const reponse = await fetch(`${API_URL}/partage/${messageId}/photos`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: (() => { const form = new FormData(); form.append("file", file); return form; })(),
  });
  return await lireReponse(reponse, "Impossible d'envoyer cette image.");
}

export async function ajouterAudioMessage(messageId, file) {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const form = new FormData();
  form.append("file", file, file.name || "message-vocal.webm");
  const reponse = await fetch(`${API_URL}/partage/${messageId}/audio`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return await lireReponse(reponse, "Impossible d'envoyer le message vocal.");
}

export async function getPieceJointePartage(url) {
  const reponse = await fetch(`${API_URL}${url}`, { headers: getHeaders() });
  if (!reponse.ok) await lireReponse(reponse, "Impossible de charger cette pièce jointe.");
  if (reponse.headers.get("content-type")?.includes("application/json")) {
    const data = await lireReponse(reponse, "Impossible de charger cette pièce jointe.");
    if (!data.url) throw new Error("Le lien de cette pièce jointe est indisponible.");
    return data.url;
  }
  return URL.createObjectURL(await reponse.blob());
}

export async function supprimerMessagePartage(messageId) {
  const reponse = await fetch(`${API_URL}/partage/${messageId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  await lireReponse(reponse, "Impossible de supprimer le message.");
  return true;
}

// ================= ADMINISTRATION GLOBALE =================

async function adminRequest(path, options = {}, fallback = "Opération administrative impossible.") {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  return lireReponse(response, fallback);
}

export const getAdminOverview = () => adminRequest("/admin/overview", {}, "Impossible de charger les statistiques globales.");
export const getAdminUsers = () => adminRequest("/admin/users", {}, "Impossible de charger les utilisateurs.");
export const deleteAdminUser = (userId, deleteWorkspace = false) => adminRequest(`/admin/users/${userId}`, {
  method: "DELETE", body: JSON.stringify({ delete_workspace: deleteWorkspace }),
}, "Impossible de supprimer ce compte.");
export const getAdminWorkspaces = () => adminRequest("/admin/workspaces", {}, "Impossible de charger les espaces.");
export const getAdminProjects = () => adminRequest("/admin/projects", {}, "Impossible de charger les projets.");

export const createAdminWorkspace = (workspace) => adminRequest("/admin/workspaces", {
  method: "POST", body: JSON.stringify(workspace),
}, "Impossible de créer cet espace.");

export const updateAdminWorkspace = (workspaceId, changes) => adminRequest(`/admin/workspaces/${workspaceId}`, {
  method: "PATCH", body: JSON.stringify(changes),
}, "Impossible de modifier cet espace.");

export const updateAdminMemberRole = (userId, role, canManageTasks) => adminRequest(`/admin/users/${userId}/role`, {
  method: "PATCH", body: JSON.stringify({ role, can_manage_tasks: canManageTasks }),
}, "Impossible de modifier ce rôle.");

export const createAdminProject = (project) => adminRequest("/admin/projects", {
  method: "POST", body: JSON.stringify(project),
}, "Impossible de créer ce projet.");

export const updateAdminProject = (projectId, project) => adminRequest(`/admin/projects/${projectId}`, {
  method: "PUT", body: JSON.stringify(project),
}, "Impossible de modifier ce projet.");
