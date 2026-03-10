// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

import Header from './components/layout/headerPrincipal';
import Footer from './components/layout/footerPrincipal';
import Home from './features/home/homePrincipal';
import Catalogo from './features/catalogo/catalogoCursos';
import Perfil from './features/perfil/perfilEstudiante';

import AdminHeader from './components/layout/headerAdmin';
import AdminMenu from './components/admin/adminMenu';
import AdministrarCursos from './components/admin/administrarCursos';
import AdminAsignarCursosDocente from './components/admin/adminAsignarCursosDocente';
import AdminPagos from './components/admin/adminPagos';
import AdminPerfil from './components/admin/AdminPerfil';
import AdminUsuarios from './components/admin/adminUsuarios';
import GestionInscripciones from './components/admin/gestionInscripciones';
import AdminReportes from './components/admin/adminReportes';

import EstudiantePagos from './components/estudiante/estudiantePagos';
import HeaderEstudiante from './components/estudiante/headerEstudiante';

import HeaderDocente from './components/docente/headerDocente'; // ← NUEVO
import DocenteMenu from './components/docente/docenteMenu';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { usuario } = useAuth();

  let SelectedHeader = Header;
  if (usuario?.rol === 'ESTUDIANTE') {
    SelectedHeader = HeaderEstudiante;
  } else if (usuario?.rol === 'ADMINISTRADOR') {
    SelectedHeader = AdminHeader;
  } else if (usuario?.rol === 'DOCENTE') {   // ← NUEVO
    SelectedHeader = HeaderDocente;
  }

  return (
    <Router>
      <Routes>

        {/* Ruta pública */}
        <Route
          path="/"
          element={
            <div className="app-wrapper">
              <SelectedHeader />
              <main style={{ minHeight: '80vh' }}><Home /></main>
              <Footer />
            </div>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/cursos"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <SelectedHeader />
                <main style={{ minHeight: '80vh' }}><Catalogo /></main>
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <SelectedHeader />
                <main style={{ minHeight: '80vh' }}><Perfil /></main>
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Pagos estudiante */}
        <Route
          path="/estudiante/pagos"
          element={
            <RoleProtectedRoute allowedRoles={['ESTUDIANTE', 'ADMINISTRADOR']}>
              <EstudiantePagos />
            </RoleProtectedRoute>
          }
        />

        {/* ── ADMIN ── */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminMenu />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/perfil"
          element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminPerfil />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminUsuarios />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/cursos"
          element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdministrarCursos />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/asignar-docente/:cursoId"
          element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminAsignarCursosDocente />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/pagos"
          element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminPagos />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/inscripciones"
          element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <GestionInscripciones />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/reportes"
          element={
            <RoleProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminReportes />
            </RoleProtectedRoute>
          }
        />

        {/* ── DOCENTE ── */}
        <Route
          path="/docente/*"
          element={
            <RoleProtectedRoute allowedRoles={['DOCENTE']}>
              <div className="app-wrapper">
                <HeaderDocente />          {/* ← antes era Header genérico */}
                <main style={{ minHeight: '80vh' }}><DocenteMenu /></main>
                <Footer />
              </div>
            </RoleProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;