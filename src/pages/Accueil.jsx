import React, { useEffect, useState } from "react";
import { getUtilisateurs, ajouterUtilisateur, modifierRoleUtilisateur, supprimerUtilisateur } from "../../services/api";

export default function Membres() {
  const [membres, setMembres] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauEmail, setNouveauEmail] = useState("");
  const [nouveauPassword, setNouveauPassword] = useState("");

  const chargerMembres = async () => {
    try {
      setChargement(true);
      const data = await getUtilisateurs();
      setMembres(data);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerMembres();
  }, []);

  const handleAjouter = async (e) => {
    e.preventDefault();
    if (!nouveauEmail || !nouveauPassword) return;
    try {
      await ajouterUtilisateur({ nom: nouveauNom, email: nouveauEmail, password: nouveauPassword });
      setNouveauNom("");
      setNouveauEmail("");
      setNouveauPassword("");
      chargerMembres();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangerRole = async (id, roleActuel) => {
    const nouveauRole = roleActuel === "Admin" ? "Membre" : "Admin";
    try {
      await modifierRoleUtilisateur(id, nouveauRole);
      chargerMembres();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSupprimer = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce membre ?")) {
      try {
        await supprimerUtilisateur(id);
        chargerMembres();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const membresFitres = membres.filter((m) =>
    (m.nom || "").toLowerCase().includes(recherche.toLowerCase()) ||
    m.email.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white text-gray-900 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Gestion des Membres</h1>

      {/* FORMULAIRE D'AJOUT DE MEMBRE */}
      <form onSubmit={handleAjouter} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Ajouter un nouveau membre</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nom complet"
            className="p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            value={nouveauNom}
            onChange={(e) => setNouveauNom(e.target.value)}
          />
          <input
            type="email"
            placeholder="Adresse e-mail"
            required
            className="p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            value={nouveauEmail}
            onChange={(e) => setNouveauEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            required
            className="p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            value={nouveauPassword}
            onChange={(e) => setNouveauPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-sm"
        >
          + Ajouter au groupe
        </button>
      </form>

      {/* BARRE DE RECHERCHE */}
      <input
        type="text"
        placeholder="Rechercher par nom ou e-mail..."
        className="w-full p-3.5 mb-6 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {/* LISTE DES MEMBRES */}
      {chargement ? (
        <p className="text-gray-500">Chargement des membres...</p>
      ) : erreur ? (
        <p className="text-red-600">{erreur}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {membresFitres.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{m.nom || "Sans nom"}</h3>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                      m.role === "Admin" ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"
                    }`}
                  >
                    {m.role || "Membre"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{m.email}</p>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleChangerRole(m.id, m.role)}
                  className="bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs py-2 px-4 rounded-lg transition"
                >
                  {m.role === "Admin" ? "Rétrograder Membre" : "Promouvoir Admin"}
                </button>
                <button
                  onClick={() => handleSupprimer(m.id)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs py-2 px-4 rounded-lg transition ml-auto"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}