import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DeniedAccess from './DeniedAccess';
import { tieneAcceso } from '../../utils/navConfig';
import { getToken } from '../../utils/tokenStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Reporta al backend cuando un usuario autenticado intenta acceder a una
// ruta protegida sin tener el permiso. Esto alimenta la detección RC-004
// (acceso a ruta sin permisos correspondientes) aunque el frontend bloquee
// la navegación antes de hacer requests.
const reportarDenegacion = (rutaIntentada, permisoRequerido) => {
  const token = getToken();
  if (!token) return;
  fetch(`${API_BASE}/api/riesgos/reportar-denegacion-frontend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ruta_intentada: rutaIntentada,
      permiso_requerido: permisoRequerido,
    }),
    keepalive: true,
  }).catch(() => { });
};

// Route guard based on RBAC permissions (not role names).
// permiso === null means "any authenticated user with an active session".
const PermisoProtectedRoute = ({ children, permiso = null }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  const permisos = usuario?.permisos || [];
  const acceso = tieneAcceso(permisos, permiso);

  useEffect(() => {
    if (!cargando && usuario && !acceso) {
      reportarDenegacion(location.pathname, permiso);
    }
  }, [cargando, usuario, acceso, location.pathname, permiso]);

  if (cargando) return null;
  if (!usuario) return <Navigate to="/" replace />;
  if (!acceso) return <DeniedAccess />;

  return children;
};

export default PermisoProtectedRoute;
