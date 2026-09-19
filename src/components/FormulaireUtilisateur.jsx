import { useState } from 'react';

function FormulaireUtilisateur({ onAjouterUtilisateur }) {
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [enEnvoi, setEnEnvoi] = useState(false);

  const gererSoumission = async (e) => {
    e.preventDefault();
    if (!nom || !role || !email) return alert("Veuillez remplir tous les champs !");

    try {
      setEnEnvoi(true);
      await onAjouterUtilisateur({ nom, role, email });
      setNom("");
      setRole("");
      setEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setEnEnvoi(false);
    }
  };

  return (
    <form 
      onSubmit={gererSoumission} 
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-2xl mx-auto"
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-left">➕ Ajouter un membre</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input 
          type="text" 
          placeholder="Nom complet" 
          value={nom} 
          onChange={(e) => setNom(e.target.value)} 
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
        />
        <input 
          type="text" 
          placeholder="Rôle (ex: Développeur)" 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
        />
      </div>

      <button 
        type="submit" 
        disabled={enEnvoi}
        className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {enEnvoi ? "Enregistrement..." : "Ajouter au membre"}
      </button>
    </form>
  );
}

export default FormulaireUtilisateur;