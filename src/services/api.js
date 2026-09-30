const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://teammanager-fl0y.onrender.com";

// Helper interne pour récupérer les headers d'authentification HTTP
const getAuthHeaders = () => {
  // Récupération du jeton depuis le sessionStorage
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Fonction centralisée d'exécution des requêtes HTTP
async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 🔹 Si le backend répond 401 (Non autorisé / Token expiré)
  if (response.status === 401) {
    sessionStorage.removeItem("token");
    // Redirection automatique vers la page de connexion
    window.location.href = "/connexion";
    throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
  }

  if (!response.ok) {
    let errorMessage = "Une erreur est survenue lors de la requête.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (_) {
      // Ignorer si la réponse d'erreur n'est pas du JSON
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;

  return response.json();
}

/* ================= PROFIL CONNECTÉ ================= */

// Récupère les données de l'utilisateur actuellement connecté
export const getMonProfil = () => request("/me");

/* ================= UTILISATEURS ================= */

export const getUtilisateurs = () => request("/utilisateurs/");

export const ajouterUtilisateur = (donneesMembre) =>
  request("/utilisateurs/", {
    method: "POST",
    body: JSON.stringify(donneesMembre),
  });

export const modifierRoleUtilisateur = (id, role) =>
  request(`/utilisateurs/${id}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });

export const supprimerUtilisateur = (id) =>
  request(`/utilisateurs/${id}`, {
    method: "DELETE",
  });

/* ================= PROJETS ================= */

export const getProjets = () => request("/projets/");

export const ajouterProjet = (donnees) =>
  request("/projets/", {
    method: "POST",
    body: JSON.stringify(donnees),
  });

export const modifierProjet = (id, donnees) =>
  request(`/projets/${id}`, {
    method: "PUT",
    body: JSON.stringify(donnees),
  });

export const supprimerProjet = (id) =>
  request(`/projets/${id}`, {
    method: "DELETE",
  });

/* ================= MODIFICATION PROFIL PERSO ================= */

// Mettre à jour le nom de l'utilisateur connecté
export const modifierMonNom = (nom) =>
  request("/me/nom", {
    method: "PUT",
    body: JSON.stringify({ nom }),
  });

// Changer le mot de passe de l'utilisateur connecté
export const modifierMonMotDePasse = (ancienMotDePasse, nouveauMotDePasse) =>
  request("/me/mot-de-passe", {
    method: "PUT",
    body: JSON.stringify({
      ancien_mot_de_passe: ancienMotDePasse,
      nouveau_mot_de_passe: nouveauMotDePasse,
    }),
  });