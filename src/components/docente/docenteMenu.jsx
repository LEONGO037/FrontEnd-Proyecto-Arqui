// docenteMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerMisCursos, obtenerEstudiantesCurso, guardarNotasEstudiantes, obtenerMetricasCurso, cambiarEstadoCurso } from '../../services/docenteApi';
import './docenteMenu.css';

// --- Iconos en línea ---
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconChart = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconStar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconInfo = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconBook = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconClose = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconClipboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPlay = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconFileText = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconFilter = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconDownload = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconWarning = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const VISUAL = [
  { icono: '👨‍💻', color: 'linear-gradient(135deg,#003366,#0055aa)', categoria: 'Desarrollo' },
  { icono: '🗄️', color: 'linear-gradient(135deg,#5a8a1a,#8cc63f)', categoria: 'Base de Datos' },
  { icono: '📡', color: 'linear-gradient(135deg,#1e3a5f,#2e6da4)', categoria: 'Redes' },
];

// Configuración Base URL para el Backend
const API_BASE_URL = 'http://localhost:3000/api';

const HomeDocente = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [misCursos, setMisCursos] = useState([]);
  const [metricas, setMetricas] = useState({ totalAlumnos: 0, cursosActivos: 0, calificacionPromedio: 4.85 }); // calificacion hardcoded visual
  const [cargando, setCargando] = useState(true);

  // Estados de Búsqueda y Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // Estados del modal y edición de notas
  const [modalActivo, setModalActivo] = useState(null); 
  const [cursoActual, setCursoActual] = useState(null);
  const [alumnosCurso, setAlumnosCurso] = useState([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Estado para Toasts
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const cursos = await obtenerMisCursos();
        setMisCursos(cursos);
        
        // Calcular métricas globales
        const totalAlumnos = cursos.reduce((sum, curso) => sum + parseInt(curso.alumnos || 0), 0);
        const cursosActivos = cursos.filter(c => c.estado_curso === 'ACTIVO').length;
        const calificacionPromedio = cursos.length > 0 
          ? (cursos.reduce((sum, curso) => sum + parseFloat(curso.calificacion || 0), 0) / cursos.length).toFixed(2)
          : 0;
        
        setMetricas({ 
          totalAlumnos, 
          cursosActivos, 
          calificacionPromedio: parseFloat(calificacionPromedio) 
        });
      } catch (error) {
        mostrarToast('Error al cargar los cursos: ' + error.message, 'error');
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, []);

  const mostrarToast = (mensaje, tipo = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ mensaje, tipo });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  const abrirModal = async (tipo, curso) => {
    setCursoActual(curso);
    setModalActivo(tipo);
    setMostrarConfirmacion(false);
    
    try {
      if (tipo === 'alumnos' || tipo === 'notas') {
        const estudiantes = await obtenerEstudiantesCurso(curso.id);
        setAlumnosCurso(
          estudiantes.map(al => ({
            ...al,
            notaFinal: al.nota_final ?? null,
            error: false
          }))
        );
      } else if (tipo === 'metricas') {
        const metricas = await obtenerMetricasCurso(curso.id);
        // Las métricas se usarán en el renderModalContent
      }
    } catch (error) {
      mostrarToast('Error al cargar datos: ' + error.message, 'error');
      setModalActivo(null);
    }
  };

  const cerrarModal = () => {
    setModalActivo(null);
    setCursoActual(null);
    setMostrarConfirmacion(false);
  };

  const cambiarEstadoCursoHandler = async (nuevoEstado) => {
    try {
      await cambiarEstadoCurso(cursoActual.id, nuevoEstado);
      setMisCursos(misCursos.map(c => c.id === cursoActual.id ? { ...c, estado_curso: nuevoEstado } : c));
      mostrarToast(`El curso ha cambiado a: ${nuevoEstado}`, 'exito');
      cerrarModal();
    } catch (error) {
      mostrarToast('Error: ' + error.message, 'error');
    }
  };

  const handleNotaChange = (id, valor) => {
    const numValor = valor === '' ? null : Number(valor);
    const tieneError = numValor !== null && (numValor < 0 || numValor > 100);
    
    setAlumnosCurso(alumnosCurso.map(al => 
      al.id === id ? { ...al, notaFinal: numValor, error: tieneError } : al
    ));
  };

  const hayErroresEnNotas = alumnosCurso.some(al => al.error);

  const guardarNotas = async (e) => {
    e.preventDefault();
    if (hayErroresEnNotas) return;
    
    try {
      const notas = alumnosCurso.map(al => ({
        estudiante_curso_id: al.id,
        nota_final: al.notaFinal
      }));
      
      await guardarNotasEstudiantes(cursoActual.id, notas);
      mostrarToast("Calificaciones guardadas exitosamente en la base de datos.", 'exito');
      cerrarModal();
    } catch (error) {
      mostrarToast('Error: ' + error.message, 'error');
    }
  };

  const generarReporte = () => {
    mostrarToast("Generando reporte en PDF, la descarga comenzará en breve...", 'info');
  };

  const exportarCSV = () => {
    const encabezados = "ID,Nombre del Alumno,CI/NIT,Asistencia %,Nota Final,Estado Académico\n";
    const filas = alumnosCurso.map(al => {
      const estadoStr = al.notaFinal === null ? 'Pendiente' : (al.notaFinal >= 51 ? 'Aprobado' : 'Reprobado');
      const notaStr = al.notaFinal === null ? 'N/A' : al.notaFinal;
      return `${al.id},"${al.nombre}",${al.ci},${al.asistencia},${notaStr},${estadoStr}`;
    }).join("\n");

    const blob = new Blob(["\uFEFF" + encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Notas_${cursoActual.nombre.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToast("Archivo CSV exportado exitosamente", "exito");
  };

  const getBadgeClass = (estado) => {
    if(!estado) return 'badge-neutro';
    const estadoLimpio = estado.toLowerCase().replace(/ó/g, 'o').replace(/ /g, '-');
    return `badge-${estadoLimpio}`;
  };

  const cursosFiltrados = misCursos.filter(curso => {
    const coincideTexto = curso.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'TODOS' || curso.estado_curso === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const renderModalContent = () => {
    if (!cursoActual) return null;

    switch (modalActivo) {
      case 'administrar':
        return (
          <div className="modal-content-admin">
            <h3>Administrar: {cursoActual.nombre}</h3>
            <div className="status-indicator">
              Estado actual: <span className={`card-chip-estado en-texto ${getBadgeClass(cursoActual.estado_curso)}`}>{cursoActual.estado_curso}</span>
            </div>
            
            {mostrarConfirmacion ? (
              <div className="confirmacion-box">
                <div className="conf-icono"><IconWarning /></div>
                <h4>¿Estás seguro de finalizar este curso?</h4>
                <p>Esta acción es irreversible. Ya no podrás modificar notas ni interactuar con el curso.</p>
                <div className="confirmacion-acciones">
                  <button onClick={() => setMostrarConfirmacion(false)} className="btn-outline">Cancelar</button>
                  <button onClick={() => cambiarEstadoCursoHandler('FINALIZADO')} className="btn-modal-action danger">
                    Sí, Finalizar Curso
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-actions-box">
                {cursoActual.estado_curso === 'NO ACTIVO' && (
                  <>
                    <p>Este curso aún no ha comenzado. ¿Deseas dar inicio a las clases?</p>
                    <button className="btn-modal-action success" onClick={() => cambiarEstadoCursoHandler('ACTIVO')}>
                      <IconPlay /> Iniciar Curso Ahora
                    </button>
                  </>
                )}
                {cursoActual.estado_curso === 'ACTIVO' && (
                  <>
                    <p>El curso está en proceso. Una vez concluido el temario y subidas las notas, puedes finalizarlo.</p>
                    <button className="btn-modal-action warning" onClick={() => setMostrarConfirmacion(true)}>
                      <IconCheck /> Finalizar Curso
                    </button>
                  </>
                )}
                {cursoActual.estado_curso === 'FINALIZADO' && (
                  <>
                    <p>Este curso ya ha concluido. Descarga el reporte o exporta las notas a Excel.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button className="btn-modal-action primary" onClick={generarReporte}>
                        <IconFileText /> Generar PDF
                      </button>
                      <button className="btn-modal-action verde-excel" onClick={exportarCSV}>
                        <IconDownload /> Exportar a CSV
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'alumnos':
        return (
          <div className="modal-content-table">
            <div className="modal-header-flexible">
              <h3>Listado de Alumnos - {cursoActual.nombre}</h3>
              <button className="btn-export-small" onClick={exportarCSV} title="Descargar CSV">
                <IconDownload /> CSV
              </button>
            </div>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Nombre Completo</th>
                    <th>CI / NIT</th>
                    <th>Asistencia</th>
                    <th>Nota Final</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosCurso.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No hay estudiantes inscritos</td></tr>
                  ) : (
                    alumnosCurso.map(al => (
                      <tr key={al.id}>
                        <td><div className="alumno-nombre-td">{al.nombre}</div></td>
                        <td>{al.ci}</td>
                        <td>{al.asistencia}%</td>
                        <td><strong>{al.notaFinal !== null ? al.notaFinal : '-'}</strong></td>
                        <td>
                          {al.notaFinal === null ? <span className="estado-badge neutro">Pendiente</span> :
                           al.notaFinal >= 51 ? <span className="estado-badge exito">Aprobado</span> : 
                           <span className="estado-badge error">Reprobado</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'notas':
        return (
          <div className="modal-content-table modal-notas">
            <h3>Registro Académico</h3>
            <p className="modal-subtitle">Asignar Calificaciones – {cursoActual.nombre}</p>
            <form onSubmit={guardarNotas}>
              <div className="table-responsive">
                <table className="modern-table align-middle">
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>CI / NIT</th>
                      <th>Estado Actual</th>
                      <th style={{ textAlign: 'center' }}>Calificación (0-100)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosCurso.map(al => (
                      <tr key={al.id}>
                        <td><div className="alumno-nombre-td">{al.nombre}</div></td>
                        <td className="text-gray">{al.ci}</td>
                        <td>
                          {al.notaFinal === null ? <span className="text-gray">Sin nota</span> :
                           al.notaFinal >= 51 ? <span className="text-green">Aprobando</span> : 
                           <span className="text-red">Reprobando</span>}
                        </td>
                        <td style={{ textAlign: 'center', position: 'relative' }}>
                          <input 
                            type="number" 
                            className={`input-nota ${al.error ? 'error' : ''}`} 
                            value={al.notaFinal !== null ? al.notaFinal : ''} 
                            onChange={(e) => handleNotaChange(al.id, e.target.value)}
                            placeholder="-"
                          />
                          {al.error && <div className="error-tooltip">Nota inválida (0-100)</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-guardar" disabled={hayErroresEnNotas || alumnosCurso.length === 0}>
                  <IconClipboard /> Guardar Calificaciones
                </button>
              </div>
            </form>
          </div>
        );

      case 'metricas':
        return (
          <div className="modal-content-metrics">
            <h3>Métricas del Curso - {cursoActual.nombre}</h3>
            <div className="metrics-grid">
              <div className="metric-box">
                <h4>Promedio del Curso</h4>
                <div className="metric-value text-blue">78.5 <small>/100</small></div>
              </div>
              <div className="metric-box">
                <h4>Tasa de Aprobación</h4>
                <div className="metric-value text-green">85%</div>
                <div className="progress-bar"><div className="progress-fill" style={{width: '85%', background: 'var(--verde)'}}></div></div>
              </div>
              <div className="metric-box">
                <h4>Asistencia Promedio</h4>
                <div className="metric-value text-orange">92%</div>
                <div className="progress-bar"><div className="progress-fill" style={{width: '92%', background: 'var(--naranja)'}}></div></div>
              </div>
            </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="docente-page">
      {/* ── Header ── */}
      <div className="docente-header">
        <div className="docente-header-bg"><span /><span /></div>
        <div className="docente-header-inner">
          <div className="doc-breadcrumb">
            <a href="/">Inicio</a><span className="sep">›</span><span>Panel Docente</span>
          </div>
          <h1>Mi Espacio <span>Docente</span></h1>
          <p>Gestiona tus cursos, monitorea a tus estudiantes y analiza tu rendimiento.</p>
        </div>
      </div>

      <div className="docente-body">
        {usuario && (
          <div className="info-sesion-docente">
            <IconInfo />
            <p>Hola, <strong>Profesor {usuario.nombre || 'Docente'}</strong>. Aquí tienes el resumen de tu actividad reciente.</p>
          </div>
        )}

        {/* ── Dashboard de Métricas Globales ── */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon azul"><IconBook /></div>
            <div className="stat-info">
              <h3>{metricas.cursosActivos}</h3>
              <p>Cursos Activos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon verde"><IconUsers /></div>
            <div className="stat-info">
              <h3>{metricas.totalAlumnos}</h3>
              <p>Total Estudiantes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon naranja"><IconStar /></div>
            <div className="stat-info">
              <h3>{metricas.calificacionPromedio} <span className="stat-max">/ 5.0</span></h3>
              <p>Calificación Promedio</p>
            </div>
          </div>
        </div>

        {/* ── Acciones y Filtros ── */}
        <div className="docente-acciones-bar">
          <h2>Mis Cursos Asignados ({cursosFiltrados.length})</h2>
          
          <div className="filtros-container">
            <div className="input-with-icon">
              <IconSearch />
              <input 
                type="text" 
                placeholder="Buscar curso por nombre..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
              />
            </div>
            <div className="input-with-icon select-wrapper">
              <IconFilter />
              <select 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="select-filtro"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="NO ACTIVO">No Activos</option>
                <option value="ACTIVO">Activos</option>
                <option value="FINALIZADO">Finalizados</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Grid de Cursos del Docente ── */}
        {cargando ? (
          <div className="cargando-estado">Cargando tu panel de gestión desde la Base de Datos...</div>
        ) : cursosFiltrados.length === 0 ? (
          <div className="vacio-estado">No se encontraron cursos registrados con los filtros actuales.</div>
        ) : (
          <div className="cursos-docente-grid">
            {cursosFiltrados.map((curso, i) => {
              const visual = VISUAL[i % VISUAL.length];
              return (
                <div key={curso.id} className="curso-docente-card">
                  <div className="card-banner" style={{ background: visual.color }}>
                    <span style={{ position: 'relative', zIndex: 2 }}>{visual.icono}</span>
                    <span className="card-chip">{visual.categoria}</span>
                    <span className={`card-chip-estado ${getBadgeClass(curso.estado_curso)}`}>
                      {curso.estado_curso}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-titulo">{curso.nombre}</div>
                    <div className="card-codigo">ID-{String(curso.id).padStart(3, '0')}</div>
                    <p className="card-desc">{curso.descripcion}</p>
                    
                    <div className="docente-stats-curso">
                      <div className="d-stat">
                        <IconUsers /> <span><strong>{curso.alumnos}</strong> Alumnos</span>
                      </div>
                      <div className="d-stat">
                        <IconStar /> <span><strong>{curso.calificacion > 0 ? curso.calificacion : 'N/A'}</strong> Rating</span>
                      </div>
                    </div>

                    <div className="card-acciones-docente">
                      <button className="btn-accion secundario" onClick={() => abrirModal('alumnos', curso)}>
                        <IconUsers /> Alumnos
                      </button>
                      <button className="btn-accion secundario" onClick={() => abrirModal('metricas', curso)}>
                        <IconChart /> Métricas
                      </button>
                      <button 
                        className="btn-accion terciario" 
                        onClick={() => abrirModal('notas', curso)}
                        disabled={curso.estado_curso === 'FINALIZADO'}
                        title={curso.estado_curso === 'FINALIZADO' ? 'El curso finalizó, no puedes modificar notas' : 'Asignar Notas'}
                        style={curso.estado_curso === 'FINALIZADO' ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                      >
                        <IconClipboard /> Asignar Notas
                      </button>
                      <button className="btn-accion primario" onClick={() => abrirModal('administrar', curso)}>
                        <IconSettings /> Administrar Curso
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Overlay Modal ── */}
      {modalActivo && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalActivo === 'administrar' ? 'Gestión de Curso' : 
                   modalActivo === 'alumnos' ? 'Control de Estudiantes' : 
                   modalActivo === 'notas' ? 'Registro Académico' : 'Análisis de Datos'}</h2>
              <button className="btn-cerrar-modal" onClick={cerrarModal}><IconClose /></button>
            </div>
            <div className="modal-body">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}

      {/* ── Notificaciones Flotantes (Toasts) ── */}
      {toast && (
        <div className={`toast-flotante ${toast.tipo}`}>
          <div className="toast-icon">
            {toast.tipo === 'exito' ? <IconCheck /> : toast.tipo === 'error' ? <IconWarning /> : <IconInfo />}
          </div>
          <div className="toast-content">
            <span className="toast-title">{toast.tipo === 'exito' ? '¡Éxito!' : toast.tipo === 'error' ? 'Error' : 'Información'}</span>
            <span className="toast-message">{toast.mensaje}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToast(null)}>
            <IconClose />
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeDocente;