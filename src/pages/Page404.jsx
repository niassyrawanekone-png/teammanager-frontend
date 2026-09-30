import { useNavigate } from "react-router-dom";

function Page404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-extrabold text-red-500 tracking-tight">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-4">Oups ! Page introuvable</h2>
      <p className="text-gray-500 mt-2 max-w-md">
        La page que vous recherchez n'existe pas, a été supprimée ou a été déplacée.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none">
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>🏠</span> Retour à l'accueil
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>⬅️</span> Page précédente
        </button>
      </div>
    </div>
  );
}

export default Page404;