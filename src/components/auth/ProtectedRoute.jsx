// ProtectedRoute.jsx
// Redirige al home si el usuario no está autenticado, abriendo el modal de login
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Login from '../login/login';

const ProtectedRoute = ({ children }) => {
  const { usuario } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  // Si ya está autenticado, mostrar el contenido normalmente
  if (usuario) return children;

  // Si no está autenticado y cierra el modal, redirigir al home
  if (!showLogin) return <Navigate to="/" replace />;

  // Si no está autenticado, mostrar login sobre el home
  return (
    <>
      <Navigate to="/" replace />
      <Login
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => setShowLogin(false)}
      />
    </>
  );
};

export default ProtectedRoute;
