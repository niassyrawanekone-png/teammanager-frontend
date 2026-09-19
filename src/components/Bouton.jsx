function Bouton({ texte, onClick, couleur = "#3498db" }) {
  return (
    <button 
      onClick={onClick}
      style={{
        backgroundColor: couleur,
        color: "white",
        border: "none",
        padding: "10px 18px",
        borderRadius: "6px",
        fontSize: "0.95rem",
        cursor: "pointer",
        fontWeight: "bold",
        margin: "5px",
        transition: "opacity 0.2s"
      }}
    >
      {texte}
    </button>
  );
}

export default Bouton;