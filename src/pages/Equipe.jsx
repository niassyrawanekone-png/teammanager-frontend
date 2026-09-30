import { Outlet, NavLink } from 'react-router-dom';

export default function Equipe() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Menu d'onglets de section */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 pb-2">
        <NavLink
          to="/equipe/membres"
          className={({ isActive }) =>
            isActive
              ? "font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-2 transition-colors"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 pb-2 transition-colors"
          }
        >
          👥 Membres
        </NavLink>
        <NavLink
          to="/equipe/projets"
          className={({ isActive }) =>
            isActive
              ? "font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-2 transition-colors"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 pb-2 transition-colors"
          }
        >
          📁 Projets
        </NavLink>
      </div>

      {/* Rendu dynamique des sous-pages (Membres ou Projets) */}
      <Outlet />
    </div>
  );
}