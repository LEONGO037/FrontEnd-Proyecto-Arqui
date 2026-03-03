// components/auth/RoleProtectedRoute.jsx
// Protege rutas según el rol del usuario.
// Si no está autenticado → muestra login.
// Si está autenticado pero sin el rol requerido → redirige al home.
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Login from '../login/login';
import DeniedAccess from './DeniedAccess';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { usuario, getRol, cargando } = useAuth();
    const [showLogin, setShowLogin] = useState(true);

    // 1. Mientras se recupera la sesión de localStorage
    if (cargando) return null;

    // 2. No autenticado — mostrar modal de login
    // Usamos sessionStorage.getItem('role') como señal secundaria de que el login fue exitoso 
    // pero el estado 'usuario' aún se está propagando en React.
    const hasSession = usuario || sessionStorage.getItem('role');

    if (!hasSession) {
        if (!showLogin) return <Navigate to="/" replace />;
        return (
            <div style={{ background: '#f0f4f8', minHeight: '100vh' }}>
                <Navigate to="/" replace />
                <Login
                    onClose={() => setShowLogin(false)}
                    onLoginSuccess={() => setShowLogin(false)}
                />
            </div>
        );
    }

    // 3. Autenticado — Verificar rol
    const rol = getRol();

    if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
        console.warn(`Acceso denegado: El rol [${rol}] intentó acceder a una ruta protegida para [${allowedRoles.join(', ')}].`);
        return <DeniedAccess />;
    }

    // 4. Acceso permitido
    return children;
};

export default RoleProtectedRoute;
