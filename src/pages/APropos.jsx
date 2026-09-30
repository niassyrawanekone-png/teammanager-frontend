import React from "react";
import { Link } from "react-router-dom";

function APropos() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 transition-colors duration-200">
      
      {/* En-tête */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          ℹ️ À Propos de <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TeamManager</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Une plateforme moderne de gestion d'équipes et de projets, développée pour appliquer les meilleures pratiques de l'ingénierie logicielle et du développement Full-Stack.
        </p>
      </section>

      {/* Cartes d'information sur les Technologies */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Front-End */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="text-2xl">🎨</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Front-End</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Interface dynamique et réactive conçue avec **React**, **React Router v6** pour le routage côté client, et **Tailwind CSS v4** pour un design adaptatif et le support du mode sombre.
          </p>
        </div>

        {/* Back-End */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="text-2xl">⚡</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Back-End & API</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            API REST performante développée avec **FastAPI** (Python), assurant une communication rapide avec la base de données **SQLite / PostgreSQL** et la validation des données avec Pydantic.
          </p>
        </div>

      </section>

      {/* Objectifs du projet */}
      <section className="p-6 bg-blue-50 dark:bg-gray-800/50 rounded-xl border border-blue-100 dark:border-gray-700 text-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🎯 Objectif de la Certification
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Ce projet s'inscrit dans le cursus de formation au rôle de développeur de logiciels Full-Stack, couvrant la conception d'interfaces, la gestion d'états, la sécurité API, la persistance des données et le déploiement Cloud.
        </p>
        <div className="pt-2">
          <Link
            to="/equipe"
            className="inline-block px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors"
          >
            Découvrir l'équipe
          </Link>
        </div>
      </section>

    </div>
  );
}

export default APropos;