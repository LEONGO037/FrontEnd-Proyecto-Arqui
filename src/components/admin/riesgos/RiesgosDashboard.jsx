import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderDynamic from '../../layout/UserHeaderDynamic';
import Footer from '../../layout/footerPrincipal';
import { useAuth } from '../../../context/AuthContext';
import { PERMISSIONS } from '../../../utils/roleUtils';
import {
    getResumen,
    getRegistros,
    getCatalogo,
    ejecutarDeteccion,
    crearRegistroManual,
} from '../../../services/riesgosApi';
import './RiesgosDashboard.css';

const formatFecha = (v) => {
    if (!v) return '-';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('es-BO', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
};

const COLOR_CATEGORIA = {
    CRITICO: '#b91c1c',
    ALTO:    '#ea580c',
    MEDIO:   '#ca8a04',
    BAJO:    '#16a34a',
};

const COLOR_ESTADO = {
    DETECTADO:       '#dc2626',
    EN_REVISION:     '#d97706',
    MITIGADO:        '#059669',
    CERRADO:         '#475569',
    FALSO_POSITIVO:  '#64748b',
};

const ESTADOS_REGISTRO = ['DETECTADO', 'EN_REVISION', 'MITIGADO', 'CERRADO', 'FALSO_POSITIVO'];
const CATEGORIAS = ['CRITICO', 'ALTO', 'MEDIO', 'BAJO'];

const RiesgosDashboard = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const puedeGestionar = (usuario?.permisos || []).includes(PERMISSIONS.RIESGOS_GESTIONAR);

    const [resumen, setResumen] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [filtros, setFiltros] = useState({ estado: '', categoria: '' });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [deteccionEnCurso, setDeteccionEnCurso] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [activeTab, setActiveTab] = useState('incidentes');

    const [modalAbierto, setModalAbierto] = useState(false);
    const [catalogo, setCatalogo] = useState([]);
    const [formManual, setFormManual] = useState({
        riesgo_catalogo_id: '',
        email_afectado: '',
        ip: '',
        detalle: '',
    });
    const [enviandoManual, setEnviandoManual] = useState(false);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError('');
        try {
            const [r, regs] = await Promise.all([
                getResumen(),
                getRegistros({ ...filtros, limite: 100 }),
            ]);
            setResumen(r);
            setRegistros(regs.datos || []);
        } catch (err) {
            setError(err.message || 'Error al cargar datos');
        } finally {
            setCargando(false);
        }
    }, [filtros]);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirModalManual = async () => {
        try {
            if (catalogo.length === 0) {
                const c = await getCatalogo();
                setCatalogo(c.datos || []);
            }
            setModalAbierto(true);
        } catch (err) {
            setError(err.message || 'No se pudo cargar el catálogo');
        }
    };

    const handleEjecutarDeteccion = async () => {
        setDeteccionEnCurso(true);
        setMensaje('');
        setError('');
        try {
            const r = await ejecutarDeteccion();
            setMensaje(
                r.total_creados > 0
                    ? `Detección completada: ${r.total_creados} registros nuevos creados.`
                    : 'Detección completada: no se encontraron patrones sospechosos nuevos.'
            );
            await cargar();
        } catch (err) {
            setError(err.message || 'Error al ejecutar detección');
        } finally {
            setDeteccionEnCurso(false);
        }
    };

    const handleCrearManual = async (e) => {
        e.preventDefault();
        if (!formManual.riesgo_catalogo_id) {
            setError('Selecciona un tipo de riesgo');
            return;
        }
        setEnviandoManual(true);
        setError('');
        try {
            let detalleObj = {};
            if (formManual.detalle.trim()) {
                try {
                    detalleObj = JSON.parse(formManual.detalle);
                } catch {
                    detalleObj = { nota: formManual.detalle };
                }
            }
            await crearRegistroManual({
                riesgo_catalogo_id: Number(formManual.riesgo_catalogo_id),
                email_afectado: formManual.email_afectado || null,
                ip: formManual.ip || null,
                detalle: detalleObj,
            });
            setModalAbierto(false);
            setFormManual({ riesgo_catalogo_id: '', email_afectado: '', ip: '', detalle: '' });
            setMensaje('Registro manual creado correctamente.');
            await cargar();
        } catch (err) {
            setError(err.message || 'Error al crear registro');
        } finally {
            setEnviandoManual(false);
        }
    };

    const totalAbiertos = (resumen?.por_categoria || []).reduce((s, c) => s + (c.abiertos || 0), 0);

    return (
        <div className="riesgos-page">
            <UserHeaderDynamic />

            <main className="riesgos-main">
                {/* Header */}
                <div className="riesgos-header">
                    <button
                        className="riesgos-back-button"
                        onClick={() => navigate('/admin')}
                        aria-label="Volver al panel"
                    >
                        ←
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 className="riesgos-title">🛡️ Gestión de Riesgos</h1>
                        <p className="riesgos-subtitle">
                            Detección de incidentes de seguridad y planes de mitigación
                        </p>
                    </div>
                    {puedeGestionar && (
                        <div className="riesgos-actions">
                            <button
                                className="btn-primario"
                                onClick={handleEjecutarDeteccion}
                                disabled={deteccionEnCurso}
                            >
                                {deteccionEnCurso ? '⏳ Ejecutando...' : '🔍 Ejecutar Detección'}
                            </button>
                            <button className="btn-secundario" onClick={abrirModalManual}>
                                + Registro Manual
                            </button>
                        </div>
                    )}
                </div>

                {error && <div className="riesgos-alert riesgos-alert-error">{error}</div>}
                {mensaje && <div className="riesgos-alert riesgos-alert-ok">{mensaje}</div>}

                {/* KPIs por categoría */}
                <section className="riesgos-kpis">
                    {CATEGORIAS.map((cat) => {
                        const item = (resumen?.por_categoria || []).find((c) => c.nivel_categoria === cat);
                        return (
                            <div
                                key={cat}
                                className="kpi-card"
                                style={{ borderTopColor: COLOR_CATEGORIA[cat] }}
                            >
                                <span className="kpi-label" style={{ color: COLOR_CATEGORIA[cat] }}>{cat}</span>
                                <div className="kpi-numbers">
                                    <div>
                                        <span className="kpi-big">{item?.abiertos ?? 0}</span>
                                        <span className="kpi-mini">abiertos</span>
                                    </div>
                                    <div>
                                        <span className="kpi-small">{item?.cerrados ?? 0}</span>
                                        <span className="kpi-mini">cerrados</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="kpi-card kpi-card-secondary">
                        <span className="kpi-label">PLANES PENDIENTES</span>
                        <div className="kpi-numbers">
                            <div>
                                <span className="kpi-big">{resumen?.planes_pendientes ?? 0}</span>
                                <span className="kpi-mini">por completar</span>
                            </div>
                        </div>
                    </div>
                    <div className="kpi-card kpi-card-secondary">
                        <span className="kpi-label">TOTAL ABIERTOS</span>
                        <div className="kpi-numbers">
                            <div>
                                <span className="kpi-big">{totalAbiertos}</span>
                                <span className="kpi-mini">incidentes</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filtros */}
                <section className="riesgos-filtros">
                    <select
                        value={filtros.estado}
                        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    >
                        <option value="">Todos los estados</option>
                        {ESTADOS_REGISTRO.map((e) => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                    <select
                        value={filtros.categoria}
                        onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                    >
                        <option value="">Todas las categorías</option>
                        {CATEGORIAS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <button className="btn-secundario" onClick={cargar} disabled={cargando}>
                        {cargando ? 'Cargando...' : '🔄 Refrescar'}
                    </button>
                </section>

                {/* Tabla de registros */}
                <section className="riesgos-tabla-wrapper">
                    {cargando && registros.length === 0 ? (
                        <div className="riesgos-empty">Cargando registros...</div>
                    ) : registros.length === 0 ? (
                        <div className="riesgos-empty">
                            <div style={{ fontSize: '3rem' }}>✅</div>
                            <p>No hay registros que coincidan con los filtros.</p>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                Ejecuta la detección automática o ajusta los filtros.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Vista escritorio: tabla */}
                            <table className="riesgos-tabla">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Código</th>
                                        <th>Evento</th>
                                        <th>Nivel</th>
                                        <th>Afectado</th>
                                        <th>IP</th>
                                        <th>Origen</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((r) => (
                                        <tr key={r.id}>
                                            <td>{formatFecha(r.fecha_deteccion)}</td>
                                            <td className="codigo-cell">{r.catalogo_codigo}</td>
                                            <td className="evento-cell">{r.catalogo_nombre}</td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: `${COLOR_CATEGORIA[r.nivel_categoria]}22`,
                                                        color: COLOR_CATEGORIA[r.nivel_categoria],
                                                        border: `1px solid ${COLOR_CATEGORIA[r.nivel_categoria]}55`,
                                                    }}
                                                >
                                                    {r.nivel_categoria} ({r.nivel_riesgo})
                                                </span>
                                            </td>
                                            <td>{r.email_afectado || r.usuario_afectado_email || '-'}</td>
                                            <td className="ip-cell">{r.ip || '-'}</td>
                                            <td>
                                                <span className={`origen-tag origen-${r.origen?.toLowerCase()}`}>
                                                    {r.origen === 'AUTOMATICO' ? '🤖 Auto' : '✍️ Manual'}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: `${COLOR_ESTADO[r.estado]}22`,
                                                        color: COLOR_ESTADO[r.estado],
                                                        border: `1px solid ${COLOR_ESTADO[r.estado]}55`,
                                                    }}
                                                >
                                                    {r.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-link"
                                                    onClick={() => navigate(`/admin/riesgos/${r.id}`)}
                                                >
                                                    Ver detalle →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Vista móvil: cards */}
                            <div className="riesgos-cards">
                                {registros.map((r) => (
                                    <button
                                        key={r.id}
                                        className="riesgo-card"
                                        onClick={() => navigate(`/admin/riesgos/${r.id}`)}
                                        style={{ borderLeftColor: COLOR_CATEGORIA[r.nivel_categoria] }}
                                    >
                                        <div className="riesgo-card-top">
                                            <span className="riesgo-card-codigo">{r.catalogo_codigo}</span>
                                            <span
                                                className="badge"
                                                style={{
                                                    background: `${COLOR_CATEGORIA[r.nivel_categoria]}22`,
                                                    color: COLOR_CATEGORIA[r.nivel_categoria],
                                                    border: `1px solid ${COLOR_CATEGORIA[r.nivel_categoria]}55`,
                                                }}
                                            >
                                                {r.nivel_categoria} ({r.nivel_riesgo})
                                            </span>
                                        </div>
                                        <div className="riesgo-card-evento">{r.catalogo_nombre}</div>
                                        <div className="riesgo-card-meta">
                                            <span>📅 {formatFecha(r.fecha_deteccion)}</span>
                                            {(r.email_afectado || r.usuario_afectado_email) && (
                                                <span>👤 {r.email_afectado || r.usuario_afectado_email}</span>
                                            )}
                                            {r.ip && <span className="ip-cell">🌐 {r.ip}</span>}
                                        </div>
                                        <div className="riesgo-card-bottom">
                                            <span className={`origen-tag origen-${r.origen?.toLowerCase()}`}>
                                                {r.origen === 'AUTOMATICO' ? '🤖 Auto' : '✍️ Manual'}
                                            </span>
                                            <span
                                                className="badge"
                                                style={{
                                                    background: `${COLOR_ESTADO[r.estado]}22`,
                                                    color: COLOR_ESTADO[r.estado],
                                                    border: `1px solid ${COLOR_ESTADO[r.estado]}55`,
                                                }}
                                            >
                                                {r.estado}
                                            </span>
                                            <span className="riesgo-card-arrow">→</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </main>

            {/* Modal de creación manual */}
            {modalAbierto && (
                <div className="riesgos-modal-overlay" onClick={() => setModalAbierto(false)}>
                    <div className="riesgos-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Registro Manual de Riesgo</h2>
                        <p className="modal-desc">
                            Registra manualmente un incidente que detectaste fuera del sistema automático.
                        </p>
                        <form onSubmit={handleCrearManual}>
                            <label>
                                Tipo de riesgo *
                                <select
                                    required
                                    value={formManual.riesgo_catalogo_id}
                                    onChange={(e) =>
                                        setFormManual({ ...formManual, riesgo_catalogo_id: e.target.value })
                                    }
                                >
                                    <option value="">-- Selecciona --</option>
                                    {catalogo.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            [{c.codigo}] {c.nombre} ({c.nivel_categoria})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Email afectado (opcional)
                                <input
                                    type="email"
                                    value={formManual.email_afectado}
                                    onChange={(e) =>
                                        setFormManual({ ...formManual, email_afectado: e.target.value })
                                    }
                                    placeholder="usuario@ucb.edu.bo"
                                />
                            </label>

                            <label>
                                IP (opcional)
                                <input
                                    type="text"
                                    value={formManual.ip}
                                    onChange={(e) => setFormManual({ ...formManual, ip: e.target.value })}
                                    placeholder="192.168.1.45"
                                />
                            </label>

                            <label>
                                Detalle / Observaciones
                                <textarea
                                    rows="3"
                                    value={formManual.detalle}
                                    onChange={(e) => setFormManual({ ...formManual, detalle: e.target.value })}
                                    placeholder="Describe el evento..."
                                />
                            </label>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secundario"
                                    onClick={() => setModalAbierto(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario" disabled={enviandoManual}>
                                    {enviandoManual ? 'Creando...' : 'Crear Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default RiesgosDashboard;
