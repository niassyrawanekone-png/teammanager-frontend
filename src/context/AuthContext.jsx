import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [estConnecte, setEstConnecte] = useState(false);
  const [token, setToken] = useState(null);
  // Nouvel état : stocke les infos de l'utilisateur (id, nom, email, role)
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérification de la session au démarrage
  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setEstConnecte(true);
      
      // On tente de charger le profil de l'utilisateur connecté depuis l'API
      fetch("http://127.0.0.1:8000/api/me", {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Token invalide");
        })
        .then((user) => setUtilisateurConnecte(user))
        .catch(() => {
          // Si le token est invalide/expiré, on déconnecte
          sessionStorage.removeItem("token");
          setToken(null);
          setEstConnecte(false);
          setUtilisateurConnecte(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const seConnecter = async (newToken) => {
    sessionStorage.setItem("token", newToken);
    setToken(newToken);
    setEstConnecte(true);

    // Récupérer le profil juste après la connexion
    try {
      const res = await fetch("http://127.0.0.1:8000/api/me", {
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
    setToken(null);
    setEstConnecte(false);
    setUtilisateurConnecte(null);
  };

  // Indique facilement si l'utilisateur actuellement connecté est un Administrateur
  const estAdmin = utilisateurConnecte?.role === "Admin";

  return (
    <AuthContext.Provider
      value={{
        estConnecte,
        token,
        utilisateurConnecte,
        estAdmin,
        seConnecter,
        seDeconnecter,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);