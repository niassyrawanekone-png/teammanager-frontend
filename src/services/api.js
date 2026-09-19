const API_URL = "http://127.0.0.1:8000/api/utilisateurs";

export const getUtilisateurs = async () => {
  const response = await fetch(`${API_URL}/`);
  if (!response.ok) throw new Error("Erreur lors du chargement des membres");
  return response.json();
};

export const ajouterUtilisateur = async (donnees) => {
  const response = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donnees),
  });
  if (!response.ok) throw new Error("Erreur lors de l'ajout");
  return response.json();
};

export const modifierRoleUtilisateur = async (id, role) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification");
  return response.json();
};

export const supprimerUtilisateur = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression");
  return response.json();
};

const API_PROJETS_URL = "http://127.0.0.1:8000/api/projets";

export const getProjets = async () => {
  const response = await fetch(`${API_PROJETS_URL}/`);
  if (!response.ok) throw new Error("Erreur lors du chargement des projets");
  return response.json();
};

export const ajouterProjet = async (donnees) => {
  const response = await fetch(`${API_PROJETS_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donnees),
  });
  if (!response.ok) throw new Error("Erreur lors de la création du projet");
  return response.json();
};

export const modifierProjet = async (id, donnees) => {
  const response = await fetch(`${API_PROJETS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donnees),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification");
  return response.json();
};

export const supprimerProjet = async (id) => {
  const response = await fetch(`${API_PROJETS_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression");
  return response.json();
};