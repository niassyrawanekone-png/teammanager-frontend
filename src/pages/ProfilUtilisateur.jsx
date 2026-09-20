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
        const membreTrouve = tousLesMembres.find((m) => m.id === parseInt(id));

        if (membreTrouve) {
          setUtilisateur(membreTrouve);

          const tousLesProjets = await getProjets();
          const mesProjets = tousLesProjets.filter(
            (p) => p.responsable.toLowerCase() === membreTrouve.nom.toLowerCase()
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

  if (chargement) {
    return <div className="p-6 text-center text-gray-500">Chargement du profil...</div>;
  }

  if (!utilisateur) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Utilisateur non trouvé</h2>
        <Link to="/equipe/membres" className="text-blue-600 underline mt-4 inline-block">
          Retour à la liste des membres
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Link to="/equipe/membres" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Retour aux membres
      </Link>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{utilisateur.nom}</h1>
            <p className="text-gray-500">{utilisateur.email || "Aucun email fourni"}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              utilisateur.role === "Admin"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {utilisateur.role}
          </span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Projets gérés ({projetsAssignes.length})
      </h2>

      {projetsAssignes.length === 0 ? (
        <p className="text-gray-500 bg-white p-4 rounded-lg border border-gray-100">
          Aucun projet n'est actuellement assigné à ce membre.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projetsAssignes.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800">{p.titre}</h3>
              <p className="text-sm text-gray-500 my-1">{p.description || "Sans description"}</p>
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                {p.statut}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}