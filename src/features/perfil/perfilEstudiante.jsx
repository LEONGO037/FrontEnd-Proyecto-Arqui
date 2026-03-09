// perfilEstudiante.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CursoDetalle from '../../components/cursoDetalle/CursoDetalle';
import './perfilEstudiante.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CURSO_VISUAL = [
  { icono: '💻', color: 'linear-gradient(135deg,#003366,#0055aa)', categoria: 'Tecnología' },
  { icono: '📐', color: 'linear-gradient(135deg,#1e3a5f,#2e6da4)', categoria: 'Ciencias' },
  { icono: '📊', color: 'linear-gradient(135deg,#5a8a1a,#8cc63f)', categoria: 'Negocios' },
  { icono: '🌎', color: 'linear-gradient(135deg,#4338ca,#6366f1)', categoria: 'Idiomas' },
  { icono: '🎨', color: 'linear-gradient(135deg,#b45309,#f59e0b)', categoria: 'Diseño' },
  { icono: '📈', color: 'linear-gradient(135deg,#065f46,#10b981)', categoria: 'Datos' },
];

const IconUser   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCal    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconEye    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconTrash  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconPlus   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconLogout = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconInfo   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const Toast = ({ msg }) => (
  <div className="toast info">
    <IconInfo /><span>{msg}</span>
  </div>
);

const PerfilCursoCard = ({ cursoId, datos, onBaja, onVerDetalle }) => (
  <div className="perfil-curso-card">
    <div className="pccard-banner" style={{ background: datos.color }}>
      <span style={{ position: 'relative', zIndex: 2 }}>{datos.icono}</span>
    </div>
    <div className="pccard-body">
      <div className="pccard-top">
        <div>
          <div className="pccard-titulo">{datos.nombre}</div>
          <div className="pccard-codigo">{datos.codigo}</div>
        </div>
        <span className="pccard-badge">Inscrito</span>
      </div>

      <div className="pccard-meta">
        <div className="pccard-meta-item"><IconUser />{datos.docente}</div>
        <div className="pccard-meta-item"><IconCal />{datos.horario}</div>
      </div>

      <div className="pccard-progreso">
        <div className="pccard-prog-label">
          <span>Progreso</span>
          <span className="pccard-prog-pct">{datos.progreso}%</span>
        </div>
        <div className="pccard-prog-track">
          <div className="pccard-prog-fill" style={{ width: `${datos.progreso}%` }} />
        </div>
      </div>
    </div>

    <div className="pccard-footer">
      <button className="btn-pcdetalle" onClick={() => onVerDetalle(cursoId)}>
        <IconEye /><span>Ver detalle</span>
      </button>
      <button className="btn-pcbaja" onClick={() => onBaja(cursoId)}>
        <IconTrash /><span>Dar de baja</span>
      </button>
    </div>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────
const PerfilEstudiante = () => {
  const navigate = useNavigate();
  const { usuario, cursosInscritos, desinscribirCurso, logout } = useAuth();
  const [toast, setToast]               = useState(null);
  const [cursoDetalle, setCursoDetalle] = useState(null);
  const [cursosCatalogo, setCursosCatalogo] = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch(`${API_BASE}/api/cursos`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!mounted) return;
        setCursosCatalogo(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setCursosCatalogo([]);
      })
      .finally(() => {
        if (mounted) setCargandoCursos(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cursosConDatos = useMemo(() => {
    return cursosInscritos
      .map((id, index) => {
        const idNumero = Number(id);
        const curso = cursosCatalogo.find((c) => Number(c.id) === idNumero);
        if (!curso) return null;

        const visual = CURSO_VISUAL[index % CURSO_VISUAL.length];
        return {
          id: idNumero,
          datos: {
            ...curso,
            codigo: curso.codigo || `CUR-${String(curso.id).padStart(3, '0')}`,
            icono: visual.icono,
            color: visual.color,
            docente: curso.docente || 'Docente por asignar',
            horario: curso.horario || 'Horario por definir',
            progreso: Number(curso.progreso ?? 0),
          },
        };
      })
      .filter(Boolean);
  }, [cursosCatalogo, cursosInscritos]);

  const handleBaja = async (id) => {
    const curso = cursosConDatos.find((c) => c.id === id);
    const nombre = curso?.datos?.nombre || `Curso ${id}`;

    try {
      await desinscribirCurso(id);
      setToast(`Baja registrada: "${nombre}"`);
    } catch {
      setToast(`No se pudo dar de baja: "${nombre}"`);
    }

    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Iniciales para el avatar
  const iniciales = usuario
    ? usuario.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="perfil-page">
      {/* Hero */}
      <div className="perfil-hero">
        <div className="perfil-hero-bg"><span /><span /></div>
        <div className="perfil-hero-inner">
          <div className="perfil-breadcrumb">
            <a href="/">Inicio</a>
            <span className="sep">›</span>
            <span>Mi Perfil</span>
          </div>

          <div className="perfil-usuario-card">
            <div className="perfil-avatar">{iniciales}</div>

            <div className="perfil-usuario-info">
              <h1>{usuario?.nombre ?? 'Estudiante'}</h1>
              <p>{usuario?.email ?? ''}</p>
              <div className="perfil-badges">
                <span className="pbadge">🎓 Estudiante</span>
                <span className="pbadge green">✓ Cuenta verificada</span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fca5a5', padding: '0.3rem 0.8rem', borderRadius: '50px',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  <IconLogout /><span>Cerrar sesión</span>
                </button>
              </div>
            </div>

            <div className="perfil-stats">
              <div className="pstat">
                <span className="pstat-number">{cursosConDatos.length}</span>
                <span className="pstat-label">Inscritos</span>
              </div>
              <div className="pstat">
                <span className="pstat-number">
                  {cursosConDatos.filter(c => c.datos.progreso === 100).length}
                </span>
                <span className="pstat-label">Completados</span>
              </div>
              <div className="pstat">
                <span className="pstat-number">
                  {cursosConDatos.length > 0
                    ? Math.round(cursosConDatos.reduce((a, c) => a + c.datos.progreso, 0) / cursosConDatos.length)
                    : 0}%
                </span>
                <span className="pstat-label">Promedio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="perfil-body">
        <div className="perfil-controles">
          <h2>Mis Cursos Inscritos</h2>
          <button className="btn-catalogo" onClick={() => navigate('/cursos')}>
            <IconPlus />
            Agregar más cursos
          </button>
        </div>

        {cargandoCursos ? (
          <div className="perfil-empty">
            <h3>Cargando tus cursos...</h3>
          </div>
        ) : cursosConDatos.length === 0 ? (
          <div className="perfil-empty">
            <div className="perfil-empty-icon">📚</div>
            <h3>No tienes cursos inscritos</h3>
            <p>Explora el catálogo y selecciona los cursos que quieres tomar este semestre.</p>
            <button className="btn-ir-catalogo" onClick={() => navigate('/cursos')}>
              <IconPlus />
              Explorar catálogo de cursos
            </button>
          </div>
        ) : (
          <div className="perfil-cursos-grid">
            {cursosConDatos.map(({ id, datos }) => (
              <PerfilCursoCard key={id} cursoId={id} datos={datos} onBaja={handleBaja}
                onVerDetalle={(cid) => {
                  const curso = cursosConDatos.find((c) => c.id === cid);
                  const d = curso?.datos;
                  if (d) setCursoDetalle({ id: cid, nombre: d.nombre, descripcion: d.descripcion || '', costo: d.costo || 0, cupo_maximo: d.cupo_maximo || 30, ...d });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast msg={toast} />}

      {cursoDetalle && (
        <CursoDetalle
          curso={cursoDetalle}
          inscrito={true}
          onClose={() => setCursoDetalle(null)}
          onInscribirse={() => {}}
        />
      )}
    </div>
  );
};

export default PerfilEstudiante;