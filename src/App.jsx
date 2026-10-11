import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Accueil from './pages/Accueil';
import Connexion from './pages/connexion';
import Equipe from './pages/Equipe';
import Membres from './pages/equipe/Membres';
import Projets from './pages/equipe/Projets';
import ProfilUtilisateur from './pages/ProfilUtilisateur';
import APropos from './pages/APropos';
import Parametres from './pages/Parametres';
import Page404 from './pages/Page404';
import Profil from './pages/Profil';
import EspacePartage from './pages/EspacePartage';
import Inscription from './pages/Inscription';
import MotDePasseOublie from './pages/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';
import ActiverCompte from './pages/ActiverCompte';
import AssistantIA from './pages/AssistantIA';
import Administration from './pages/Administration';

function App() {
  // Appliquer le thème enregistré dans localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "sombre") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[var(--tm-bg)] text-[var(--tm-text)] transition-colors duration-200">
          <Navbar />

          <main className="py-8 px-4">
            <Routes>
              {/* Routes Publiques */}
              <Route path="/" element={<Accueil />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/inscription" element={<Inscription />} />
              <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
              <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
              <Route path="/activer-compte" element={<ActiverCompte />} />
              <Route path="/apropos" element={<APropos />} />

              {/* Redirection si quelqu'un cherche /partage vers /espace-partage */}
              <Route path="/partage" element={<Navigate to="/espace-partage" replace />} />

              {/* Routes Protégées */}
              <Route
                path="/equipe"
                element={
                  <ProtectedRoute>
                    <Equipe />
                  </ProtectedRoute>
                }
              >
                {/* Redirige /equipe directement vers /equipe/membres */}
                <Route index element={<Navigate to="membres" replace />} />
                <Route path="membres" element={<Membres />} />
                <Route path="projets" element={<Projets />} />
              </Route>

              <Route
                path="/equipe/:id"
                element={
                  <ProtectedRoute>
                    <ProfilUtilisateur />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/parametres"
                element={
                  <ProtectedRoute>
                    <Parametres />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profil"
                element={
                  <ProtectedRoute>
                    <Profil />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/espace-partage"
                element={
                  <ProtectedRoute>
                    <EspacePartage />
                  </ProtectedRoute>
                }
              />
              <Route path="/assistant-ia" element={<ProtectedRoute><AssistantIA /></ProtectedRoute>} />
              <Route path="/administration" element={<ProtectedRoute><Administration /></ProtectedRoute>} />

              {/* Route Fallback */}
              <Route path="*" element={<Page404 />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
