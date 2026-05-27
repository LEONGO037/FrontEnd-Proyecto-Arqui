import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderDynamic from '../layout/UserHeaderDynamic';
import Footer from '../layout/footerPrincipal';
import { getLogsSeguridad } from '../../services/auditoriaApi';
import './adminLogsAplicacion.css'; // Reuses key layout rules
import './adminLogsSeguridad.css'; // Extends with security elements

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

const parseUserAgent = (ua) => {
    if (!ua) return 'Desconocido';
    if (ua.includes('Windows')) {
        return 'Windows · ' + (ua.includes('Firefox') ? 'Firefox' : ua.includes('Chrome') ? 'Chrome' : 'Edge/Safari');
    }
    if (ua.includes('Android')) {
        return 'Android · ' + (ua.includes('Firefox') ? 'Firefox' : 'Chrome/WebView');
    }
    if (ua.includes('iPhone') || ua.includes('iPad')) {
        return 'iOS · Safari';
    }
    if (ua.includes('Macintosh')) {
        return 'macOS · Safari/Chrome';
    }
    if (ua.includes('Linux')) {
        return 'Linux · Chrome/Firefox';
    }
    return ua.split(' ').slice(0, 2).join(' ');
};

const stringifyDetail = (detail) => {
    if (!detail) return '';
    try {
        return JSON.stringify(detail, null, 2);
    } catch {
        return String(detail);
    }
};

const AdminLogsSeguridad = () => {
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [evento, setEvento] = useState('');
    const [exito, setExito] = useState('');
    const [email, setEmail] = useState('');
    const [ip, setIp] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [limite, setLimite] = useState('100');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getLogsSeguridad({
                evento: evento.trim() || undefined,
                exito: exito !== '' ? exito : undefined,
                email: email.trim() || undefined,
                ip: ip.trim() || undefined,
                desde: desde || undefined,
                hasta: hasta || undefined,
                limite: parseInt(limite) || 100
            });

            setLogs(response?.datos || []);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar los logs de seguridad.');
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
        setEvento('');
        setExito('');
        setEmail('');
        setIp('');
        setDesde('');
        setHasta('');
        setLimite('100');
        setTimeout(() => fetchLogs(), 50);
    };

    return (
        <div className="admin-page">
            <UserHeaderDynamic />

            <main className="admin-main">
                <div className="admin-logs-container security-theme">
                    <header className="admin-logs-header">
                        <button className="logs-back-button" onClick={() => navigate('/admin')} title="Volver al panel admin">
                            {'<'}
                        </button>

                        <div>
                            <h1 className="admin-logs-title">Logs de Seguridad</h1>
                            <p className="admin-logs-subtitle">
                                Auditoría detallada de inicios de sesión, bloqueos, desbloqueos y solicitudes críticas de seguridad.
                            </p>
                        </div>
                    </header>

                    {/* Glassmorphic Filters Card */}
                    <div className="logs-filtros-card">
                        <form className="logs-filtros-form" onSubmit={onSubmitFiltros}>
                            <div className="filter-group">
                                <label>Evento de Seguridad</label>
                                <input
                                    type="text"
                                    value={evento}
                                    onChange={(e) => setEvento(e.target.value)}
                                    placeholder="Ej. LOGIN_FALLIDO"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Resultado</label>
                                <select value={exito} onChange={(e) => setExito(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="true">Éxito</option>
                                    <option value="false">Fallido / Bloqueado</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Correo Electrónico</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Ej. usuario@correo.com"
                                />
                            </div>

                            <div className="filter-group">
                                <label>IP de Origen</label>
                                <input
                                    type="text"
                                    value={ip}
                                    onChange={(e) => setIp(e.target.value)}
                                    placeholder="Ej. 127.0.0.1"
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
                                <button type="submit" className="logs-btn-primary security-theme">Filtrar</button>
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
                                        <th style={{ width: '220px' }}>Evento</th>
                                        <th style={{ width: '100px' }}>Resultado</th>
                                        <th style={{ width: '220px' }}>Usuario / Destino</th>
                                        <th style={{ width: '200px' }}>Cliente (IP / UA)</th>
                                        <th style={{ width: '250px' }}>Ruta de Consulta</th>
                                        <th style={{ width: '250px' }}>Metadatos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="logs-empty">
                                                <div className="logs-empty-icon">🛡️</div>
                                                No se encontraron registros de logs de seguridad.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <span className="logs-fecha">{formatDate(item.fecha)}</span>
                                                </td>
                                                <td>
                                                    <div className="logs-evento" style={{ fontSize: '0.85rem' }}>{item.evento || 'ACCESO'}</div>
                                                </td>
                                                <td>
                                                    <span className={`logs-success-badge ${item.exito ? 'success' : 'failure'}`}>
                                                        {item.exito ? '✓ ÉXITO' : '✗ FALLA'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {item.usuario ? (
                                                        <div className="logs-usuario-name">{item.usuario}</div>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Sin Cuenta</span>
                                                    )}
                                                    <div className="logs-usuario-email" style={{ fontStyle: 'italic' }}>
                                                        {item.email || '-'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="logs-ip-badge">{item.ip || 'Local'}</span>
                                                    <div className="logs-ua-info" title={item.user_agent}>
                                                        {parseUserAgent(item.user_agent)}
                                                    </div>
                                                </td>
                                                <td>
                                                    {item.metodo && (
                                                        <span className={`logs-http-badge ${item.metodo}`}>{item.metodo}</span>
                                                    )}
                                                    <div className="logs-http-route" title={item.ruta}>
                                                        {item.ruta || '-'}
                                                    </div>
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

export default AdminLogsSeguridad;
