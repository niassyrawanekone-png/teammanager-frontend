import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  // Route de destination après connexion (par défaut /equipe)
  const destination = location.state?.from?.pathname || "/equipe";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);

    try {
      if (estInscription) {
        // 1. INSCRIPTION (JSON)
        const res = await fetch("http://127.0.0.1:8000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, nom }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Erreur lors de l'inscription");

        setEstInscription(false);
        setSucces("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        setPassword("");
      } else {
        // 2. CONNEXION (OAuth2Form Data)
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const res = await fetch("http://127.0.0.1:8000/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Identifiants ou mot de passe incorrects");

        seConnecter(data.access_token);
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setErreur(err.message);
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

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {estInscription ? "Déjà un compte ?" : "Pas encore de compte ?"} {" "}
          <button
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