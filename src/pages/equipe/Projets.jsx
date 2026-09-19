import React, { useState, useEffect } from "react";
import {
  getProjets,
  ajouterProjet,
  modifierProjet,
  supprimerProjet,
  getUtilisateurs,
} from "../../services/api";
import "../Projets.css";

export default function Projets() {
  const [projets, setProjets] = useState([]);
  const [membres, setMembres] = useState([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("En cours");
  const [responsable, setResponsable] = useState("");
  const [erreur, setErreur] = useState("");

  const chargerDonnees = async () => {
    try {
      const listeProjets = await getProjets();
      const listeMembres = await getUtilisateurs();
      setProjets(listeProjets);
      setMembres(listeMembres);
    } catch (err) {
      setErreur("Erreur lors du chargement des données.");
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const handleAjouter = async (e) => {
    e.preventDefault();
    if (!titre) return;
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
    } catch (err) {
      setErreur("Erreur lors de la création du projet.");
    }
  };

  const handleChangerStatut = async (id, nouveauStatut) => {
    try {
      await modifierProjet(id, { statut: nouveauStatut });
      chargerDonnees();
    } catch (err) {
      setErreur("Erreur lors du changement de statut.");
    }
  };

  const handleSupprimer = async (id) => {
    try {
      await supprimerProjet(id);
      chargerDonnees();
    } catch (err) {
      setErreur("Erreur lors de la suppression.");
    }
  };

  const getBadgeClass = (s) => {
    if (s === "Terminé") return "badge-termine";
    if (s === "En cours") return "badge-en-cours";
    return "badge-en-attente";
  };

  return (
    <div className="projets-container">
      <h2 className="title">Gestion des Projets</h2>

      {erreur && <div style={{ color: "#e11d48", marginBottom: "12px" }}>{erreur}</div>}

      {/* Formulaire d'ajout */}
      <div className="form-card">
        <form onSubmit={handleAjouter} className="form-grid">
          <div>
            <input
              className="form-input"
              type="text"
              placeholder="Titre du projet"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />
          </div>

          <div>
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
          </div>

          <div className="form-grid-full">
            <textarea
              className="form-textarea"
              placeholder="Description du projet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-grid-full">
            <select
              className="form-select"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
            >
              <option value="En cours">En cours</option>
              <option value="En attente">En attente</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          <button type="submit" className="btn-add">
            Créer le projet
          </button>
        </form>
      </div>

      {/* Liste des cartes projets */}
      <div className="projets-grid">
        {projets.map((p) => (
          <div key={p.id} className="projet-card">
            <div>
              <div className="projet-header">
                <span className="projet-title">{p.titre}</span>
                <span className={`badge-statut ${getBadgeClass(p.statut)}`}>
                  {p.statut}
                </span>
              </div>
              <p className="projet-desc">{p.description || "Aucune description."}</p>
              <p className="projet-responsable">👤 Responsable : {p.responsable}</p>
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
              <button
                className="btn-delete"
                onClick={() => handleSupprimer(p.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}