import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { estConnecte } = useAuth();
  const location = useLocation();

  if (!estConnecte) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;