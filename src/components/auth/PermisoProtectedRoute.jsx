import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DeniedAccess from './DeniedAccess';
import { tieneAcceso } from '../../utils/navConfig';

// Route guard based on RBAC permissions (not role names).
// permiso === null means "any authenticated user with an active session".
const PermisoProtectedRoute = ({ children, permiso = null }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;
  if (!usuario) return <Navigate to="/" replace />;

  const permisos = usuario.permisos || [];
  if (!tieneAcceso(permisos, permiso)) {
    return <DeniedAccess />;
  }

  return children;
};

export default PermisoProtectedRoute;
