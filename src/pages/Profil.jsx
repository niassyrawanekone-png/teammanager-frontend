import React, { useEffect, useState } from "react";

export default function Profil() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-lg">
        Veuillez vous connecter pour voir votre profil.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">Mon Profil</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Nom complet</label>
          <p className="text-xl font-semibold text-gray-800">{user.nom || user.name || "Non spécifié"}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Adresse e-mail</label>
          <p className="text-xl font-semibold text-gray-800">{user.email}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Rôle dans l'équipe</label>
            <p className="text-xl font-semibold text-teal-700 capitalize">{user.role || "Membre"}</p>
          </div>
          <span className="px-4 py-1.5 bg-teal-100 text-teal-800 font-bold text-xs rounded-full uppercase tracking-wide">
            Actif
          </span>
        </div>
      </div>
    </div>
  );
}