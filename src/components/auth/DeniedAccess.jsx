import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../layout/headerPrincipal';
import UserHeaderDynamic from '../layout/UserHeaderDynamic';
import Footer from '../layout/footerPrincipal';
import { ROLES } from '../../utils/roleUtils';
import './DeniedAccess.css';

const DeniedAccess = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const rol = usuario?.rol;
  const isAdmin = rol && rol !== ROLES.ESTUDIANTE && rol !== ROLES.DOCENTE;
  const SelectedHeader = isAdmin ? UserHeaderDynamic : Header;

  const handleBack = () => {
    if (isAdmin) navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="denied-page">
      <SelectedHeader />
      <main className="denied-main">
        <div className="denied-container">
          <div className="denied-icon-wrapper">
            <div className="denied-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="denied-pulse" />
          </div>

          <h1 className="denied-title">Acceso Restringido</h1>
          <p className="denied-text">
            No tienes los permisos necesarios para acceder a esta sección de <strong>College Nexus</strong>.
          </p>

          <div className="denied-details">
            <p>Si crees que esto es un error, contacta al administrador de seguridad.</p>
          </div>

          <button className="denied-btn" onClick={handleBack}>
            <span>{isAdmin ? 'Volver al Panel' : 'Volver al Inicio'}</span>
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
