import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderDynamic from '../layout/UserHeaderDynamic';
import Footer from '../layout/footerPrincipal';
import { getUsuarios, desbloquearUsuario, deleteUser } from '../../services/rbacApi';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roleUtils';
import './adminUsuarios.css';
import './AdminGestionUsuarios.css';

const ROL_BADGE = {
  [ROLES.ADMINISTRADOR]:   { bg: '#fef3c7', color: '#92400e' },
  [ROLES.ADMIN_CUENTAS]:   { bg: '#e0e7ff', color: '#3730a3' },
  [ROLES.ADMIN_SEGURIDAD]: { bg: '#fee2e2', color: '#991b1b' },
  [ROLES.ADMIN_CURSOS]:    { bg: '#d1fae5', color: '#065f46' },
  [ROLES.ADMIN_PAGOS]:     { bg: '#ede9fe', color: '#5b21b6' },
  [ROLES.ADMIN_REPORTES]:  { bg: '#fce7f3', color: '#9d174d' },
  [ROLES.DOCENTE]:         { bg: '#dbeafe', color: '#1e40af' },
  [ROLES.ESTUDIANTE]:      { bg: '#f0fdf4', color: '#166534' },
};

const rolBadgeStyle = (nombre) => {
  const s = ROL_BADGE[nombre] || { bg: '#f1f5f9', color: '#475569' };
  return { background: s.bg, color: s.color, padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' };
};

const isBloqueado = (hasta) => hasta && new Date(hasta) > new Date();

export default function AdminGestionUsuarios() {
  const navigate = useNavigate();
  const { usuario: self } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  // Modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(null);
  const [submittingDel, setSubmittingDel] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const u = await getUsuarios();
      setUsuarios(u);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleDesbloquear = async (u) => {
    setError(''); setSuccess('');
    try {
      await desbloquearUsuario(u.id);
      setSuccess(`${u.nombre} desbloqueado correctamente.`);
      cargar();
    } catch (err) {
      setError(err.message || 'Error al desbloquear');
    }
  };

  const handleEliminar = async () => {
    setSubmittingDel(true);
    setError('');
    try {
      await deleteUser(modalEliminar.id);
      setSuccess(`Usuario ${modalEliminar.nombre} eliminado.`);
      setModalEliminar(null);
      cargar();
    } catch (err) {
      setError(err.message || 'Error al eliminar usuario');
    } finally {
      setSubmittingDel(false);
    }
  };

  const filtrados = usuarios.filter(u => {
    const texto = busqueda.toLowerCase();
    const coincideTexto = !texto ||
      u.nombre?.toLowerCase().includes(texto) ||
      u.apellido_paterno?.toLowerCase().includes(texto) ||
      u.email?.toLowerCase().includes(texto);
    const coincideRol = !filtroRol || u.rol_nombre === filtroRol;
    return coincideTexto && coincideRol;
  });

  const rolesUnicos = [...new Set(usuarios.map(u => u.rol_nombre).filter(Boolean))].sort();

  return (
    <div className="admin-page">
      <UserHeaderDynamic />

      <main className="admin-main">
        <div className="admin-usuarios-container">

          {/* Header */}
          <div className="admin-usuarios-header">
            <div className="header-title-section">
              <button className="btn-back-circle" onClick={() => navigate('/admin')} title="Volver">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div>
                <h1 className="admin-usuarios-title">Gestión de Usuarios</h1>
                <p className="admin-usuarios-subtitle">Administra cuentas y accesos del sistema</p>
              </div>
            </div>
            <div className="gu-badge-count">{filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}</div>
          </div>

          {error && <div className="admin-error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
          {success && <div className="admin-success-box" style={{ marginBottom: '1rem' }}>{success}</div>}

          {/* Filtros */}
          <div className="gu-filtros">
            <input
              className="gu-search"
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <select
              className="gu-select"
              value={filtroRol}
              onChange={e => setFiltroRol(e.target.value)}
            >
              <option value="">Todos los roles</option>
              {rolesUnicos.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Tabla */}
          <div className="usuarios-table-container">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Email Verificado</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Cargando usuarios...</td></tr>
                ) : filtrados.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No se encontraron usuarios.</td></tr>
                ) : filtrados.map(u => {
                  const bloqueado = isBloqueado(u.bloqueado_hasta);
                  const esSelf = self && String(u.id) === String(self.id);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="docente-avatar-cell">
                          <div className="mini-avatar" style={{ background: esSelf ? '#fef3c7' : '#eef2ff', color: esSelf ? '#92400e' : '#4f46e5' }}>
                            {u.nombre?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{u.nombre} {u.apellido_paterno}</div>
                            {esSelf && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(tú)</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#475569' }}>{u.email}</td>
                      <td>
                        {u.email_verificado
                          ? <span className="gu-badge-verified">✓ Verificado</span>
                          : <span className="gu-badge-unverified">✗ Pendiente</span>
                        }
                      </td>
                      <td><span style={rolBadgeStyle(u.rol_nombre)}>{u.rol_nombre || '—'}</span></td>
                      <td>
                        {bloqueado
                          ? <span className="gu-badge-blocked">Bloqueado</span>
                          : <span className="gu-badge-active">Activo</span>
                        }
                      </td>
                      <td>
                        <div className="gu-actions">
                          {bloqueado && (
                            <button className="gu-btn gu-btn-unlock" onClick={() => handleDesbloquear(u)} title="Desbloquear">
                              🔓 Desbloquear
                            </button>
                          )}
                          {!esSelf && (
                            <button className="gu-btn gu-btn-delete" onClick={() => setModalEliminar(u)} title="Eliminar">
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Confirmar Eliminación */}
      {modalEliminar && (
        <div className="modal-overlay" onClick={() => setModalEliminar(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Eliminar Usuario</h2>
              <button className="close-modal" onClick={() => setModalEliminar(null)}>&times;</button>
            </div>
            <div style={{ padding: '1.75rem 2rem' }}>
              <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
                ¿Seguro que deseas eliminar a <strong>{modalEliminar.nombre} {modalEliminar.apellido_paterno}</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="form-actions" style={{ marginTop: 0 }}>
                <button type="button" className="btn-cancel" onClick={() => setModalEliminar(null)}>Cancelar</button>
                <button
                  type="button"
                  className="btn-submit"
                  style={{ background: '#dc2626' }}
                  disabled={submittingDel}
                  onClick={handleEliminar}
                >
                  {submittingDel ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
