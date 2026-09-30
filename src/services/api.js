const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://teammanager-fl0y.onrender.com";

// Helper interne pour récupérer les headers d'authentification HTTP
const getAuthHeaders = () => {
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

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "/connexion";
    throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
  }

  if (!response.ok) {
    let errorMessage = "Une erreur est survenue lors de la requête.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;

  return response.json();
}

/* ================= AUTHENTIFICATION ================= */

export const inscrireUtilisateur = (donnees) =>
  request("/register", {
    method: "POST",
    body: JSON.stringify(donnees),
  });

/* ================= PROFIL CONNECTÉ ================= */

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

export const modifierMonNom = (nom) =>
  request("/me/nom", {
    method: "PUT",
    body: JSON.stringify({ nom }),
  });

export const modifierMonMotDePasse = (ancienMotDePasse, nouveauMotDePasse) =>
  request("/me/mot-de-passe", {
    method: "PUT",
    body: JSON.stringify({
      ancien_mot_de_passe: ancienMotDePasse,
      nouveau_mot_de_passe: nouveauMotDePasse,
    }),
  });