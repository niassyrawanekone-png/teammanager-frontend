import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { accepterInvitation } from "../services/api";

export default function ActiverCompte() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("Le lien d'invitation ne contient pas de jeton.");
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const result = await accepterInvitation({ token, nouveauMotDePasse: password, confirmation });
      setMessage(result?.message || "Compte activé. Vous pouvez maintenant vous connecter.");
      setPassword("");
      setConfirmation("");
    } catch (err) {
      setError(err.message || "Cette invitation est invalide ou expirée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto my-12 max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Activer mon compte</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">Choisissez un mot de passe pour rejoindre votre équipe. Le lien expire après 48 heures.</p>
      {message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">{message}</p>}
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>}
      {token && !message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="invite-password">Nouveau mot de passe</label>
          <input id="invite-password" type="password" autoComplete="new-password" minLength={8} required value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="invite-confirm">Confirmer le mot de passe</label>
          <input id="invite-confirm" type="password" autoComplete="new-password" minLength={8} required value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Activation…" : "Activer le compte"}
          </button>
        </form>
      )}
      {message && <Link to="/connexion" className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">Aller à la connexion</Link>}
    </main>
  );
}
