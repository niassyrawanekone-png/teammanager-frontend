import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUtilisateurs, getProjets } from "../services/api";

export default function ProfilUtilisateur() {
  const { id } = useParams();
  const [utilisateur, setUtilisateur] = useState(null);
  const [projetsAssignes, setProjetsAssignes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function chargerProfil() {
      try {
        const tousLesMembres = await getUtilisateurs();
        const membreTrouve = tousLesMembres.find(
          (m) => String(m.id) === String(id)
        );

        if (membreTrouve) {
          setUtilisateur(membreTrouve);

          const tousLesProjets = await getProjets();
          const mesProjets = tousLesProjets.filter(
            (p) =>
              p.responsable &&
              p.responsable.toLowerCase() === membreTrouve.nom.toLowerCase()
          );
          setProjetsAssignes(mesProjets);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du profil", err);
      } finally {
        setChargement(false);
      }
    }

    chargerProfil();
  }, [id]);

  const getStatutBadgeColor = (statut) => {
    if (statut === "Terminé")
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300";
    if (statut === "En cours")
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300";
    return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
  };

  if (chargement) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Chargement du profil...
      </div>
    );
  }

  if (!utilisateur) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
          Utilisateur non trouvé
        </h2>
        <Link
          to="/equipe/membres"
          className="text-blue-600 dark:text-blue-400 underline mt-4 inline-block"
        >
          Retour à la liste des membres
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Link
        to="/equipe/membres"
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block font-medium"
      >
        ← Retour aux membres
      </Link>

      {/* Carte d'information du Membre */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 transition-colors">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {utilisateur.nom}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {utilisateur.email || "Aucun email fourni"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              utilisateur.role === "Admin"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {utilisateur.role}
          </span>
        </div>
      </div>

      {/* Liste des Projets Gérés */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Projets gérés ({projetsAssignes.length})
      </h2>

      {projetsAssignes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          Aucun projet n'est actuellement assigné à ce membre.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projetsAssignes.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">
                  {p.titre}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
                  {p.description || "Sans description"}
                </p>
              </div>
              <div>
                <span
                  className={`text-xs px-2 py-1 rounded border inline-block font-medium ${getStatutBadgeColor(
                    p.statut
                  )}`}
                >
                  {p.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}