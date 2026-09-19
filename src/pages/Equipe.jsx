import { Outlet, NavLink } from 'react-router-dom';

export default function Equipe() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Menu d'onglets pour passer de Membres à Projets */}
      <div className="flex gap-4 border-b border-gray-200 mb-6 pb-2">
        <NavLink
          to="/equipe/membres"
          className={({ isActive }) =>
            isActive
              ? "font-bold text-blue-600 border-b-2 border-blue-600 pb-2"
              : "text-gray-600 hover:text-blue-600 pb-2"
          }
        >
          👥 Membres
        </NavLink>
        <NavLink
          to="/equipe/projets"
          className={({ isActive }) =>
            isActive
              ? "font-bold text-blue-600 border-b-2 border-blue-600 pb-2"
              : "text-gray-600 hover:text-blue-600 pb-2"
          }
        >
          📁 Projets
        </NavLink>
      </div>

      {/* Ici s'affichera le contenu de Membres.jsx ou Projets.jsx */}
      <Outlet />
    </div>
  );
}