import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_LINKS, tieneAcceso } from '../../utils/navConfig';
import { ROLES } from '../../utils/roleUtils';
import CambiarPasswordPanel from '../auth/CambiarPasswordPanel';
import './headerPrincipal.css';

const ROL_LABELS = {
  [ROLES.ADMIN_CUENTAS]:   'Admin. Cuentas',
  [ROLES.ADMIN_SEGURIDAD]: 'Admin. Seguridad',
  [ROLES.ADMIN_CURSOS]:    'Admin. Cursos',
  [ROLES.ADMIN_PAGOS]:     'Admin. Pagos',
  [ROLES.ADMIN_REPORTES]:  'Admin. Reportes',
  [ROLES.ADMINISTRADOR]:   'Administrador',
  [ROLES.DOCENTE]:         'Docente',
  [ROLES.ESTUDIANTE]:      'Estudiante',
};

const UserHeaderDynamic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  const permisos = usuario?.permisos || [];
  const rol = usuario?.rol || '';

  const [scrolled, setScrolled]             = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu]     = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = () => setShowUserMenu(false);
    if (showUserMenu) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showUserMenu]);

  const visibleLinks = NAV_LINKS.filter((l) => tieneAcceso(permisos, l.permiso));

  const isActive = (link) =>
    link.exact
      ? location.pathname === link.path
      : location.pathname === link.path || location.pathname.startsWith(link.path + '/');

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const nombreAdmin = usuario?.nombre || 'Administrador';

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo → Inicio */}
          <div
            className="navbar-logo"
            style={{ cursor: 'pointer' }}
            onClick={() => handleNavigate('/admin')}
          >
            <div className="logo-icon">X</div>
            <span className="logo-text">College <span className="highlight">Nexus</span></span>
          </div>

          {/* Mobile toggle */}
          <button
            className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú de navegación"
          >
            <span /><span /><span />
          </button>

          {/* Nav links */}
          <ul className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
            {visibleLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.path}
                  className={`nav-link ${isActive(link) ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavigate(link.path); }}
                >
                  {link.label}
                </a>
              </li>
            ))}

            <li className="mobile-only">
              <button className="btn-login" onClick={handleLogout}>Cerrar Sesión</button>
            </li>
          </ul>

          {/* Right actions */}
          <div className="navbar-actions">
            <div className="secure-badge" title={`${permisos.length} permisos activos`}>
              <div className="lock-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="badge-text">
                <span className="badge-label">{ROL_LABELS[rol] || rol || 'Admin'}</span>
                <span className="badge-status">{permisos.length} permisos</span>
              </div>
            </div>

            {/* Avatar dropdown */}
            <div style={{ position: 'relative' }} className="desktop-only">
              <button
                onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8cc63f, #7ab332)',
                  border: '2px solid rgba(140,198,63,0.5)',
                  color: '#003366', fontWeight: 800, fontSize: '0.95rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                  minWidth: 240, zIndex: 2000,
                  animation: 'fadeDown 0.2s ease',
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f2f5', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#003366', fontSize: '0.95rem' }}>{nombreAdmin}</div>
                    <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{usuario?.email}</div>
                    <div style={{
                      marginTop: '0.4rem', display: 'inline-flex', alignItems: 'center',
                      background: '#eff6ff', color: '#1d4ed8',
                      padding: '0.15rem 0.55rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                    }}>
                      {ROL_LABELS[rol] || rol}
                    </div>
                  </div>

                  {permisos.length > 0 && (
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid #f0f2f5', marginBottom: '0.25rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Permisos activos
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {permisos.map((p) => (
                          <span key={p} style={{
                            background: '#dcfce7', color: '#166534',
                            padding: '0.1rem 0.45rem', borderRadius: 20,
                            fontSize: '0.68rem', fontWeight: 600,
                          }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <DropdownBtn onClick={() => handleNavigate('/admin')}>
                    Panel de Control
                  </DropdownBtn>
                  <DropdownBtn onClick={() => { setShowPasswordModal(true); setShowUserMenu(false); }}>
                    Cambiar contraseña
                  </DropdownBtn>
                  <DropdownBtn onClick={handleLogout} danger>
                    Cerrar sesión
                  </DropdownBtn>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeDown {
            from { opacity:0; transform:translateY(-8px); }
            to   { opacity:1; transform:translateY(0); }
          }
        `}</style>
      </nav>

      <CambiarPasswordPanel
        titulo="Cambiar contraseña"
        renderTrigger={false}
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </>
  );
};

const DropdownBtn = ({ onClick, children, danger }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', background: 'none', border: 'none',
      padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer',
      borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit',
      color: danger ? '#dc2626' : '#333',
      transition: 'background 0.15s',
      ...(danger ? { marginTop: '0.25rem', borderTop: '1px solid #f0f2f5' } : {}),
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = danger ? '#fef2f2' : '#f5f7fa'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
  >
    {children}
  </button>
);

export default UserHeaderDynamic;
