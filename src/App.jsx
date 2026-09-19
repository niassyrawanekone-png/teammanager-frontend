import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Accueil from './pages/Accueil';
import Equipe from './pages/Equipe';
import Membres from './pages/equipe/Membres';
import Projets from './pages/equipe/Projets';
import ProfilUtilisateur from './pages/ProfilUtilisateur';
import APropos from './pages/APropos';
import Page404 from './pages/Page404';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />

        <main className="py-8 px-4">
          <Routes>
            <Route path="/" element={<Accueil />} />
            
            {/* Routes pour l'équipe et les projets */}
            <Route path="/equipe" element={<Equipe />}>
              {/* Redirige /equipe directement vers /equipe/membres */}
              <Route index element={<Navigate to="membres" replace />} />
              <Route path="membres" element={<Membres />} />
              <Route path="projets" element={<Projets />} />
            </Route>

            <Route path="/equipe/:id" element={<ProfilUtilisateur />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="*" element={<Page404 />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;