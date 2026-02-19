// footerPrincipal.jsx
import React from 'react';
import './footerPrincipal.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                fill="#001a33"/>
        </svg>
      </div>
      
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">X</div>
              <span>X-College Nexus</span>
            </div>
            <p className="footer-desc">
              Sistema integral de gestión de cursos extraacadémicos para
              College Nexus. Desarrollado con tecnología de vanguardia 
              para una experiencia educativa superior.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Plataforma</h4>
              <ul>
                <li><a href="#">Explorar Cursos</a></li>
                <li><a href="#">Calendario Académico</a></li>
                <li><a href="#">Validación de Prerrequisitos</a></li>
                <li><a href="#">Pagos y Facturación</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Soporte</h4>
              <ul>
                <li><a href="#">Centro de Ayuda</a></li>
                <li><a href="#">Guía de Usuario</a></li>
                <li><a href="#">Términos y Condiciones</a></li>
                <li><a href="#">Política de Privacidad</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Institución</h4>
              <ul>
                <li className="institution-info">
                  <span className="label">Universidad</span>
                  <span className="value">College Nexus</span>
                </li>
                <li className="institution-info">
                  <span className="label">Unidad</span>
                  <span className="value">Facultad Experimental</span>
                </li>
                <li className="institution-info">
                  <span className="label">Patrocinador</span>
                  <span className="value">Empresa de Eventos Chuno</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} X-College Nexus. Todos los derechos reservados.</p>
            <div className="footer-badges">
              <span className="badge">🔒 SSL Seguro</span>
              <span className="badge">⚡ React Powered</span>
              <span className="badge">🇧🇴 Hecho en Bolivia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;