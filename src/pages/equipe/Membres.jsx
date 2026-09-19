import React, { useState, useEffect } from "react";
import {
  getUtilisateurs,
  ajouterUtilisateur,
  modifierRoleUtilisateur,
  supprimerUtilisateur,
} from "../../services/api";
import "../Equipe.css";

export default function Membres() {
  const [membres, setMembres] = useState([]);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Membre");
  const [erreur, setErreur] = useState("");

  const chargerMembres = async () => {
    try {
      const data = await getUtilisateurs();
      setMembres(data);
    } catch (err) {
      setErreur("Impossible de charger la liste de l'équipe.");
    }
  };

  useEffect(() => {
    chargerMembres();
  }, []);

  const handleAjouter = async (e) => {
    e.preventDefault();
    if (!nom) return;
    try {
      await ajouterUtilisateur({ nom, email, role });
      setNom("");
      setEmail("");
      setRole("Membre");
      chargerMembres();
    } catch (err) {
      setErreur("Erreur lors de l'ajout.");
    }
  };

  const handleSupprimer = async (id) => {
    try {
      await supprimerUtilisateur(id);
      chargerMembres();
    } catch (err) {
      setErreur("Erreur lors de la suppression.");
    }
  };

  const handlePromouvoir = async (id, roleActuel) => {
    const nouveauRole = roleActuel === "Admin" ? "Membre" : "Admin";
    try {
      await modifierRoleUtilisateur(id, nouveauRole);
      chargerMembres();
    } catch (err) {
      setErreur("Erreur lors de la modification du rôle.");
    }
  };

  return (
    <div className="equipe-container">
      <h2 className="title">Gestion des Membres</h2>

      {erreur && <div style={{ color: "#e11d48", marginBottom: "12px" }}>{erreur}</div>}

      {/* Formulaire d'ajout */}
      <div className="form-card">
        <form onSubmit={handleAjouter} className="form-row">
          <input
            className="form-input"
            type="text"
            placeholder="Nom du membre"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Membre">Membre</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit" className="btn-add">Ajouter</button>
        </form>
      </div>

      {/* Liste des cartes membres */}
      <div className="members-grid">
        {membres.map((m) => (
          <div key={m.id} className="member-card">
            <div>
              <div className="member-header">
                <span className="member-name">{m.nom}</span>
                <span className={`badge ${m.role === "Admin" ? "badge-admin" : "badge-membre"}`}>
                  {m.role}
                </span>
              </div>
              <div className="member-email">{m.email || "Aucun email renseigné"}</div>
            </div>

            <div className="actions-row">
              <button
                className="btn-action btn-promote"
                onClick={() => handlePromouvoir(m.id, m.role)}
              >
                {m.role === "Admin" ? "Rétrograder" : "Promouvoir"}
              </button>
              <button
                className="btn-action btn-delete"
                onClick={() => handleSupprimer(m.id)}
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