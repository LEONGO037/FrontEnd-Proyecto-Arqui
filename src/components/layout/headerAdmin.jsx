import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './headerPrincipal.css';

const HeaderAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Efecto para cambiar estilo al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú de usuario al hacer click fuera
  useEffect(() => {
    const handler = () => setShowUserMenu(false);
    if (showUserMenu) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showUserMenu]);

  // Definición de los enlaces de administración
  const adminLinks = [
    { path: '/admin', label: 'Inicio', exact: true },
    { path: '/admin/usuarios', label: 'Usuarios' },
    { path: '/admin/cursos', label: 'Cursos' },
    { path: '/admin/inscripciones', label: 'Inscripciones' },
    { path: '/admin/pagos', label: 'Pagos' },
    { path: '/admin/reportes', label: 'Reportes' },
  ];

  // Función para determinar si un enlace está activo
  const isActive = (link) => {
    if (link.exact) return location.pathname === link.path;
    return location.pathname.startsWith(link.path);
  };

  // Iniciales del usuario para el avatar
  const iniciales = usuario
    ? usuario.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'; // Fallback por si no hay usuario (no debería pasar)

  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  // Navegar y cerrar menú móvil
  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo - lleva al inicio público (o se puede cambiar a /admin si se prefiere) */}
        <div className="navbar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="logo-icon">X</div>
          <span className="logo-text">College <span className="highlight">Nexus</span></span>
        </div>

        {/* Toggle móvil */}
        <button
          className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú de navegación"
        >
          <span /><span /><span />
        </button>

        {/* Links de navegación para admin */}
        <ul className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          {adminLinks.map((link) => (
            <li key={link.path}>
              <a
                href={link.path}
                className={`nav-link ${isActive(link) ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate(link.path);
                }}
              >
                {link.label}
              </a>
            </li>
          ))}

          {/* Opción adicional para móvil: Cerrar sesión */}
          <li className="mobile-only">
            <button className="btn-login" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </li>
        </ul>

        {/* Acciones del lado derecho */}
        <div className="navbar-actions">
          {/* Badge de seguridad (opcional, se puede mantener o quitar) */}
          <div className="secure-badge">
            <div className="lock-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="badge-text">
              <span className="badge-label">Admin</span>
              <span className="badge-status">Privado</span>
            </div>
          </div>

          {/* Avatar con menú desplegable (solo escritorio) */}
          <div style={{ position: 'relative' }} className="desktop-only">
            <button
              onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'linear-gradient(135deg, #8cc63f, #7ab332)',
                border: '2px solid rgba(140,198,63,0.5)',
                color: '#003366', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}
            >
              {iniciales}
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0,
                background: 'white', border: '1px solid #e8edf3',
                borderRadius: 14, padding: '0.5rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                minWidth: 220, zIndex: 2000,
                animation: 'fadeDown 0.2s ease',
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f2f5', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#003366', fontSize: '0.95rem' }}>{usuario?.nombre || 'Admin'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{usuario?.email || 'admin@sistema.com'}</div>
                </div>
                <button
                  onClick={() => handleNavigate('/admin/perfil')}
                  style={{
                    width: '100%', background: 'none', border: 'none', padding: '0.6rem 1rem',
                    textAlign: 'left', cursor: 'pointer', borderRadius: 8, fontSize: '0.9rem',
                    color: '#333', fontFamily: 'inherit', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#f5f7fa'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  🛠️ Mi Perfil (Admin)
                </button>
                <button
                  onClick={() => handleNavigate('/admin')}
                  style={{
                    width: '100%', background: 'none', border: 'none', padding: '0.6rem 1rem',
                    textAlign: 'left', cursor: 'pointer', borderRadius: 8, fontSize: '0.9rem',
                    color: '#333', fontFamily: 'inherit', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#f5f7fa'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  📊 Panel de Control
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', background: 'none', border: 'none', padding: '0.6rem 1rem',
                    textAlign: 'left', cursor: 'pointer', borderRadius: 8, fontSize: '0.9rem',
                    color: '#dc2626', fontFamily: 'inherit', transition: 'background 0.2s',
                    marginTop: '0.25rem', borderTop: '1px solid #f0f2f5',
                  }}
                  onMouseEnter={e => e.target.style.background = '#fef2f2'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animación para el menú desplegable (misma que en headerPrincipal) */}
      <style>{`
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default HeaderAdmin;