import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { seConnecter as seConnecterApi } from '../services/api';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const { seConnecter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      // 1. Appel du backend qui va vérifier l'email et le mot de passe
      const reponse = await seConnecterApi({ email, password });

      // 2. Mise à jour de la session dans React
      seConnecter(reponse.utilisateur, reponse.token);

      navigate(destination);
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('fetch')) {
        setErreur("Échec de la récupération : Vérifiez que le serveur backend est démarré.");
      } else {
        setErreur(err.message || "Email ou mot de passe incorrect.");
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">

        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Connexion
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
            <Link to="/mot-de-passe-oublie" className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm disabled:opacity-60"
          >
            {chargement ? "Patientez..." : "Se connecter"}
          </button>
        </form>

        {/* Lien vers Inscription */}
        <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            S'inscrire
          </Link>
        </div>

      </div>
    </div>
  );
}
