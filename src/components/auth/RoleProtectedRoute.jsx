// components/auth/RoleProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DeniedAccess from './DeniedAccess';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { usuario, getRol, cargando } = useAuth();

    if (cargando) return null;

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    const rol = getRol();

    if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
        console.warn(`Acceso denegado: El rol [${rol}] intentó acceder a una ruta protegida para [${allowedRoles.join(', ')}].`);
        return <DeniedAccess />;
    }

    return children;
};

export default RoleProtectedRoute;
