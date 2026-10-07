import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getUtilisateurs,
  ajouterUtilisateur,
  modifierRoleUtilisateur,
  supprimerUtilisateur,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { normalizeRole } from "../../services/roles";
import "../equipe.css";

export default function Membres() {
  const [membres, setMembres] = useState([]);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Membre");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const { utilisateurConnecte, estAdmin: adminDuContexte } = useAuth();

  // Récupération sécurisée de l'utilisateur stocké en session pour forcer l'affichage si admin
  const storedUser = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const roleActuel = utilisateurConnecte?.role || storedUser?.role;

  const roleNormalise = normalizeRole(roleActuel);
  const estAdmin = adminDuContexte || roleNormalise === "ADMIN" || roleNormalise === "SUPER_ADMIN";

  const afficherToast = (message, type = "success") => {
    setNotification({ message, type });
  };

  const masquerToast = () => {
    setNotification({ message: "", type: "success" });
  };

  const chargerMembres = async () => {
    setChargement(true);
    try {
      const data = await getUtilisateurs();
      if (Array.isArray(data)) {
        setMembres(data);
      }
    } catch (err) {
      afficherToast(err.message || "Impossible de charger la liste de l'équipe.", "error");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    let actif = true;
    const charger = async () => {
      try {
        const data = await getUtilisateurs();
        if (actif && Array.isArray(data)) setMembres(data);
      } catch (err) {
        if (actif) {
          afficherToast(err.message || "Impossible de charger la liste de l'équipe.", "error");
        }
      } finally {
        if (actif) setChargement(false);
      }
    };

    void charger();
    return () => {
      actif = false;
    };
  }, []);

  const handleAjouter = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim()) return;

    try {
      await ajouterUtilisateur({
        nom: nom.trim(),
        email: email.trim(),
        motDePasse: "123456",
        role: role,
      });

      setNom("");
      setEmail("");
      setRole("Membre");
      await chargerMembres();
      afficherToast("Membre ajouté avec succès ! (Mot de passe par défaut : 123456)", "success");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de l'ajout du membre.", "error");
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce membre ?")) return;
    try {
      await supprimerUtilisateur(id);
      await chargerMembres();
      afficherToast("Membre supprimé avec succès.", "info");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la suppression.", "error");
    }
  };

  const handleChangerRole = async (id, nouveauRole) => {
    try {
      await modifierRoleUtilisateur(id, nouveauRole);
      await chargerMembres();
      afficherToast(`Grade mis à jour : ${nouveauRole}`, "success");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la modification du grade.", "error");
    }
  };

  const membresFiltres = membres.filter((m) =>
    (m.nom || "").toLowerCase().includes(recherche.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(recherche.toLowerCase()))
  );

  return (
    <div className="equipe-container bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded-2xl shadow-sm">
      <Toast
        message={notification.message}
        type={notification.type}
        onClose={masquerToast}
      />

      <h2 className="text-2xl font-bold mb-6">Gestion des Membres et des Grades</h2>

      {/* Formulaire d'ajout visible pour l'administrateur */}
      {estAdmin && (
        <div className="form-card bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleAjouter} className="form-row flex flex-col sm:flex-row gap-3">
            <input
              className="form-input p-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex-1 text-gray-900 dark:text-white"
              type="text"
              placeholder="Nom du membre"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
            <input
              className="form-input p-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex-1 text-gray-900 dark:text-white"
              type="email"
              placeholder="Adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              className="form-select p-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Membre">Membre</option>
              <option value="Sous-chef de Projet">Sous-chef de Projet</option>
              <option value="Chef de Projet">Chef de Projet</option>
              <option value="Administrateur">Administrateur</option>
            </select>
            <button type="submit" className="btn-add bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-lg transition">
              Ajouter
            </button>
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      <div style={{ marginBottom: "20px" }}>
        <input
          className="form-input w-full p-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
          type="text"
          placeholder="🔍 Rechercher un membre par nom ou email..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {/* Grille des membres */}
      {chargement ? (
        <p className="text-gray-500">Chargement des membres...</p>
      ) : (
        <div className="members-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          {membresFiltres.length === 0 ? (
            <p style={{ color: "#64748b" }}>Aucun membre trouvé.</p>
          ) : (
            membresFiltres.map((m) => (
              <div key={m.id} className="member-card p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col justify-between shadow-sm">
                <div>
                  <div className="member-header flex justify-between items-center mb-1">
                    <span className="member-name font-bold text-gray-900 dark:text-white">{m.nom || "Sans nom"}</span>
                    <span
                      className={`badge px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        normalizeRole(m.role) === "ADMIN" || normalizeRole(m.role) === "SUPER_ADMIN"
                          ? "badge-admin bg-amber-100 text-amber-800"
                          : normalizeRole(m.role) === "CHEF_DE_PROJET"
                          ? "bg-purple-100 text-purple-800"
                          : normalizeRole(m.role) === "SOUS_CHEF_DE_PROJET"
                          ? "bg-blue-100 text-blue-800"
                          : "badge-membre bg-teal-100 text-teal-800"
                      }`}
                    >
                      {m.role || "Membre"}
                    </span>
                  </div>
                  <div className="member-email text-xs text-gray-500 dark:text-gray-400">
                    {m.email || "Aucun email renseigné"}
                  </div>
                </div>

                <div className="actions-row flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Link
                    to={`/equipe/${m.id}`}
                    className="btn-action text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md font-medium text-center"
                    style={{ textDecoration: "none" }}
                  >
                    Voir profil
                  </Link>

                  {/* Gestion des rôles et suppression */}
                  {estAdmin && (
                    <>
                      <select
                        className="text-xs p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                        value={m.role || "Membre"}
                        onChange={(e) => handleChangerRole(m.id, e.target.value)}
                      >
                        <option value="Membre">Membre</option>
                        <option value="Sous-chef de Projet">Sous-chef de Projet</option>
                        <option value="Chef de Projet">Chef de Projet</option>
                        <option value="Administrateur">Administrateur</option>
                      </select>

                      <button
                        className="btn-action btn-delete text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-md font-medium hover:bg-red-100 ml-auto"
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
      )}
    </div>
  );
}