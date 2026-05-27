import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderDynamic from '../layout/UserHeaderDynamic';
import Footer from '../layout/footerPrincipal';
import { getLogsSeguridad } from '../../services/auditoriaApi';
import './adminAuditoria.css';

const EVENTO_LABELS = {
    LOGIN_EXITOSO:             'Inicio de sesión exitoso',
    LOGIN_FALLIDO:             'Intento de login fallido',
    LOGIN_BLOQUEADO:           'Login bloqueado',
    CUENTA_BLOQUEADA:          'Cuenta bloqueada',
    CUENTA_DESBLOQUEADA:       'Cuenta desbloqueada',
    CIERRE_SESION:             'Cierre de sesión',
    TOKEN_INVALIDO:            'Token inválido',
    TOKEN_EXPIRADO:            'Token expirado',
    ACCESO_DENEGADO:           'Acceso denegado',
    PERMISO_DENEGADO:          'Permiso denegado',
    PERMISO_DENEGADO_FRONTEND: 'Acceso denegado (frontend)',
    CAMBIO_PASSWORD:           'Cambio de contraseña',
    RESET_PASSWORD_SOLICITADO: 'Reset de contraseña solicitado',
    ACTIVIDAD_SOSPECHOSA:      'Actividad sospechosa',
};

const EXITO_FILTROS = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Exitosos' },
    { value: 'false', label: 'Fallidos / Denegados' },
];

const formatDate = (value) => {
    if (!value) return '-';
    const normalized = String(value)
        .replace(' ', 'T')
        .replace(/\+00$/, '+00:00');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('es-BO', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
};

const simplificarNavegador = (ua) => {
    if (!ua) return '-';
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Postman')) return 'Postman';
    if (ua.includes('curl')) return 'curl';
    return ua.slice(0, 28);
};

const etiquetarEvento = (evento) => EVENTO_LABELS[evento] || evento;

const tieneDetalle = (detalle) =>
    detalle && typeof detalle === 'object' && Object.keys(detalle).length > 0;

const exportarJSON = (registros) => {
    const exportData = registros.map((r) => ({
        id: r.id,
        fecha: r.fecha,
        evento: r.evento,
        descripcion_evento: etiquetarEvento(r.evento),
        resultado: r.exito ? 'Exitoso' : 'Fallido',
        usuario: r.usuario_nombre || null,
        email: r.email || null,
        ip: r.ip || null,
        navegador: r.user_agent || null,
        ruta: r.ruta || null,
        metodo_http: r.metodo || null,
        detalle: r.detalle,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_seguridad_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

const ResultadoBadge = ({ exito }) => (
    <span
        className="auditoria-badge"
        style={exito
            ? { background: '#dcfce7', color: '#166534' }
            : { background: '#fee2e2', color: '#991b1b' }}
    >
        {exito ? 'Exitoso' : 'Fallido'}
    </span>
);

const AdminLogsSeguridad = () => {
    const navigate = useNavigate();

    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandido, setExpandido] = useState(null);

    const [filtroEvento, setFiltroEvento] = useState('');
    const [filtroExito, setFiltroExito] = useState('');
    const [filtroEmail, setFiltroEmail] = useState('');
    const [filtroIp, setFiltroIp] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getLogsSeguridad({
                evento: filtroEvento.trim() || undefined,
                exito: filtroExito !== '' ? filtroExito : undefined,
                email: filtroEmail.trim() || undefined,
                ip: filtroIp.trim() || undefined,
                limite: 150,
            });
            setRegistros(response?.datos || []);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar los logs de seguridad.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const onSubmitFiltros = (e) => { e.preventDefault(); fetchLogs(); };

    const toggleExpandido = (id) =>
        setExpandido((prev) => (prev === id ? null : id));

    return (
        <div className="admin-page">
            <UserHeaderDynamic />

            <main className="admin-main">
                <div className="admin-auditoria-container">
                    <header className="admin-auditoria-header">
                        <button className="auditoria-back-button" onClick={() => navigate('/admin')}>
                            {'<'}
                        </button>
                        <div>
                            <h1 className="admin-auditoria-title">Logs de Seguridad</h1>
                            <p className="admin-auditoria-subtitle">
                                Eventos de autenticación, bloqueos, tokens y accesos denegados — con IP y navegador.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => exportarJSON(registros)}
                            disabled={registros.length === 0}
                            style={{
                                marginLeft: 'auto',
                                padding: '0.5rem 1rem',
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: registros.length === 0 ? 'not-allowed' : 'pointer',
                                opacity: registros.length === 0 ? 0.5 : 1,
                                fontSize: '0.85rem',
                                flexShrink: 0,
                            }}
                        >
                            Exportar JSON ({registros.length})
                        </button>
                    </header>

                    <form className="auditoria-filtros" onSubmit={onSubmitFiltros}>
                        <input
                            type="text"
                            value={filtroEvento}
                            onChange={(e) => setFiltroEvento(e.target.value)}
                            placeholder="Tipo de evento (ej: LOGIN)"
                        />
                        <select
                            value={filtroExito}
                            onChange={(e) => setFiltroExito(e.target.value)}
                        >
                            {EXITO_FILTROS.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={filtroEmail}
                            onChange={(e) => setFiltroEmail(e.target.value)}
                            placeholder="Filtrar por email"
                        />
                        <input
                            type="text"
                            value={filtroIp}
                            onChange={(e) => setFiltroIp(e.target.value)}
                            placeholder="Filtrar por IP"
                        />
                        <button type="submit">Buscar</button>
                        <button type="button" onClick={fetchLogs}>Refrescar</button>
                    </form>

                    {error && <div className="auditoria-error">{error}</div>}

                    {loading ? (
                        <div className="spinner-container"><div className="spinner" /></div>
                    ) : (
                        <section className="admin-table-wrapper">
                            <table className="admin-pagos-table logs-seg-table">
                                <colgroup>
                                    <col />{/* Fecha */}
                                    <col />{/* Evento */}
                                    <col />{/* Resultado */}
                                    <col />{/* Email/Usuario */}
                                    <col />{/* IP */}
                                    <col />{/* Ruta */}
                                    <col />{/* Navegador */}
                                    <col />{/* Detalle */}
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Evento</th>
                                        <th>Resultado</th>
                                        <th>Email / Usuario</th>
                                        <th>IP</th>
                                        <th>Ruta</th>
                                        <th>Navegador</th>
                                        <th>Detalle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                                No se encontraron eventos de seguridad.
                                            </td>
                                        </tr>
                                    ) : (
                                        registros.map((item) => (
                                            <React.Fragment key={item.id}>
                                                <tr>
                                                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                        {formatDate(item.fecha)}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                                                            {etiquetarEvento(item.evento)}
                                                        </div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 2 }}>
                                                            {item.evento}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <ResultadoBadge exito={item.exito} />
                                                    </td>
                                                    <td>
                                                        <div className="auditoria-usuario">
                                                            {item.usuario_nombre || item.email || 'Desconocido'}
                                                        </div>
                                                        {item.usuario_nombre && item.email && (
                                                            <div className="auditoria-email">{item.email}</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <code style={{ fontSize: '0.78rem', color: '#dc2626' }}>
                                                            {item.ip || '-'}
                                                        </code>
                                                    </td>
                                                    <td style={{ fontSize: '0.78rem', color: '#475569' }}>
                                                        {item.metodo && (
                                                            <strong style={{ marginRight: 4 }}>{item.metodo}</strong>
                                                        )}
                                                        {item.ruta
                                                            ? <span title={item.ruta}>{item.ruta.length > 35 ? item.ruta.slice(0, 35) + '…' : item.ruta}</span>
                                                            : '-'}
                                                    </td>
                                                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                        {simplificarNavegador(item.user_agent)}
                                                    </td>
                                                    <td>
                                                        {tieneDetalle(item.detalle) ? (
                                                            <button
                                                                onClick={() => toggleExpandido(item.id)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: 6,
                                                                    padding: '0.2rem 0.55rem',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.74rem',
                                                                    color: '#475569',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {expandido === item.id ? 'Ocultar' : 'Ver más'}
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                                {expandido === item.id && (
                                                    <tr className="auditoria-detalle-row">
                                                        <td colSpan="8">
                                                            <div className="auditoria-detalle-inner" style={{ background: '#fef2f2' }}>
                                                                <pre>
                                                                    {JSON.stringify(item.detalle, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminLogsSeguridad;
