import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjets, getMessagesPartage } from "../services/api";

export default function Accueil() {
  const token = sessionStorage.getItem("token");
  const storedUser = sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [projetsCount, setProjetsCount] = useState(0);
  const [dernierMessage, setDernierMessage] = useState(null);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (token) {
      setChargement(true);
      Promise.all([getProjets(), getMessagesPartage()])
        .then(([projetsData, messagesData]) => {
          if (Array.isArray(projetsData)) setProjetsCount(projetsData.length);
          if (Array.isArray(messagesData) && messagesData.length > 0) {
            setDernierMessage(messagesData[0]);
          }
        })
        .catch((err) => console.error("Erreur lors de la récupération des données :", err))
        .finally(() => setChargement(false));
    }
  }, [token]);

  // ================= 1. PAGE D'ACCUEIL POUR VISITEUR NON CONNECTÉ =================
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-sky-400 via-teal-400 to-emerald-400 flex flex-col justify-center items-center px-4 py-12 text-center">
        <div className="max-w-3xl bg-white/95 backdrop-blur-md p-8 md:p-14 rounded-3xl shadow-2xl border border-white/20">
          <div className="inline-block p-3 bg-teal-100 text-teal-800 rounded-2xl mb-4 font-bold text-sm tracking-wide uppercase">
            Plateforme Collaborative
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            ⚡ TeamManager
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-teal-900 mb-2">
            "Transformez vos idées en projets réels."
          </p>
          <p className="text-md md:text-lg text-gray-700 mb-8 max-w-xl mx-auto">
            "Collaborez sans limites, atteignez vos objectifs d'équipe."
          </p>

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
        </div>
      </div>
    );
  }

  // ================= 2. DASHBOARD DÉROULANT POUR UTILISATEUR CONNECTÉ =================
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* BANNIÈRE D'INSPIRATION & SLOGANS */}
      <section className="bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white py-14 px-6 shadow-md">
        <div className="max-w-6xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black mb-3">
              Ravi de vous revoir, {user?.nom || user?.email || "Membre"} ! 👋
            </h1>
            <p className="text-lg md:text-xl font-medium text-sky-100 italic">
              "Transformez vos idées en projets réels."
            </p>
            <p className="text-sm md:text-base text-teal-100">
              "Collaborez sans limites, atteignez vos objectifs d'équipe."
            </p>
          </div>
          <Link
            to="/partage"
            className="bg-white text-teal-800 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-sky-50 transition transform hover:scale-105 whitespace-nowrap"
          >
            💬 Ouvrir le Chat & Partage
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-10">
        {/* VUE D'ENSEMBLE RAPIDE (QUICK STATS) */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Vue d'ensemble rapide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Projets en cours</span>
              <p className="text-4xl font-extrabold text-gray-900 mt-2">
                {chargement ? "..." : projetsCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Projets enregistrés dans l'équipe</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Votre Rôle Actuel</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-2 capitalize">
                {user?.role || "Membre"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Niveau d'accès dans l'organisation</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Dernier Message Chat</span>
              {dernierMessage ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">{dernierMessage.auteur_nom || "Auteur"}</p>
                  <p className="text-xs text-gray-600 truncate">{dernierMessage.contenu}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Aucun message pour le moment</p>
              )}
              <Link to="/partage" className="inline-block text-xs font-bold text-teal-600 hover:underline mt-3">
                Accéder à la discussion →
              </Link>
            </div>
          </div>
        </section>

        {/* GUIDE DE DÉMARRAGE RAPIDE */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">🚀 Guide de démarrage rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/equipe/membres"
              className="p-5 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-100 transition text-center group"
            >
              <div className="text-2xl mb-2">👥</div>
              <p className="font-bold text-sky-900 group-hover:text-sky-700">Accéder à mon équipe</p>
              <p className="text-xs text-sky-700 mt-1">Gérer les membres et attribuer les rôles</p>
            </Link>

            <Link
              to="/partage"
              className="p-5 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-100 transition text-center group"
            >
              <div className="text-2xl mb-2">💬</div>
              <p className="font-bold text-teal-900 group-hover:text-teal-700">Lancer la discussion</p>
              <p className="text-xs text-teal-700 mt-1">Échanger en direct avec vos collaborateurs</p>
            </Link>

            <Link
              to="/partage"
              className="p-5 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition text-center group"
            >
              <div className="text-2xl mb-2">📁</div>
              <p className="font-bold text-emerald-900 group-hover:text-emerald-700">Soumettre un livrable</p>
              <p className="text-xs text-emerald-700 mt-1">Partager vos rendus et liens de code</p>
            </Link>
          </div>
        </section>

        {/* FLUX D'ACTIVITÉS ET CONSEILS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📌 Activités récentes de l'équipe
            </h2>
            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <span className="p-2 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">1</span>
                <div>
                  <p className="font-semibold text-gray-900">Bienvenue sur la plateforme TeamManager !</p>
                  <p className="text-xs text-gray-500">L'espace de travail est prêt pour votre projet.</p>
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              💡 Conseils de collaboration & Méthodologie
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-bold text-teal-800">1. Définissez clairement les rôles</p>
                <p className="text-xs text-gray-600 mt-0.5">Attribuez un responsable à chaque projet pour éviter les doublons.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}