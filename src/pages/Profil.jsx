import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { modifierMonNom, modifierMonMotDePasse } from "../services/api";
import Toast from "../components/Toast";

export default function Profil() {
  const { utilisateurConnecte, seConnecter, token } = useAuth();
  
  const [nom, setNom] = useState("");
  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (utilisateurConnecte?.nom) {
      setNom(utilisateurConnecte.nom);
    }
  }, [utilisateurConnecte]);

  const afficherToast = (message, type = "success") => {
    setNotification({ message, type });
  };

  const masquerToast = () => {
    setNotification({ message: "", type: "success" });
  };

  // Enregistrer la modification du Nom
  const handleModifierProfil = async (e) => {
    e.preventDefault();
    if (!nom.trim()) {
      afficherToast("Le nom ne peut pas être vide.", "error");
      return;
    }
    try {
      await modifierMonNom(nom);
      // Recharger le profil local dans le contexte
      if (token) await seConnecter(token);
      afficherToast("Nom mis à jour avec succès !", "success");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la mise à jour du nom.", "error");
    }
  };

  // Enregistrer le changement de Mot de Passe
  const handleChangerMotDePasse = async (e) => {
    e.preventDefault();
    if (!ancienMotDePasse || !nouveauMotDePasse) {
      afficherToast("Veuillez remplir tous les champs de mot de passe.", "error");
      return;
    }
    if (nouveauMotDePasse.length < 6) {
      afficherToast("Le nouveau mot de passe doit faire au moins 6 caractères.", "error");
      return;
    }
    try {
      await modifierMonMotDePasse(ancienMotDePasse, nouveauMotDePasse);
      setAncienMotDePasse("");
      setNouveauMotDePasse("");
      afficherToast("Mot de passe modifié avec succès !", "success");
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la modification du mot de passe.", "error");
    }
  };

  if (!utilisateurConnecte) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-gray-500">
        Chargement des informations du profil...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 space-y-8">
      <Toast message={notification.message} type={notification.type} onClose={masquerToast} />

      {/* En-tête */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center">
          {nom ? nom.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {utilisateurConnecte.nom}
          </h2>
          <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            {utilisateurConnecte.role}
          </span>
        </div>
      </div>

      {/* Formulaire 1 : Nom */}
      <form onSubmit={handleModifierProfil} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Informations personnelles
        </h3>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Adresse Email (Non modifiable)
          </label>
          <input
            type="email"
            value={utilisateurConnecte.email}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Nom complet
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Enregistrer le nom
        </button>
      </form>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Formulaire 2 : Mot de Passe */}
      <form onSubmit={handleChangerMotDePasse} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sécurité & Mot de passe
        </h3>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Mot de passe actuel
          </label>
          <input
            type="password"
            value={ancienMotDePasse}
            onChange={(e) => setAncienMotDePasse(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}