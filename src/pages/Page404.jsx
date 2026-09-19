import { useNavigate } from 'react-router-dom';

function Page404() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <h1 style={{ fontSize: "72px", margin: "0", color: "#e74c3c" }}>404</h1>
      <h2>Oups ! Page introuvable</h2>
      <p style={{ color: "#7f8c8d" }}>
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>

      <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "center" }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          🏠 Retour à l'accueil
        </button>

        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#95a5a6",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          ⬅️ Page précédente
        </button>
      </div>
    </div>
  );
}

export default Page404;