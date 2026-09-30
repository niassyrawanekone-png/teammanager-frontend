import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUtilisateurs, getProjets } from "../services/api";

export default function Accueil() {
  const [stats, setStats] = useState({
    totalMembres: 0,
    totalProjets: 0,
    projetsEnCours: 0,
    projetsTermines: 0,
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function chargerStats() {
      try {
        const membres = await getUtilisateurs();
        const projets = await getProjets();

        setStats({
          totalMembres: membres.length,
          totalProjets: projets.length,
          projetsEnCours: projets.filter((p) => p.statut === "En cours").length,
          projetsTermines: projets.filter((p) => p.statut === "Terminé").length,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques", err);
      } finally {
        setChargement(false);
      }
    }

    chargerStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 text-center transition-colors">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Tableau de Bord
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Bienvenue sur votre application de gestion d'équipe et de projets.
        </p>
      </div>

      {/* Cartes de statistiques */}
      {chargement ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Chargement des données...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalMembres}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Membres dans l'équipe
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {stats.totalProjets}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Projets au total
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <span className="text-3xl font-bold text-amber-500 dark:text-amber-400">
              {stats.projetsEnCours}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Projets en cours
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.projetsTermines}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Projets terminés
            </p>
          </div>
        </div>
      )}

      {/* Raccourcis de navigation */}
      <div className="flex justify-center gap-4">
        <Link
          to="/equipe/membres"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Gérer les membres
        </Link>
        <Link
          to="/equipe/projets"
          className="bg-gray-800 dark:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition"
        >
          Voir les projets
        </Link>
      </div>
    </div>
  );
}