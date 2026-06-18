// components/auth/RoleProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DeniedAccess from './DeniedAccess';
import { getToken } from '../../utils/tokenStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Reporta al backend cuando un usuario autenticado intenta acceder a una
// ruta restringida por rol. Alimenta la detección RC-004.
const reportarDenegacion = (rutaIntentada, rolesPermitidos) => {
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
            permiso_requerido: `rol:${rolesPermitidos.join('|')}`,
        }),
        keepalive: true,
    }).catch(() => { });
};

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { usuario, getRol, cargando } = useAuth();
    const location = useLocation();

    const rol = getRol();
    const denegado = !!usuario && allowedRoles.length > 0 && !allowedRoles.includes(rol);

    useEffect(() => {
        if (!cargando && denegado) {
            reportarDenegacion(location.pathname, allowedRoles);
        }
    }, [cargando, denegado, location.pathname, allowedRoles]);

    if (cargando) return null;

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    if (denegado) {
        return <DeniedAccess />;
    }

    return children;
};

export default RoleProtectedRoute;
