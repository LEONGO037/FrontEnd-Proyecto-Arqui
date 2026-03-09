// gestionInscripciones.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './gestionInscripciones.css';

const API_BASE = 'http://localhost:3000';

// --- Iconos ---
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconFilter = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconChevronDown = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IconChevronUp = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;
const IconAlertCircle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconCheckCircle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconDownload = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

const GestionInscripciones = () => {
  const { usuario } = useAuth();
  
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorFetch, setErrorFetch] = useState(null);
  
  // Estados para UI
  const [busqueda, setBusqueda] = useState('');
  const [filtroOcupacion, setFiltroOcupacion] = useState('TODOS');
  const [cursoExpandido, setCursoExpandido] = useState(null);

  // Estado para Toasts
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const obtenerResumenInscripciones = async () => {
      setCargando(true);
      setErrorFetch(null); 
      
      try {
        const token = localStorage.getItem('token'); 
        
        const response = await fetch(`${API_BASE}/api/inscripciones/resumen`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!response.ok) {
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (e) {
            throw new Error(`Error de servidor: ${response.status}`);
          }
          throw new Error(errorData.error || 'Error al obtener el resumen de cursos.');
        }

        const data = await response.json();
        setCursos(data);
      } catch (error) {
        console.error("Error al cargar inscripciones:", error);
        setErrorFetch(error.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerResumenInscripciones();
  }, []);

  const mostrarToast = (mensaje, tipo = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ mensaje, tipo });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  const toggleExpandir = (id) => {
    setCursoExpandido(cursoExpandido === id ? null : id);
  };

  // Función Nativa para Exportar a CSV
  const exportarCSV = (curso) => {
    const inscritos = curso.inscritos || [];
    if (inscritos.length === 0) {
      mostrarToast("No hay alumnos inscritos para exportar.", "info");
      return;
    }

    const encabezados = "ID,Nombre,CI/NIT,Estado Académico,Fecha Inscripción\n";
    const filas = inscritos.map(al => {
      const fecha = new Date(al.fecha_registro).toLocaleDateString('es-BO');
      return `${al.id_relacion},"${al.nombre} ${al.apellido}",${al.ci_nit},${al.estado_academico},${fecha}`;
    }).join("\n");

    const blob = new Blob(["\uFEFF" + encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Alumnos_${curso.nombre.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToast("Archivo CSV exportado exitosamente", "exito");
  };

  // Lógica de Filtrado
  const cursosFiltrados = cursos.filter(curso => {
    const coincideTexto = curso.nombre.toLowerCase().includes(busqueda.toLowerCase());
    
    let coincideFiltro = true;
    const ocupados = curso.inscritos ? curso.inscritos.length : 0;
    
    if (filtroOcupacion === 'LLENOS') coincideFiltro = ocupados >= curso.cupo_maximo;
    if (filtroOcupacion === 'RIESGO') coincideFiltro = ocupados < curso.minimo_estudiantes;
    if (filtroOcupacion === 'DISPONIBLES') coincideFiltro = ocupados < curso.cupo_maximo;

    return coincideTexto && coincideFiltro;
  });

  // Cálculos para el Dashboard Superior
  const totalInscripciones = cursos.reduce((acc, curr) => acc + (curr.inscritos ? curr.inscritos.length : 0), 0);
  const cursosEnRiesgo = cursos.filter(c => (c.inscritos ? c.inscritos.length : 0) < c.minimo_estudiantes).length;
  const ingresosEstimados = cursos.reduce((acc, curr) => acc + ((curr.inscritos ? curr.inscritos.length : 0) * Number(curr.costo)), 0);

  return (
    <div className="gestion-inscripciones-page">
      
      {/* ── Banner Superior (Hero) ── */}
      <div className="admin-header-banner">
        <div className="admin-header-bg"><span /><span /></div>
        <div className="admin-header-inner">
          <div className="admin-breadcrumb">
            <a href="/admin">Panel Admin</a><span className="sep">›</span><span>Inscripciones</span>
          </div>
          <h1>Gestión de <span>Inscripciones</span></h1>
          <p>Monitorea la ocupación en tiempo real y el estado académico de los estudiantes.</p>
        </div>
      </div>

      <div className="admin-page-body">
        {/* ── Dashboard Resumen (Flotante) ── */}
        <div className="admin-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon blue"><IconUsers /></div>
            <div className="kpi-info">
              <h3>{totalInscripciones}</h3>
              <p>Total Alumnos Inscritos</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon red"><IconAlertCircle /></div>
            <div className="kpi-info">
              <h3>{cursosEnRiesgo}</h3>
              <p>Cursos bajo mínimo requerido</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green"><IconCheckCircle /></div>
            <div className="kpi-info">
              <h3>Bs. {ingresosEstimados.toLocaleString('es-BO')}</h3>
              <p>Recaudación Bruta Estimada</p>
            </div>
          </div>
        </div>

        {/* ── Barra de Herramientas ── */}
        <div className="admin-toolbar">
          <div className="toolbar-search">
            <IconSearch />
            <input 
              type="text" 
              placeholder="Buscar curso por nombre..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          
          <div className="toolbar-filter">
            <IconFilter />
            <select value={filtroOcupacion} onChange={(e) => setFiltroOcupacion(e.target.value)}>
              <option value="TODOS">Todos los cursos</option>
              <option value="DISPONIBLES">Con cupos disponibles</option>
              <option value="LLENOS">Cupos llenos (100%)</option>
              <option value="RIESGO">En riesgo (Bajo mínimo)</option>
            </select>
          </div>
        </div>

        {/* ── Lista de Cursos (Acordeón) ── */}
        <div className="lista-inscripciones-container">
          {cargando ? (
            <div className="state-box loading">
              <div className="spinner"></div>
              <p>Cargando datos de inscripciones...</p>
            </div>
          ) : errorFetch ? (
            <div className="state-box error">
              <IconAlertCircle />
              <p>{errorFetch}</p>
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="state-box empty">
              <IconSearch />
              <p>No se encontraron cursos con estos filtros.</p>
            </div>
          ) : (
            cursosFiltrados.map((curso, index) => {
              const ocupados = curso.inscritos ? curso.inscritos.length : 0;
              const porcentaje = (ocupados / curso.cupo_maximo) * 100;
              const estaLleno = ocupados >= curso.cupo_maximo;
              const enRiesgo = ocupados < curso.minimo_estudiantes;

              return (
                <div 
                  key={curso.id} 
                  className={`curso-accordion-item ${cursoExpandido === curso.id ? 'expanded' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Cabecera del Acordeón */}
                  <div className="accordion-header" onClick={() => toggleExpandir(curso.id)}>
                    <div className="curso-info-principal">
                      <h4>{curso.nombre}</h4>
                      <div className="curso-badges">
                        <span className="badge-precio">Bs. {Number(curso.costo)}</span>
                        {estaLleno && <span className="badge-status full">Cupos Llenos</span>}
                        {enRiesgo && !estaLleno && <span className="badge-status risk">Bajo Mínimo</span>}
                      </div>
                    </div>

                    <div className="curso-ocupacion-visual">
                      <div className="ocupacion-text">
                        <strong>{ocupados}</strong> / {curso.cupo_maximo} cupos
                      </div>
                      <div className="progress-track">
                        <div 
                          className={`progress-fill ${estaLleno ? 'bg-red' : enRiesgo ? 'bg-orange' : 'bg-green'}`}
                          style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        />
                      </div>
                      <div className="ocupacion-footer">
                        <small className="minimo-req">Mínimo requerido: {curso.minimo_estudiantes}</small>
                        <small className="porcentaje-text">{Math.round(porcentaje)}%</small>
                      </div>
                    </div>

                    <div className="accordion-toggle-icon">
                      {cursoExpandido === curso.id ? <IconChevronUp /> : <IconChevronDown />}
                    </div>
                  </div>

                  {/* Contenido Expandible (Tabla de Alumnos) */}
                  {cursoExpandido === curso.id && (
                    <div className="accordion-body">
                      {ocupados === 0 ? (
                        <div className="no-students">
                          <IconUsers />
                          <p>Aún no hay estudiantes inscritos en este curso.</p>
                        </div>
                      ) : (
                        <>
                          <div className="accordion-actions">
                            <button className="btn-export-csv" onClick={() => exportarCSV(curso)}>
                              <IconDownload /> Exportar Lista CSV
                            </button>
                          </div>
                          <div className="table-wrapper">
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>Nº</th>
                                  <th>Estudiante</th>
                                  <th>CI / NIT</th>
                                  <th>Fecha Inscripción</th>
                                  <th>Estado Académico</th>
                                </tr>
                              </thead>
                              <tbody>
                                {curso.inscritos.map((alumno, idx) => (
                                  <tr key={alumno.id_relacion}>
                                    <td className="text-muted">{idx + 1}</td>
                                    <td className="fw-bold">{alumno.nombre} {alumno.apellido}</td>
                                    <td>{alumno.ci_nit}</td>
                                    <td>{new Date(alumno.fecha_registro).toLocaleDateString('es-BO')}</td>
                                    <td>
                                      <span className={`estado-academico-badge ${alumno.estado_academico.toLowerCase()}`}>
                                        {alumno.estado_academico}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Notificaciones Flotantes (Toasts) ── */}
      {toast && (
        <div className={`toast-flotante ${toast.tipo}`}>
          <div className="toast-icon">
            {toast.tipo === 'exito' ? <IconCheckCircle /> : <IconAlertCircle />}
          </div>
          <div className="toast-content">
            <span className="toast-title">{toast.tipo === 'exito' ? '¡Éxito!' : 'Aviso'}</span>
            <span className="toast-message">{toast.mensaje}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionInscripciones;