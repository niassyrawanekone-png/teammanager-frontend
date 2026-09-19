import { useParams, Link } from 'react-router-dom';

function ProfilUtilisateur() {
  // Récupération du paramètre :id présent dans l'URL
  const { id } = useParams();

  return (
    <div style={{
      textAlign: "center",
      padding: "30px",
      border: "1px solid #ccc",
      borderRadius: "10px",
      marginTop: "20px"
    }}>
      <h1>👤 Profil du Membre N°{id}</h1>
      <p>Vous consultez actuellement la page détaillée de l'utilisateur avec l'identifiant <strong>{id}</strong>.</p>
      
      <div style={{ marginTop: "20px" }}>
        <Link to="/equipe" style={{
          padding: "8px 15px",
          backgroundColor: "#3498db",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px"
        }}>
          ⬅️ Retour à l'équipe
        </Link>
      </div>
    </div>
  );
}

export default ProfilUtilisateur;