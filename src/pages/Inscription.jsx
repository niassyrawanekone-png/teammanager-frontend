import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { inscrireUtilisateur } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Inscription() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();
  const { seConnecter } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      // Appel à la fonction d'inscription de votre fichier api.js
      const reponse = await inscrireUtilisateur({ nom, email, password });
      await seConnecter(reponse.utilisateur, reponse.token);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('fetch')) {
        setErreur("Échec de la récupération : Impossible de contacter le serveur backend.");
      } else {
        setErreur(err.message || "Erreur lors de l'inscription.");
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">

        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Créer un compte
        </h2>

        {/* Affichage d'erreur */}
        {erreur && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-medium">
            ⚠️ {erreur}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Rawane Koné Niassy"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="niassyrawanekone@gmail.com"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm disabled:opacity-60"
          >
            {chargement ? "Patientez..." : "S'inscrire"}
          </button>
        </form>

        {/* Lien de redirection vers la connexion */}
        <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Se connecter
          </Link>
        </div>

      </div>
    </div>
  );
}