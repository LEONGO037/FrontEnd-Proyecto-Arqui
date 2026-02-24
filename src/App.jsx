// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Header     from './components/layout/headerPrincipal';
import Footer     from './components/layout/footerPrincipal';
import Home       from './features/home/homePrincipal';
import Catalogo   from './features/catalogo/catalogoCursos';
import Perfil     from './features/perfil/perfilEstudiante';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Header />
          <main style={{ minHeight: '80vh' }}>
            <Routes>
              {/* Ruta pública */}
              <Route path="/" element={<Home />} />

              {/* Rutas protegidas — requieren sesión iniciada */}
              <Route path="/cursos" element={
                <ProtectedRoute><Catalogo /></ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute><Perfil /></ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;