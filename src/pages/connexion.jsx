import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  seConnecter as seConnecterAPI,
  inscrireUtilisateur,
} from "../services/api";

function Connexion() {
  const [estInscription, setEstInscription] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);

  const { seConnecter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route de destination après connexion
  const destination = location.state?.from?.pathname || "/equipe";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErreur("");
    setSucces("");
    setChargement(true);

    try {
      if (estInscription) {
        // ================= INSCRIPTION =================
        // On utilise api.js au lieu de 127.0.0.1
        await inscrireUtilisateur({
          email,
          password,
          nom,
        });

        setEstInscription(false);
        setSucces(
          "Compte créé avec succès ! Vous pouvez maintenant vous connecter."
        );
        setPassword("");
        setNom("");
      } else {
        // ================= CONNEXION =================
        // La requête part vers Render grâce à api.js
        const data = await seConnecterAPI(email, password);

        // Stockage de la session via AuthContext
        seConnecter(data.access_token);

        // Redirection après connexion
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setErreur(
        err.message || "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-200">

        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          {estInscription ? "Créer un compte" : "Connexion"}
        </h2>

        {/* Message d'erreur */}
        {erreur && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            {erreur}
          </div>
        )}

        {/* Message de succès */}
        {succes && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm border border-emerald-200 dark:border-emerald-800">
            {succes}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nom : uniquement pendant l'inscription */}
          {estInscription && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom complet
              </label>

              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={chargement}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {chargement
              ? "Patientez..."
              : estInscription
              ? "S'inscrire"
              : "Se connecter"}
          </button>
        </form>

        {/* Changer entre connexion et inscription */}
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {estInscription
            ? "Déjà un compte ?"
            : "Pas encore de compte?"}{" "}

          <button
            type="button"
            onClick={() => {
              setEstInscription(!estInscription);
              setErreur("");
              setSucces("");
            }}
            className="text-blue-600 dark:text-blue-400 underline font-medium"
          >
            {estInscription ? "Se connecter" : "S'inscrire"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default Connexion;
