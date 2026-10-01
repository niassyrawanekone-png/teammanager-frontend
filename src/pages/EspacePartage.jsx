import React, { useState } from "react";

export default function EspacePartage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      auteur: "Rawane Kone Niassy",
      contenu: "Bienvenue sur l'espace de partage ! Vous pouvez copier ici le code ou le résumé de votre travail terminé.",
      date: "Aujourd'hui"
    }
  ]);
  const [nouveauMessage, setNouveauMessage] = useState("");

  const handleEnvoyer = (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim()) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const item = {
      id: Date.now(),
      auteur: user.nom || user.email || "Membre",
      contenu: nouveauMessage,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([item, ...messages]);
    setNouveauMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">💬 Espace de Partage & Discussion</h2>
        <p className="text-gray-600 mt-2">Partagez vos livrables finaux, vos bouts de code ou vos remarques avec l'équipe.</p>
      </div>

      <form onSubmit={handleEnvoyer} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
        <textarea
          rows="3"
          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 placeholder-gray-400"
          placeholder="Collez le lien de votre travail, un compte-rendu ou un message..."
          value={nouveauMessage}
          onChange={(e) => setNouveauMessage(e.target.value)}
        />
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition duration-200 shadow-sm"
          >
            Publier mon travail
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-teal-800 text-lg">{msg.auteur}</span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{msg.date}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.contenu}</p>
          </div>
        ))}
      </div>
    </div>
  );
}