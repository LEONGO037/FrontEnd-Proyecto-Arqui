import React, { useState, useEffect } from 'react';
import './headerPrincipal.css';
import Login from '../login/login'; // Importar el componente

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // Estado para controlar el modal

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    // Aquí puedes redirigir al dashboard o guardar el estado de autenticación
    console.log('Login exitoso');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <div className="logo-icon">X</div>
            <span className="logo-text">
              College <span className="highlight">Nexus</span>
            </span>
          </div>

          <button 
            className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li><a href="#inicio" className="nav-link">Inicio</a></li>
            <li><a href="#cursos" className="nav-link">Cursos</a></li>
            <li><a href="#nosotros" className="nav-link">Facultad</a></li>
            <li className="mobile-only">
              <button 
                className="btn-login"
                onClick={() => {
                  setShowLogin(true);
                  setMobileMenuOpen(false);
                }}
              >
                Iniciar Sesión
              </button>
            </li>
          </ul>

          <div className="navbar-actions">
            <div className="secure-badge">
              <div className="lock-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="badge-text">
                <span className="badge-label">Conexión</span>
                <span className="badge-status">Segura HTTPS</span>
              </div>
            </div>
            <button 
              className="btn-login desktop-only"
              onClick={() => setShowLogin(true)} // Abrir modal al hacer click
            >
              <span>Iniciar Sesión</span>
              <svg className="login-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Renderizar el modal de login condicionalmente */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Header;