import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderDynamic from '../../layout/UserHeaderDynamic';
import Footer from '../../layout/footerPrincipal';
import { useAuth } from '../../../context/AuthContext';
import { PERMISSIONS } from '../../../utils/roleUtils';
import MatrizRiesgos from './MatrizRiesgos';
import './RiesgosDashboard.css'; // Reuse container layout styles

const MatrizRiesgosPage = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const permisos = usuario?.permisos || [];

    // Backward-compat: riesgos:gestionar implica todos los sub-permisos de matriz
    const esGestorTotal = permisos.includes(PERMISSIONS.RIESGOS_GESTIONAR);
    const puedeAgregar  = esGestorTotal || permisos.includes(PERMISSIONS.MATRIZ_AGREGAR);
    const puedeEditar   = esGestorTotal || permisos.includes(PERMISSIONS.MATRIZ_EDITAR);
    const puedeEliminar = esGestorTotal || permisos.includes(PERMISSIONS.MATRIZ_ELIMINAR);

    return (
        <div className="riesgos-page">
            <UserHeaderDynamic />

            <main className="riesgos-main">
                {/* Header */}
                <div className="riesgos-header">
                    <button
                        className="riesgos-back-button"
                        onClick={() => navigate('/admin')}
                        aria-label="Volver al panel"
                    >
                        ←
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 className="riesgos-title">📊 Matriz de Análisis de Riesgos</h1>
                        <p className="riesgos-subtitle">
                            Análisis de activos de información, valoración de amenazas y mitigación residual
                        </p>
                    </div>
                </div>

                <MatrizRiesgos
                    puedeAgregar={puedeAgregar}
                    puedeEditar={puedeEditar}
                    puedeEliminar={puedeEliminar}
                />
            </main>

            <Footer />
        </div>
    );
};

export default MatrizRiesgosPage;
