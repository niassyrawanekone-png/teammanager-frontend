import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Fonction pour appliquer le style actif dynamiquement sur Desktop
  const navLinkStyle = ({ isActive }) =>
    isActive
      ? "text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1"
      : "text-sm font-medium text-gray-500 hover:text-gray-900 transition";

  // Fonction pour appliquer le style actif sur Mobile
  const mobileNavLinkStyle = ({ isActive }) =>
    isActive
      ? "block py-2 text-base font-medium text-blue-600 bg-blue-50 rounded-lg px-3"
      : "block py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg px-3";

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Nom de l'application */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TeamManager
            </span>
          </Link>

          {/* Liens Ordinateur (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/equipe" className={navLinkStyle}>
              Équipe
            </NavLink>
            <NavLink to="/projets" className={navLinkStyle}>
              Projets
            </NavLink>
            <NavLink to="/parametres" className={navLinkStyle}>
              Paramètres
            </NavLink>
          </div>

          {/* Bouton Menu Mobile (Hamburger) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOuvert(!menuOuvert)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
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
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-2">
          <NavLink
            to="/equipe"
            className={mobileNavLinkStyle}
            onClick={() => setMenuOuvert(false)}
          >
            Équipe
          </NavLink>
          <NavLink
            to="/projets"
            className={mobileNavLinkStyle}
            onClick={() => setMenuOuvert(false)}
          >
            Projets
          </NavLink>
          <NavLink
            to="/parametres"
            className={mobileNavLinkStyle}
            onClick={() => setMenuOuvert(false)}
          >
            Paramètres
          </NavLink>
        </div>
      )}
    </nav>
  );
}

export default Navbar;