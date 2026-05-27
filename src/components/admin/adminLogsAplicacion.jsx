import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderDynamic from '../layout/UserHeaderDynamic';
import Footer from '../layout/footerPrincipal';
import { getLogsAplicacion } from '../../services/auditoriaApi';
import './adminLogsAplicacion.css';

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    try {
        return date.toLocaleString('es-BO', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return date.toLocaleString();
    }
};

const stringifyDetail = (detail) => {
    if (!detail) return '';
    try {
        return JSON.stringify(detail, null, 2);
    } catch {
        return String(detail);
    }
};

const AdminLogsAplicacion = () => {
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [modulo, setModulo] = useState('');
    const [nivel, setNivel] = useState('');
    const [evento, setEvento] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [limite, setLimite] = useState('100');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getLogsAplicacion({
                modulo: modulo.trim() || undefined,
                nivel: nivel || undefined,
                evento: evento.trim() || undefined,
                desde: desde || undefined,
                hasta: hasta || undefined,
                limite: parseInt(limite) || 100
            });

            setLogs(response?.datos || []);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar los logs de aplicación.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const onSubmitFiltros = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const onLimpiarFiltros = () => {
        setModulo('');
        setNivel('');
        setEvento('');
        setDesde('');
        setHasta('');
        setLimite('100');
        setTimeout(() => fetchLogs(), 50);
    };

    return (
        <div className="admin-page">
            <UserHeaderDynamic />

            <main className="admin-main">
                <div className="admin-logs-container">
                    <header className="admin-logs-header">
                        <button className="logs-back-button" onClick={() => navigate('/admin')} title="Volver al panel admin">
                            {'<'}
                        </button>

                        <div>
                            <h1 className="admin-logs-title">Logs de Aplicación</h1>
                            <p className="admin-logs-subtitle">
                                Registro estructurado de eventos asociados a funcionalidades críticas de negocio.
                            </p>
                        </div>
                    </header>

                    {/* Glassmorphic Filters Card */}
                    <div className="logs-filtros-card">
                        <form className="logs-filtros-form" onSubmit={onSubmitFiltros}>
                            <div className="filter-group">
                                <label>Módulo</label>
                                <input
                                    type="text"
                                    value={modulo}
                                    onChange={(e) => setModulo(e.target.value)}
                                    placeholder="Ej. cursos, pagos"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Nivel</label>
                                <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="INFO">INFO</option>
                                    <option value="WARN">WARN</option>
                                    <option value="ERROR">ERROR</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Evento</label>
                                <input
                                    type="text"
                                    value={evento}
                                    onChange={(e) => setEvento(e.target.value)}
                                    placeholder="Ej. CURSO_CREADO"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Desde</label>
                                <input
                                    type="date"
                                    value={desde}
                                    onChange={(e) => setDesde(e.target.value)}
                                />
                            </div>

                            <div className="filter-group">
                                <label>Hasta</label>
                                <input
                                    type="date"
                                    value={hasta}
                                    onChange={(e) => setHasta(e.target.value)}
                                />
                            </div>

                            <div className="filter-group">
                                <label>Límite</label>
                                <select value={limite} onChange={(e) => setLimite(e.target.value)}>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                    <option value="500">500</option>
                                </select>
                            </div>

                            <div className="logs-buttons-group">
                                <button type="submit" className="logs-btn-primary">Filtrar</button>
                                <button type="button" className="logs-btn-secondary" onClick={onLimpiarFiltros}>Limpiar</button>
                            </div>
                        </form>
                    </div>

                    {error && <div className="logs-error">⚠️ {error}</div>}

                    {loading ? (
                        <div className="logs-spinner-container">
                            <div className="logs-spinner" />
                        </div>
                    ) : (
                        <div className="logs-table-wrapper">
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '150px' }}>Fecha</th>
                                        <th style={{ width: '100px' }}>Nivel</th>
                                        <th style={{ width: '220px' }}>Módulo / Evento</th>
                                        <th>Mensaje</th>
                                        <th style={{ width: '200px' }}>Usuario</th>
                                        <th style={{ width: '300px' }}>Detalles Estructurados</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="logs-empty">
                                                <div className="logs-empty-icon">📊</div>
                                                No se encontraron registros de logs de aplicación.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <span className="logs-fecha">{formatDate(item.fecha)}</span>
                                                </td>
                                                <td>
                                                    <span className={`logs-level-badge ${item.nivel ? item.nivel.toLowerCase() : 'info'}`}>
                                                        {item.nivel || 'INFO'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="logs-modulo">{item.modulo || 'general'}</span>
                                                    <div className="logs-evento">{item.evento || '-'}</div>
                                                </td>
                                                <td>
                                                    <p className="logs-mensaje">{item.mensaje || '-'}</p>
                                                </td>
                                                <td>
                                                    {item.usuario ? (
                                                        <>
                                                            <div className="logs-usuario-name">{item.usuario}</div>
                                                            <div className="logs-usuario-email">{item.usuario_email || '-'}</div>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sistema</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.detalle && Object.keys(item.detalle).length > 0 ? (
                                                        <pre className="logs-json-details">{stringifyDetail(item.detalle)}</pre>
                                                    ) : (
                                                        <span style={{ color: '#cbd5e1' }}>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminLogsAplicacion;
