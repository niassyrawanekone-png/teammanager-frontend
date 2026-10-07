import { useState, useEffect } from "react";
import {
  getProjets,
  ajouterProjet,
  modifierProjet,
  supprimerProjet,
  getUtilisateurs,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { normalizeRole } from "../../services/roles";

export default function Projets() {
  const [projets, setProjets] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);

  // Champs Formulaire
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [chefId, setChefId] = useState("");
  const [statut, setStatut] = useState("En cours");

  const [notification, setNotification] = useState({ message: "", type: "success" });

  const { utilisateurConnecte } = useAuth();

  // Récupération de secours depuis la session locale
  const storedUser = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const userActuel = utilisateurConnecte || storedUser;
  const userRole = normalizeRole(userActuel?.role);

  // Autorise la création aux administrateurs et chefs de projet.
  const peutCreerProjet =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "CHEF_DE_PROJET";

  const chargerDonnees = async () => {
    try {
      const [projetsData, usersData] = await Promise.all([
        getProjets(),
        getUtilisateurs(),
      ]);
      setProjets(projetsData || []);
      setUtilisateurs(usersData || []);
    } catch (err) {
      setNotification({ message: err.message || "Erreur de chargement.", type: "error" });
    }
  };

  useEffect(() => {
    let actif = true;
    const charger = async () => {
      try {
        const [projetsData, usersData] = await Promise.all([
          getProjets(),
          getUtilisateurs(),
        ]);
        if (actif) {
          setProjets(projetsData || []);
          setUtilisateurs(usersData || []);
        }
      } catch (err) {
        if (actif) {
          setNotification({
            message: err.message || "Erreur de chargement.",
            type: "error",
          });
        }
      }
    };

    void charger();
    return () => {
      actif = false;
    };
  }, []);

  const handleCreerProjet = async (e) => {
    e.preventDefault();
    if (!titre.trim()) return;

    try {
      const responsable = utilisateurs.find((utilisateur) => utilisateur.id === Number(chefId));
      await ajouterProjet({
        titre: titre.trim(),
        description,
        responsable: responsable?.nom || responsable?.email || userActuel?.nom || userActuel?.email || "Non assigné",
        statut,
      });

      setTitre("");
      setDescription("");
      setChefId("");
      setStatut("En cours");

      await chargerDonnees();
      setNotification({ message: "Projet créé avec succès !", type: "success" });
    } catch (err) {
      setNotification({ message: err.message || "Erreur lors de la création.", type: "error" });
    }
  };

  const handleChangerStatut = async (id, nouveauStatut) => {
    try {
      const projet = projets.find((item) => item.id === id);
      if (!projet) throw new Error("Projet introuvable.");
      await modifierProjet(id, {
        titre: projet.titre,
        description: projet.description || "",
        statut: nouveauStatut,
        responsable: projet.responsable || "Non assigné",
      });
      await chargerDonnees();
      setNotification({ message: "Statut mis à jour.", type: "success" });
    } catch (err) {
      setNotification({ message: err.message || "Erreur de mise à jour.", type: "error" });
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Voulez-vous supprimer ce projet ?")) return;
    try {
      await supprimerProjet(id);
      await chargerDonnees();
      setNotification({ message: "Projet supprimé.", type: "info" });
    } catch (err) {
      setNotification({ message: err.message || "Erreur de suppression.", type: "error" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <Toast
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <div className="flex justify-between items-center border-b pb-4 border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Gestion des Projets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Créez, attribuez et gérez l'avancement des projets de votre équipe
          </p>
        </div>
      </div>

      {/* Formulaire de création de projet (Garantie d'affichage pour l'Administrateur) */}
      {peutCreerProjet && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
            ➕ Créer un nouveau projet
          </h2>

          <form onSubmit={handleCreerProjet} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Titre du projet
              </label>
              <input
                type="text"
                required
                placeholder="ex: Projet UTE - Module Auth"
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Description du projet (multi-lignes)
              </label>
              <textarea
                rows="5"
                placeholder="Objectifs du projet, étapes, livrables attendus..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm font-sans leading-relaxed outline-none focus:ring-2 focus:ring-blue-500"
                style={{ whiteSpace: "pre-wrap" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                  Chef de projet
                </label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm"
                  value={chefId}
                  onChange={(e) => setChefId(e.target.value)}
                >
                  <option value="">-- Choisir le chef de projet --</option>
                  {utilisateurs.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nom} ({u.role || "Membre"})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Le backend enregistre un responsable unique par projet. La gestion des sous-chefs et des membres nécessite une évolution de son schéma.
            </p>

            <div className="flex justify-between items-center pt-2">
              <select
                className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
              >
                <option value="En cours">En cours</option>
                <option value="En attente">En attente</option>
                <option value="Terminé">Terminé</option>
              </select>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md transition"
              >
                Créer le projet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cartes des Projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projets.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            Aucun projet enregistré. Utilisez le formulaire ci-dessus pour en créer un.
          </p>
        ) : (
          projets.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {p.titre}
                  </h3>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      p.statut === "Terminé"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : p.statut === "En cours"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                    }`}
                  >
                    {p.statut}
                  </span>
                </div>

                <div
                  className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-800 leading-relaxed"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {p.description || "Aucune description fournie."}
                </div>

                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    👑 <strong className="text-gray-700 dark:text-gray-300">Responsable :</strong>{" "}
                    {p.responsable || "Non assigné"}
                  </p>
                </div>
              </div>

              {peutCreerProjet && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                  <select
                    className="text-xs p-1.5 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                    value={p.statut}
                    onChange={(e) => handleChangerStatut(p.id, e.target.value)}
                  >
                    <option value="En cours">En cours</option>
                    <option value="En attente">En attente</option>
                    <option value="Terminé">Terminé</option>
                  </select>

                  <button
                    onClick={() => handleSupprimer(p.id)}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}