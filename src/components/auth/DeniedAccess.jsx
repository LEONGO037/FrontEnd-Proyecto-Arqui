// DeniedAccess.jsx — Pantalla de acceso denegado (403)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../layout/headerPrincipal';
import Footer from '../layout/footerPrincipal';
import './DeniedAccess.css';

const DeniedAccess = () => {
    const navigate = useNavigate();

    return (
        <div className="denied-page">
            <Header />
            <main className="denied-main">
                <div className="denied-container">
                    <div className="denied-icon-wrapper">
                        <div className="denied-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                <line x1="8" y1="16" x2="8" y2="16" />
                                <line x1="12" y1="16" x2="12" y2="16" />
                                <line x1="16" y1="16" x2="16" y2="16" />
                            </svg>
                        </div>
                        <div className="denied-pulse" />
                    </div>

                    <h1 className="denied-title">Acceso Restringido</h1>
                    <p className="denied-text">
                        Lo sentimos, no tienes los permisos necesarios para acceder a esta sección de <strong>X-College Nexus</strong>.
                    </p>

                    <div className="denied-details">
                        <p>Si crees que esto es un error, por favor contacta al administrador del sistema.</p>
                    </div>

                    <button className="denied-btn" onClick={() => navigate('/')}>
                        <span>Volver al Inicio</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DeniedAccess;
