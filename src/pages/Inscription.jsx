import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inscrireUtilisateur } from "../services/api";

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);

    try {
      await inscrireUtilisateur({
        nom: nom.trim(),
        email: email.trim(),
        password: password,
      });

      setSucces("Inscription réussie ! Redirection vers la connexion...");
      setTimeout(() => {
        navigate("/connexion");
      }, 1500);
    } catch (err) {
      setErreur(err.message || "Erreur lors de l'inscription.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Rejoindre ⚡ TeamManager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Créez votre compte pour commencer à collaborer.
          </p>
        </div>

        {erreur && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
            {erreur}
          </div>
        )}

        {succes && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
            {succes}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Rawane Koné Niassy"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Adresse E-mail
            </label>
            <input
              type="email"
              required
              placeholder="exemple@domaine.com"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md disabled:opacity-50"
          >
            {chargement ? "Création du compte..." : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Vous avez déjà un compte ?{" "}
          <Link to="/connexion" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}