import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from "../services/api";
import { normalizeRole } from "../services/roles";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || localStorage.getItem("token"));
  const [estConnecte, setEstConnecte] = useState(() =>
    Boolean(sessionStorage.getItem("token") || localStorage.getItem("token"))
  );
  // Nouvel état : stocke les infos de l'utilisateur (id, nom, email, role)
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);
  const [loading, setLoading] = useState(() =>
    Boolean(sessionStorage.getItem("token") || localStorage.getItem("token"))
  );

  // Vérification de la session au démarrage
  useEffect(() => {
    const savedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (savedToken) {
      // On tente de charger le profil de l'utilisateur connecté depuis l'API
      fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Token invalide");
        })
        .then((user) => setUtilisateurConnecte(user))
        .catch((error) => {
          console.error("Erreur de récupération du profil:", error);
          // Si le token est invalide/expiré, on déconnecte
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          sessionStorage.removeItem("user");
          localStorage.removeItem("user");
          setToken(null);
          setEstConnecte(false);
          setUtilisateurConnecte(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const seConnecter = async (utilisateur, newToken) => {
    sessionStorage.setItem("token", newToken);
    localStorage.setItem("token", newToken);
    sessionStorage.setItem("user", JSON.stringify(utilisateur));
    localStorage.setItem("user", JSON.stringify(utilisateur));
    setToken(newToken);
    setUtilisateurConnecte(utilisateur);
    setEstConnecte(true);

    // Récupérer le profil juste après la connexion
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      if (res.ok) {
        const user = await res.json();
        setUtilisateurConnecte(user);
      }
    } catch (err) {
      console.error("Erreur de récupération du profil:", err);
    }
  };

  const seDeconnecter = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    setToken(null);
    setEstConnecte(false);
    setUtilisateurConnecte(null);
  };

  // L'interface distingue le privilège global du chef d'espace.
  const role = normalizeRole(utilisateurConnecte?.role);
  const estAdmin = role === "SUPER_ADMIN";
  const estChefProjet = role === "CHEF_DE_PROJET";

  return (
    <AuthContext.Provider
      value={{
        estConnecte,
        token,
        utilisateurConnecte,
        estAdmin,
        estChefProjet,
        seConnecter,
        seDeconnecter,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Le hook est exporté depuis ce contexte, comme dans le template Vite.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
