import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { estConnecte, seDeconnecter } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    seDeconnecter();
    setMenuOuvert(false);
    navigate("/connexion");
  };

  // Styles des liens
  const navLinkStyle = ({ isActive }) =>
    isActive
      ? "text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1 transition-colors"
      : "text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors";

  const mobileNavLinkStyle = ({ isActive }) =>
    isActive
      ? "block py-2 text-base font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 rounded-lg px-3 transition-colors"
      : "block py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg px-3 transition-colors";

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              TeamManager
            </span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/equipe" end className={navLinkStyle}>
              Équipe
            </NavLink>
            <NavLink to="/equipe/projets" className={navLinkStyle}>
              Projets
            </NavLink>
            <NavLink to="/parametres" className={navLinkStyle}>
              Paramètres
            </NavLink>
            <NavLink to="/apropos" className={navLinkStyle}>
              À Propos
            </NavLink>

            {/* Lien Mon Profil visible uniquement si connecté */}
            {estConnecte && (
              <NavLink to="/profil" className={navLinkStyle}>
                Mon Profil
              </NavLink>
            )}

            {/* Connexion / Déconnexion */}
            {estConnecte ? (
              <button
                onClick={handleDeconnexion}
                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
              >
                Déconnexion
              </button>
            ) : (
              <NavLink
                to="/connexion"
                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Connexion
              </NavLink>
            )}
          </div>

          {/* Bouton Hamburger Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMenuOuvert(!menuOuvert)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Ouvrir le menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOuvert ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Menu Déroulant Mobile */}
      {menuOuvert && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pt-2 pb-4 space-y-2">
          <NavLink to="/equipe" end className={mobileNavLinkStyle} onClick={() => setMenuOuvert(false)}>
            Équipe
          </NavLink>
          <NavLink to="/equipe/projets" className={mobileNavLinkStyle} onClick={() => setMenuOuvert(false)}>
            Projets
          </NavLink>
          <NavLink to="/parametres" className={mobileNavLinkStyle} onClick={() => setMenuOuvert(false)}>
            Paramètres
          </NavLink>
          <NavLink to="/apropos" className={mobileNavLinkStyle} onClick={() => setMenuOuvert(false)}>
            À Propos
          </NavLink>

          {estConnecte && (
            <NavLink to="/profil" className={mobileNavLinkStyle} onClick={() => setMenuOuvert(false)}>
              Mon Profil
            </NavLink>
          )}

          {estConnecte ? (
            <button
              onClick={handleDeconnexion}
              className="w-full text-left py-2 px-3 text-base font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          ) : (
            <NavLink
              to="/connexion"
              className={mobileNavLinkStyle}
              onClick={() => setMenuOuvert(false)}
            >
              Connexion
            </NavLink>
          )}
        </div>
      )}    
    </nav>
  );
}

export default Navbar;