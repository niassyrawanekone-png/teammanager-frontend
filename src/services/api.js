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

// ================= UTILISATEURS / MEMBRES =================

export async function getUtilisateurs() {
  const reponse = await fetch(`${API_URL}/utilisateurs/`, {
    headers: getHeaders(),
  });
  return await lireReponse(reponse, "Impossible de récupérer les utilisateurs.");
}

export async function ajouterUtilisateur({ nom, email, password, motDePasse }) {
  const reponse = await fetch(`${API_URL}/utilisateurs/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ nom, email, password: password || motDePasse }),
  });
  return await lireReponse(reponse, "Impossible d'ajouter cet utilisateur.");
}

export async function modifierRoleUtilisateur(userId, role) {
  const reponse = await fetch(`${API_URL}/utilisateurs/${userId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ role }),
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

// ================= ESPACE DE PARTAGE =================

export async function getMessagesPartage() {
  const reponse = await fetch(`${API_URL}/partage/`, {
    headers: getHeaders(),
  });
  return await lireReponse(reponse, "Impossible de récupérer les messages.");
}

export async function publierMessagePartage(contenu) {
  const reponse = await fetch(`${API_URL}/partage/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ contenu }),
  });
  return await lireReponse(reponse, "Impossible de publier le message.");
}

export async function supprimerMessagePartage(messageId) {
  const reponse = await fetch(`${API_URL}/partage/${messageId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  await lireReponse(reponse, "Impossible de supprimer le message.");
  return true;
}