// adminReportes.jsx — Generación de Reportes (Admin)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../layout/headerAdmin';
import Footer from '../layout/footerPrincipal';
import {
    getResumenReportes,
    descargarPDFInscripciones,
    descargarPDFPagos,
} from '../../services/reportesApi';
import './adminReportes.css';

// ─── Iconos ───────────────────────────────────────────────────────────────────
const IconBack      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>;
const IconUsers     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconMoney     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IconCourses   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconCheck2    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconDownload  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconList      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconAlert     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconFilter    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtBs = (n) => `Bs ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;

// ─── Componente Principal ─────────────────────────────────────────────────────
const AdminReportes = () => {
    const navigate = useNavigate();

    // Datos
    const [resumen, setResumen]   = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError]       = useState(null);

    // Filtros
    const [desde, setDesde]         = useState('');
    const [hasta, setHasta]         = useState('');
    const [filtrosActivos, setFiltrosActivos] = useState({});

    // Descarga
    const [descargando, setDescargando] = useState({ inscripciones: false, pagos: false });

    // Toast
    const [toast, setToast] = useState(null);
    const toastRef = useRef(null);

    // ─── Carga de datos ────────────────────────────────────────────────────────
    const cargarResumen = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await getResumenReportes();
            setResumen(data);
        } catch (err) {
            setError(err.message || 'Error al cargar los reportes');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargarResumen(); }, [cargarResumen]);

    // ─── Toast ────────────────────────────────────────────────────────────────
    const mostrarToast = (titulo, mensaje, tipo = 'exito') => {
        if (toastRef.current) clearTimeout(toastRef.current);
        setToast({ titulo, mensaje, tipo });
        toastRef.current = setTimeout(() => setToast(null), 5000);
    };

    // ─── Filtros ──────────────────────────────────────────────────────────────
    const aplicarFiltros = () => {
        setFiltrosActivos({ desde: desde || undefined, hasta: hasta || undefined });
        mostrarToast('Filtros aplicados', 'Los PDFs se generarán con el rango seleccionado.', 'exito');
    };

    const limpiarFiltros = () => {
        setDesde('');
        setHasta('');
        setFiltrosActivos({});
    };

    // ─── Descargas PDF ────────────────────────────────────────────────────────
    const handleDescargarInscripciones = async () => {
        setDescargando(prev => ({ ...prev, inscripciones: true }));
        try {
            await descargarPDFInscripciones(filtrosActivos);
            mostrarToast('¡PDF generado!', 'El reporte de inscripciones se ha descargado.', 'exito');
        } catch (err) {
            mostrarToast('Error', err.message || 'No se pudo generar el PDF.', 'error');
        } finally {
            setDescargando(prev => ({ ...prev, inscripciones: false }));
        }
    };

    const handleDescargarPagos = async () => {
        setDescargando(prev => ({ ...prev, pagos: true }));
        try {
            await descargarPDFPagos(filtrosActivos);
            mostrarToast('¡PDF generado!', 'El reporte de pagos se ha descargado.', 'exito');
        } catch (err) {
            mostrarToast('Error', err.message || 'No se pudo generar el PDF.', 'error');
        } finally {
            setDescargando(prev => ({ ...prev, pagos: false }));
        }
    };

    // ─── Stats computadas ────────────────────────────────────────────────────
    const stats = resumen?.estadisticas || {};
    const porCurso = resumen?.inscripciones_por_curso || [];

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="reportes-page">
            <AdminHeader />

            <main className="reportes-main">

                {/* Cabecera */}
                <div className="reportes-page-header">
                    <button className="rep-btn-back" onClick={() => navigate('/admin')} title="Volver">
                        <IconBack />
                    </button>
                    <div>
                        <h1 className="reportes-page-title">Reportes del Sistema</h1>
                        <p className="reportes-page-subtitle">
                            Resumen institucional de inscripciones y pagos · Descarga reportes en PDF
                        </p>
                    </div>
                </div>

                {/* ── Filtros de fecha ── */}
                <div className="reportes-filtros-card">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                        <IconFilter />
                        Filtrar por fechas
                    </span>
                    <div className="rep-filtro-group">
                        <label>Desde</label>
                        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} max={hasta || undefined} />
                    </div>
                    <div className="rep-filtro-group">
                        <label>Hasta</label>
                        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} min={desde || undefined} />
                    </div>
                    <button className="rep-btn-aplicar" onClick={aplicarFiltros}>
                        Aplicar filtros
                    </button>
                    {(desde || hasta) && (
                        <button className="rep-btn-limpiar" onClick={limpiarFiltros}>
                            Limpiar
                        </button>
                    )}
                    {Object.keys(filtrosActivos).length > 0 && (
                        <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600, background: '#e0f2fe', padding: '0.3rem 0.75rem', borderRadius: '50px' }}>
                            ✓ Filtro activo en PDFs
                        </span>
                    )}
                </div>

                {/* ── KPI Cards ── */}
                {cargando ? (
                    <div className="rep-state-box">
                        <div className="rep-spinner-grande" />
                        <p>Cargando estadísticas...</p>
                    </div>
                ) : error ? (
                    <div className="rep-state-box error">
                        <IconAlert />
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="reportes-kpi-grid">
                            <div className="rep-kpi-card">
                                <div className="rep-kpi-icon azul"><IconUsers /></div>
                                <div className="rep-kpi-info">
                                    <h3>{stats.total_inscripciones ?? '—'}</h3>
                                    <p>Total inscripciones</p>
                                </div>
                            </div>
                            <div className="rep-kpi-card">
                                <div className="rep-kpi-icon violeta"><IconUsers /></div>
                                <div className="rep-kpi-info">
                                    <h3>{stats.total_estudiantes ?? '—'}</h3>
                                    <p>Estudiantes únicos</p>
                                </div>
                            </div>
                            <div className="rep-kpi-card">
                                <div className="rep-kpi-icon naranja"><IconCheck2 /></div>
                                <div className="rep-kpi-info">
                                    <h3>{stats.pagos_completados ?? '—'}</h3>
                                    <p>Pagos confirmados</p>
                                </div>
                            </div>
                            <div className="rep-kpi-card">
                                <div className="rep-kpi-icon verde"><IconMoney /></div>
                                <div className="rep-kpi-info">
                                    <h3 style={{ fontSize: '1.3rem' }}>{fmtBs(stats.ingresos_totales_bs)}</h3>
                                    <p>Ingresos totales · ${Number(stats.ingresos_totales_usd || 0).toFixed(2)} USD</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Descarga de PDFs ── */}
                        <div className="reportes-descarga-section">
                            <p className="rep-section-label">Descargar reportes en PDF</p>
                            <div className="reportes-descarga-grid">

                                {/* PDF Inscripciones */}
                                <div className="rep-descarga-card" style={{ '--card-accent': '#003366', '--card-bg': 'rgba(0,51,102,0.08)' }}>
                                    <div className="rep-descarga-icono"><IconList /></div>
                                    <div className="rep-descarga-info">
                                        <h4>Reporte de Inscripciones</h4>
                                        <p>
                                            Lista completa de estudiantes inscritos con estado de pago
                                            {Object.keys(filtrosActivos).length > 0 ? ' (rango filtrado)' : ' (todos los registros)'}.
                                        </p>
                                    </div>
                                    <button
                                        className="rep-btn-descargar"
                                        onClick={handleDescargarInscripciones}
                                        disabled={descargando.inscripciones}
                                    >
                                        {descargando.inscripciones
                                            ? <><span className="rep-spinner" /> Generando...</>
                                            : <><IconDownload /> Descargar PDF</>
                                        }
                                    </button>
                                </div>

                                {/* PDF Pagos */}
                                <div className="rep-descarga-card" style={{ '--card-accent': '#6d28d9', '--card-bg': 'rgba(109,40,217,0.08)' }}>
                                    <div className="rep-descarga-icono" style={{ background: 'rgba(109,40,217,0.1)', color: '#6d28d9' }}><IconMoney /></div>
                                    <div className="rep-descarga-info">
                                        <h4>Reporte de Pagos</h4>
                                        <p>
                                            Todos los pagos confirmados con referencia PayPal, montos en Bs y USD
                                            {Object.keys(filtrosActivos).length > 0 ? ' (rango filtrado)' : ''}.
                                        </p>
                                    </div>
                                    <button
                                        className="rep-btn-descargar"
                                        style={{ background: '#6d28d9' }}
                                        onClick={handleDescargarPagos}
                                        disabled={descargando.pagos}
                                    >
                                        {descargando.pagos
                                            ? <><span className="rep-spinner" /> Generando...</>
                                            : <><IconDownload /> Descargar PDF</>
                                        }
                                    </button>
                                </div>

                            </div>
                        </div>

                        {/* ── Tabla: Inscripciones por Curso ── */}
                        <div className="reportes-tabla-section">
                            <div className="rep-tabla-header">
                                <h3>Inscripciones por Curso</h3>
                                <span className="rep-tabla-badge">{porCurso.length} cursos activos</span>
                            </div>
                            <div className="rep-tabla-wrapper">
                                <table className="rep-tabla">
                                    <thead>
                                        <tr>
                                            <th>Curso</th>
                                            <th>Inscritos</th>
                                            <th>Pagos confirmados</th>
                                            <th>Ingresos</th>
                                            <th>Ocupación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {porCurso.length === 0 ? (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="rep-state-box">
                                                        <IconCourses />
                                                        <p>No hay cursos con inscripciones.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : porCurso.map(curso => {
                                            const pct = curso.total_inscritos > 0
                                                ? Math.round((Number(curso.pagos_confirmados) / Number(curso.total_inscritos)) * 100)
                                                : 0;
                                            const colorFill = pct >= 80 ? 'verde' : pct >= 40 ? 'naranja' : 'rojo';

                                            return (
                                                <tr key={curso.curso_id}>
                                                    <td>
                                                        <div className="rep-nombre-curso">{curso.curso_nombre}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                                                            {fmtBs(curso.costo_bs)} / alumno
                                                        </div>
                                                    </td>
                                                    <td style={{ fontWeight: 700 }}>{curso.total_inscritos}</td>
                                                    <td>
                                                        <span style={{
                                                            background: Number(curso.pagos_confirmados) > 0 ? '#dcfce7' : '#f1f5f9',
                                                            color: Number(curso.pagos_confirmados) > 0 ? '#16a34a' : '#94a3b8',
                                                            padding: '0.25rem 0.65rem',
                                                            borderRadius: '50px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                        }}>
                                                            {curso.pagos_confirmados}
                                                        </span>
                                                    </td>
                                                    <td className="rep-monto-verde">{fmtBs(curso.ingresos_bs)}</td>
                                                    <td>
                                                        <div className="rep-progress-wrap">
                                                            <div className="rep-progress-bar">
                                                                <div
                                                                    className={`rep-progress-fill ${colorFill}`}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span className="rep-progress-pct">{pct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Nota informativa */}
                        <div style={{
                            background: 'white',
                            border: '1px solid #e0f2fe',
                            borderLeft: '4px solid #0369a1',
                            borderRadius: '12px',
                            padding: '1rem 1.5rem',
                            fontSize: '0.82rem',
                            color: '#0c4a6e',
                            lineHeight: 1.6,
                        }}>
                            <strong>ℹ️ Sobre los datos de pago:</strong> El estado de pago refleja los registros confirmados
                            en la tabla <code>pagos</code> con estado <em>COMPLETADO</em>. Las inscripciones sin pago
                            asociado se muestran como <em>PENDIENTE</em> en los reportes PDF.
                        </div>
                    </>
                )}
            </main>

            <Footer />

            {/* Toast */}
            {toast && (
                <div className={`rep-toast ${toast.tipo}`}>
                    <div className="rep-toast-icon">
                        {toast.tipo === 'exito' ? <IconCheck2 /> : <IconAlert />}
                    </div>
                    <div>
                        <div className="rep-toast-titulo">{toast.titulo}</div>
                        <div className="rep-toast-msg">{toast.mensaje}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReportes;