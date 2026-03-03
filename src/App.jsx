// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

import Header from './components/layout/headerPrincipal';
import Footer from './components/layout/footerPrincipal';
import Home from './features/home/homePrincipal';
import Catalogo from './features/catalogo/catalogoCursos';
import Perfil from './features/perfil/perfilEstudiante';
import AdminMenu from './components/admin/adminMenu';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/" element={
            <div className="app-wrapper">
              <Header />
              <main style={{ minHeight: '80vh' }}><Home /></main>
              <Footer />
            </div>
          } />

          {/* Rutas protegidas — requieren sesión */}
          <Route path="/cursos" element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Header />
                <main style={{ minHeight: '80vh' }}><Catalogo /></main>
                <Footer />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Header />
                <main style={{ minHeight: '80vh' }}><Perfil /></main>
                <Footer />
              </div>
            </ProtectedRoute>
          } />

          {/* Rutas protegidas por rol — ADMINISTRADOR */}
          <Route path="/admin/*" element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminMenu />
            </RoleProtectedRoute>
          } />

          {/* Rutas protegidas por rol — DOCENTE */}
          <Route path="/docente/*" element={
            <RoleProtectedRoute allowedRoles={['DOCENTE']}>
              {/* DocenteMenu — próximamente */}
              <div className="app-wrapper">
                <Header />
                <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <h2 style={{ color: '#003366' }}>Panel Docente — En construcción</h2>
                </main>
                <Footer />
              </div>
            </RoleProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;