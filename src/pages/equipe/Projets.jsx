import React, { useState, useEffect } from "react";
import {
  getProjets,
  ajouterProjet,
  modifierProjet,
  supprimerProjet,
  getUtilisateurs,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import "../Projets.css";

export default function Projets() {
  const [projets, setProjets] = useState([]);
  const [membres, setMembres] = useState([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("En cours");
  const [responsable, setResponsable] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "success" });

  // 🔹 Récupération du rôle depuis le contexte d'authentification
  const { estAdmin } = useAuth();

  const afficherToast = (message, type = "success") => {
    const toutToastActif = localStorage.getItem("notifications") !== "false";
    if (toutToastActif) {
      setNotification({ message, type });
    }
  };

  const masquerToast = () => {
    setNotification({ message: "", type: "success" });
  };

  const chargerDonnees = async () => {
    try {
      const [projetsData, membresData] = await Promise.all([
        getProjets(),
        getUtilisateurs(),
      ]);
      setProjets(projetsData);
      setMembres(membresData);
    } catch (err) {
      afficherToast(err.message || "Erreur de chargement des données.", "error");
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const handleAjouterProjet = async (e) => {
    e.preventDefault();
    if (!titre.trim()) return;

    try {
      await ajouterProjet({
        titre,
        description,
        statut,
        responsable: responsable || "Non assigné",
      });
      setTitre("");
      setDescription("");
      setStatut("En cours");
      setResponsable("");
      chargerDonnees();
      afficherToast("Projet créé avec succès !", "success");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la création du projet.", "error");
    }
  };

  const handleChangerStatut = async (id, nouveauStatut) => {
    try {
      await modifierProjet(id, { statut: nouveauStatut });
      chargerDonnees();
      afficherToast("Statut du projet mis à jour.", "success");
    } catch (err) {
      afficherToast(err.message || "Erreur de mise à jour.", "error");
    }
  };

  const handleSupprimerProjet = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    try {
      await supprimerProjet(id);
      chargerDonnees();
      afficherToast("Projet supprimé.", "info");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la suppression.", "error");
    }
  };

  return (
    <div className="projets-container">
      <Toast
        message={notification.message}
        type={notification.type}
        onClose={masquerToast}
      />

      <h2 className="title">Gestion des Projets</h2>

      {/* 🔒 Seul un ADMIN peut créer un nouveau projet */}
      {estAdmin && (
        <div className="form-card">
          <form onSubmit={handleAjouterProjet} className="form-grid">
            <input
              className="form-input"
              type="text"
              placeholder="Titre du projet"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />
            <select
              className="form-select"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            >
              <option value="">-- Choisir un responsable --</option>
              {membres.map((m) => (
                <option key={m.id} value={m.nom}>
                  {m.nom}
                </option>
              ))}
            </select>

            <textarea
              className="form-textarea form-grid-full"
              placeholder="Description du projet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              className="form-select"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
            >
              <option value="En cours">En cours</option>
              <option value="En attente">En attente</option>
              <option value="Terminé">Terminé</option>
            </select>

            <button type="submit" className="btn-add">
              Créer le projet
            </button>
          </form>
        </div>
      )}

      {/* Cartes des Projets */}
      <div className="projets-grid">
        {projets.length === 0 ? (
          <p style={{ color: "#64748b" }}>Aucun projet enregistré.</p>
        ) : (
          projets.map((p) => (
            <div key={p.id} className="projet-card">
              <div>
                <div className="projet-header">
                  <span className="projet-title">{p.titre}</span>
                  <span
                    className={`badge-statut ${
                      p.statut === "Terminé"
                        ? "badge-termine"
                        : p.statut === "En cours"
                        ? "badge-en-cours"
                        : "badge-en-attente"
                    }`}
                  >
                    {p.statut}
                  </span>
                </div>
                <p className="projet-desc">
                  {p.description || "Aucune description renseignée."}
                </p>
                <p className="projet-responsable">
                  👤 Responsable : <strong>{p.responsable}</strong>
                </p>
              </div>

              <div className="actions-row">
                <select
                  className="select-statut"
                  value={p.statut}
                  onChange={(e) => handleChangerStatut(p.id, e.target.value)}
                >
                  <option value="En cours">En cours</option>
                  <option value="En attente">En attente</option>
                  <option value="Terminé">Terminé</option>
                </select>

                {/* 🔒 Seul un ADMIN peut supprimer un projet */}
                {estAdmin && (
                  <button
                    className="btn-delete"
                    onClick={() => handleSupprimerProjet(p.id)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}