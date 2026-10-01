import React, { useEffect, useState } from "react";
import { getMessagesPartage, ajouterMessagePartage, supprimerMessagePartage } from "../services/api";

export default function EspacePartage() {
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [projetAssocie, setProjetAssocie] = useState("");
  const [chargement, setChargement] = useState(true);

  const chargerMessages = async () => {
    try {
      const data = await getMessagesPartage();
      setMessages(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerMessages();
  }, []);

  const handlePublier = async (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim()) return;

    const texteFinal = projetAssocie 
      ? `[Projet : ${projetAssocie}]\n${nouveauMessage}`
      : nouveauMessage;

    try {
      await ajouterMessagePartage({ contenu: texteFinal });
      setNouveauMessage("");
      setProjetAssocie("");
      chargerMessages();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSupprimer = async (id) => {
    if (window.confirm("Voulez-vous supprimer ce message ?")) {
      try {
        await supprimerMessagePartage(id);
        chargerMessages();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen text-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">💬 Espace de Discussion & Partage</h1>
        <p className="text-gray-600 mt-1">Partagez vos livrables, codes et échangez sur les projets de l'équipe.</p>
      </div>

      <form onSubmit={handlePublier} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 space-y-4">
        <input
          type="text"
          placeholder="Nom du projet ou rôle concerné (ex: Projet UTE - Module Auth)"
          className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
          value={projetAssocie}
          onChange={(e) => setProjetAssocie(e.target.value)}
        />
        <textarea
          rows="4"
          required
          placeholder="Collez votre code, lien de travail ou message ici..."
          className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
          value={nouveauMessage}
          onChange={(e) => setNouveauMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-sm"
        >
          Publier le travail
        </button>
      </form>

      {chargement ? (
        <p className="text-gray-500">Chargement de la discussion...</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-teal-800 text-lg">{msg.auteur_nom}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.contenu}</p>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={() => handleSupprimer(msg.id)}
                  className="text-xs font-bold text-red-600 hover:underline"
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