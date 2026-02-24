// cursosInscritos.jsx
import React, { useState, useEffect } from 'react';
import './cursosInscritos.css';

// ── Mock data (reemplazar con llamada real al backend) ──────────────────────
// TODO: Conectar a GET /api/estudiante/cursos-inscritos
const MOCK_CURSOS = [
  {
    id: 1,
    codigo: 'INF-301',
    nombre: 'Programación Orientada a Objetos',
    docente: 'Lic. María Fernández',
    horario: 'Lun-Mié 18:00 - 20:00',
    salon: 'Aula 204 - Ed. A',
    icono: '💻',
    iconoBg: 'icon-bg-green',
    estado: 'activo',
    progreso: 72,
    creditosHora: 4,
    inscritoEn: '2025-08-12',
  },
  {
    id: 2,
    codigo: 'MAT-210',
    nombre: 'Cálculo Diferencial e Integral',
    docente: 'Dr. Carlos Mendoza',
    horario: 'Mar-Jue 16:00 - 18:00',
    salon: 'Aula 108 - Ed. B',
    icono: '📐',
    iconoBg: 'icon-bg-blue',
    estado: 'activo',
    progreso: 45,
    creditosHora: 5,
    inscritoEn: '2025-08-12',
  },
  {
    id: 3,
    codigo: 'ADM-115',
    nombre: 'Fundamentos de Administración',
    docente: 'Mg. Ana Quiroga',
    horario: 'Vie 14:00 - 18:00',
    salon: 'Aula 310 - Ed. C',
    icono: '📊',
    iconoBg: 'icon-bg-orange',
    estado: 'pendiente',
    progreso: 0,
    creditosHora: 3,
    inscritoEn: '2025-09-01',
  },
  {
    id: 4,
    codigo: 'ING-402',
    nombre: 'Inglés Avanzado Empresarial',
    docente: 'Prof. David Smith',
    horario: 'Lun-Mié-Vie 07:00 - 08:00',
    salon: 'Lab Idiomas 02',
    icono: '🌎',
    iconoBg: 'icon-bg-purple',
    estado: 'completado',
    progreso: 100,
    creditosHora: 3,
    inscritoEn: '2025-02-01',
  },
];
// ───────────────────────────────────────────────────────────────────────────

const FILTROS = [
  { key: 'todos',     label: 'Todos' },
  { key: 'activo',    label: 'Activos' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'completado',label: 'Completados' },
];

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton sk-strip" />
    <div className="skeleton sk-icon" />
    <div className="skeleton sk-title" />
    <div className="skeleton sk-sub" />
    <div className="skeleton sk-line" />
    <div className="skeleton sk-line2" />
    <div className="skeleton sk-bar" />
  </div>
);

// Icono SVG reutilizables
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLocation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/>
    <circle cx="3" cy="18" r="1" fill="currentColor"/>
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

// ── Tarjeta en modo Grid ──────────────────────────────────────────────────
const CursoCardGrid = ({ curso, onDetalle }) => (
  <div className="curso-card">
    <div className={`card-top-strip strip-${curso.estado}`} />
    <div className="card-content">
      <div className="card-header-row">
        <div className={`curso-icon-wrapper ${curso.iconoBg}`}>{curso.icono}</div>
        <span className={`status-badge badge-${curso.estado}`}>
          {curso.estado.charAt(0).toUpperCase() + curso.estado.slice(1)}
        </span>
      </div>

      <div className="curso-nombre">{curso.nombre}</div>
      <div className="curso-codigo">{curso.codigo} • {curso.creditosHora} hrs/sem</div>

      <div className="curso-meta">
        <div className="meta-item"><IconUser />{curso.docente}</div>
        <div className="meta-item"><IconCalendar />{curso.horario}</div>
        <div className="meta-item"><IconLocation />{curso.salon}</div>
      </div>

      <div className="progress-block">
        <div className="progress-label-row">
          <span>Progreso del curso</span>
          <span className="progress-pct">{curso.progreso}%</span>
        </div>
        <div className="progress-bar-track">
          <div
            className={`progress-bar-fill fill-${curso.estado}`}
            style={{ width: `${curso.progreso}%` }}
          />
        </div>
      </div>
    </div>

    <div className="card-footer">
      <button className="btn-detail" onClick={() => onDetalle(curso)}>
        <IconEye /><span>Ver Detalle</span>
      </button>
      <button
        className={`btn-cert ${curso.estado !== 'completado' ? 'disabled' : ''}`}
        disabled={curso.estado !== 'completado'}
        title={curso.estado !== 'completado' ? 'Disponible al completar' : 'Descargar certificado'}
      >
        <IconDownload /><span>Certificado</span>
      </button>
    </div>
  </div>
);

// ── Tarjeta en modo Lista ─────────────────────────────────────────────────
const CursoCardList = ({ curso, onDetalle }) => (
  <div className={`curso-card-list list-strip-${curso.estado}`}>
    <div className={`list-icon ${curso.iconoBg}`}>{curso.icono}</div>

    <div className="list-info">
      <div className="list-info-top">
        <span className="list-nombre">{curso.nombre}</span>
        <span className={`status-badge badge-${curso.estado}`}>
          {curso.estado.charAt(0).toUpperCase() + curso.estado.slice(1)}
        </span>
      </div>
      <div className="list-meta">
        <div className="list-meta-item"><IconUser />{curso.docente}</div>
        <div className="list-meta-item"><IconCalendar />{curso.horario}</div>
        <div className="list-meta-item"><IconLocation />{curso.salon}</div>
      </div>
    </div>

    <div className="list-progress-block">
      <div className="list-pct">{curso.progreso}%</div>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill fill-${curso.estado}`}
          style={{ width: `${curso.progreso}%` }}
        />
      </div>
    </div>

    <div className="list-actions">
      <button className="btn-detail" onClick={() => onDetalle(curso)}>
        <IconEye />
      </button>
      <button
        className={`btn-cert ${curso.estado !== 'completado' ? 'disabled' : ''}`}
        disabled={curso.estado !== 'completado'}
        title={curso.estado !== 'completado' ? 'Disponible al completar' : 'Descargar certificado'}
      >
        <IconDownload />
      </button>
    </div>
  </div>
);

// ── Componente Principal ──────────────────────────────────────────────────
const MisCursos = () => {
  // TODO: reemplazar con llamada real → useEffect → fetch('/api/estudiante/cursos-inscritos', ...)
  const [cursos, setCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [vistaGrid, setVistaGrid] = useState(true);

  useEffect(() => {
    // Simula fetch al backend
    const timer = setTimeout(() => {
      setCursos(MOCK_CURSOS);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleDetalle = (curso) => {
    // TODO: navegar a /cursos/:id o abrir modal de detalle
    console.log('Ver detalle del curso:', curso);
  };

  // Estadísticas derivadas
  const stats = {
    total:      cursos.length,
    activos:    cursos.filter(c => c.estado === 'activo').length,
    pendientes: cursos.filter(c => c.estado === 'pendiente').length,
    completados: cursos.filter(c => c.estado === 'completado').length,
  };

  // Filtrado + búsqueda
  const cursosFiltrados = cursos.filter(c => {
    const matchFiltro   = filtro === 'todos' || c.estado === filtro;
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.docente.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return matchFiltro && matchBusqueda;
  });

  return (
    <div className="mis-cursos-page">
      {/* ── Header ── */}
      <div className="mis-cursos-header">
        <div className="header-bg-circles">
          <span /><span /><span />
        </div>
        <div className="mis-cursos-header-inner">
          <div className="header-breadcrumb">
            <span>Inicio</span>
            <span className="sep">›</span>
            <span>Mi Perfil</span>
            <span className="sep">›</span>
            <span>Mis Cursos Inscritos</span>
          </div>

          <div className="mis-cursos-header-top">
            <div className="header-title-block">
              <h1>Mis Cursos <span>Inscritos</span></h1>
              <p>Gestiona tu historial académico y descarga tus certificados</p>
            </div>

            <div className="header-stats">
              <div className="hstat">
                <span className="hstat-number">{isLoading ? '—' : stats.total}</span>
                <span className="hstat-label">Total</span>
              </div>
              <div className="hstat">
                <span className="hstat-number">{isLoading ? '—' : stats.activos}</span>
                <span className="hstat-label">Activos</span>
              </div>
              <div className="hstat">
                <span className="hstat-number">{isLoading ? '—' : stats.completados}</span>
                <span className="hstat-label">Completados</span>
              </div>
              <div className="hstat">
                <span className="hstat-number">{isLoading ? '—' : stats.pendientes}</span>
                <span className="hstat-label">Pendientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mis-cursos-body">
        {/* Controles */}
        <div className="cursos-controls">
          <div className="search-bar">
            <IconSearch />
            <input
              type="text"
              placeholder="Buscar por nombre, código o docente…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            {FILTROS.map(f => (
              <button
                key={f.key}
                className={`filter-tab ${filtro === f.key ? 'active' : ''}`}
                onClick={() => setFiltro(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${vistaGrid ? 'active' : ''}`}
              onClick={() => setVistaGrid(true)}
              title="Vista cuadrícula"
            >
              <IconGrid />
            </button>
            <button
              className={`view-btn ${!vistaGrid ? 'active' : ''}`}
              onClick={() => setVistaGrid(false)}
              title="Vista lista"
            >
              <IconList />
            </button>
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="cursos-grid">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : cursosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>
              {busqueda
                ? 'No se encontraron resultados'
                : 'Sin cursos inscritos'}
            </h3>
            <p>
              {busqueda
                ? `No hay cursos que coincidan con "${busqueda}".`
                : 'Aún no tienes cursos inscritos. Explora el catálogo y empieza hoy.'}
            </p>
            <button className="btn-explore">
              <IconBook />
              Explorar Cursos
            </button>
          </div>
        ) : vistaGrid ? (
          <div className="cursos-grid">
            {cursosFiltrados.map(c => (
              <CursoCardGrid key={c.id} curso={c} onDetalle={handleDetalle} />
            ))}
          </div>
        ) : (
          <div className="cursos-list">
            {cursosFiltrados.map(c => (
              <CursoCardList key={c.id} curso={c} onDetalle={handleDetalle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCursos;
