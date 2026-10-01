import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getUtilisateurs,
  ajouterUtilisateur,
  modifierRoleUtilisateur,
  supprimerUtilisateur,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import "../equipe.css";

export default function Membres() {
  const [membres, setMembres] = useState([]);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Membre");
  const [recherche, setRecherche] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "success" });

  // Récupération du rôle administrateur depuis le contexte d'authentification
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

  const chargerMembres = async () => {
    try {
      const data = await getUtilisateurs();
      if (Array.isArray(data)) {
        setMembres(data);
      }
    } catch (err) {
      afficherToast(err.message || "Impossible de charger la liste de l'équipe.", "error");
    }
  };

  useEffect(() => {
    chargerMembres();
  }, []);

  const handleAjouter = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim()) return;

    try {
      // On envoie un mot de passe par défaut ("Team2026!") exigé par le backend
      await ajouterUtilisateur({
        nom: nom.trim(),
        email: email.trim(),
        password: "Team2026!",
        role: role,
      });

      setNom("");
      setEmail("");
      setRole("Membre");
      chargerMembres();
      afficherToast("Membre ajouté avec succès (mot de passe temporaire : Team2026!)", "success");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de l'ajout du membre.", "error");
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce membre ?")) return;
    try {
      await supprimerUtilisateur(id);
      chargerMembres();
      afficherToast("Membre supprimé avec succès.", "info");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la suppression.", "error");
    }
  };

  const handlePromouvoir = async (id, roleActuel) => {
    const nouveauRole = roleActuel === "Admin" ? "Membre" : "Admin";
    try {
      await modifierRoleUtilisateur(id, nouveauRole);
      chargerMembres();
      afficherToast(`Rôle mis à jour : ${nouveauRole}`, "success");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la modification du rôle.", "error");
    }
  };

  const membresFiltres = membres.filter((m) =>
    (m.nom || "").toLowerCase().includes(recherche.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(recherche.toLowerCase()))
  );

  return (
    <div className="equipe-container">
      <Toast
        message={notification.message}
        type={notification.type}
        onClose={masquerToast}
      />

      <h2 className="title">Gestion des Membres</h2>

      {/* 🔒 Seul un ADMIN voit le formulaire d'ajout de membre */}
      {estAdmin && (
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
              required
            />
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Membre">Membre</option>
              <option value="Admin">Admin</option>
            </select>
            <button type="submit" className="btn-add">
              Ajouter
            </button>
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      <div style={{ marginBottom: "20px" }}>
        <input
          className="form-input"
          type="text"
          placeholder="🔍 Rechercher un membre par nom ou email..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Grille des membres */}
      <div className="members-grid">
        {membresFiltres.length === 0 ? (
          <p style={{ color: "#64748b" }}>Aucun membre trouvé.</p>
        ) : (
          membresFiltres.map((m) => (
            <div key={m.id} className="member-card">
              <div>
                <div className="member-header">
                  <span className="member-name">{m.nom || "Sans nom"}</span>
                  <span
                    className={`badge ${
                      m.role === "Admin" ? "badge-admin" : "badge-membre"
                    }`}
                  >
                    {m.role || "Membre"}
                  </span>
                </div>
                <div className="member-email">
                  {m.email || "Aucun email renseigné"}
                </div>
              </div>

              <div className="actions-row">
                <Link
                  to={`/equipe/${m.id}`}
                  className="btn-action"
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    textDecoration: "none",
                    textAlign: "center",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  Voir profil
                </Link>

                {/* 🔒 Seul un ADMIN a accès aux boutons de promotion et suppression */}
                {estAdmin && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}