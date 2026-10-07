import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { modifierMotDePasseUtilisateur } from "../services/api";
import Toast from "../components/Toast";

export default function Profil() {
  const { utilisateurConnecte } = useAuth();
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const storedUser = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user") || "null"
  );
  const user = utilisateurConnecte || storedUser;

  const afficherToast = (message, type = "success") => {
    setNotification({ message, type });
  };

  const masquerToast = () => {
    setNotification({ message: "", type: "success" });
  };

  const handleChangerMotDePasse = async (e) => {
    e.preventDefault();
    if (!nouveauMdp.trim()) return;

    if (ancienMdp && user.motDePasse && ancienMdp !== user.motDePasse) {
      afficherToast("L'ancien mot de passe est incorrect.", "error");
      return;
    }

    try {
      await modifierMotDePasseUtilisateur(user.id, nouveauMdp);
      setAncienMdp("");
      setNouveauMdp("");
      afficherToast("Mot de passe modifié avec succès !", "success");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la modification du mot de passe.", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500 text-lg gap-4">
        <p>Veuillez vous connecter pour voir votre profil.</p>
        <a
          href="/connexion"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Aller à la page de connexion
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <Toast
        message={notification.message}
        type={notification.type}
        onClose={masquerToast}
      />

      <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        Mon Profil
      </h2>

      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Nom complet
          </label>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {user.nom || user.name || "Étudiant UADB"}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Adresse e-mail
          </label>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {user.email || "Non spécifiée"}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Rôle / Grade dans l'équipe
            </label>
            <p className="text-xl font-semibold text-teal-600 dark:text-teal-400 capitalize">
              {user.role || "Membre"}
            </p>
          </div>
          <span className="px-4 py-1.5 bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 font-bold text-xs rounded-full uppercase tracking-wide">
            Actif
          </span>
        </div>

        {/* Formulaire de modification du mot de passe */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600 mt-8">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Sécurité : Modifier mon mot de passe
          </h3>
          <form onSubmit={handleChangerMotDePasse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                placeholder="Entrez votre nouveau mot de passe"
                className="w-full p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-sm text-sm"
            >
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}