import React from "react";
import { Link } from "react-router-dom";

export default function Accueil() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-400 via-teal-400 to-emerald-400 flex flex-col justify-center items-center px-4 text-center">
      <div className="max-w-3xl bg-white/90 backdrop-blur-md p-10 md:p-14 rounded-3xl shadow-2xl border border-white/20">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          ⚡ Gestionnaire d'Équipe
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
          La plateforme collaborative moderne pour organiser vos projets, gérer les membres et partager vos livrables de travail en temps réel.
        </p>

        {token ? (
          <div className="space-y-4">
            <p className="text-emerald-700 font-bold text-lg">Heureux de vous revoir !</p>
            <Link
              to="/equipe/membres"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition duration-300 transform hover:-translate-y-0.5"
            >
              Accéder au Tableau de Bord
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              to="/connexion"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition duration-300 transform hover:-translate-y-0.5"
            >
              Se connecter
            </Link>
            <Link
              to="/inscription"
              className="bg-white hover:bg-gray-50 text-teal-700 border-2 border-teal-600 font-bold py-3.5 px-8 rounded-xl shadow-lg transition duration-300 transform hover:-translate-y-0.5"
            >
              S'inscrire
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}