function CarteUtilisateur({ id, nom, role, email, onSupprimer, onModifierRole }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between text-left">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-gray-800 truncate">{nom}</h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            {role}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4 truncate">✉️ {email}</p>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-2">
        <button 
          onClick={() => onModifierRole(id, "Admin")}
          className="flex-1 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition"
        >
          ⚡ Admin
        </button>
        <button 
          onClick={() => onSupprimer(id)}
          className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default CarteUtilisateur;