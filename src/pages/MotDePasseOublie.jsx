import { useState } from "react";
import { Link } from "react-router-dom";
import { demanderReinitialisationMotDePasse } from "../services/api";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await demanderReinitialisationMotDePasse(email.trim());
      setMessage(result?.message || "Si un compte correspond à cette adresse et que l'envoi est disponible, vous recevrez des instructions.");
    } catch {
      setMessage("Si un compte correspond à cette adresse et que l'envoi est disponible, vous recevrez des instructions.");
      setError("La demande n'a pas pu être transmise au serveur. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto my-12 max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Mot de passe oublié ?</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
        Saisissez l'adresse e-mail de votre compte. Si la récupération est configurée, vous recevrez un lien valable 30 minutes.
      </p>
      {message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">{message}</p>}
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="reset-email">Adresse e-mail</label>
        <input id="reset-email" type="email" autoComplete="email" required value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Envoi…" : "Envoyer les instructions"}
        </button>
      </form>
      <Link to="/connexion" className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">Retour à la connexion</Link>
    </main>
  );
}
