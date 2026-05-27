import { getAuthHeaders } from './loginApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const jsonRequest = async (path, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await res.text();

    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        const err = (data && data.error) || (data && data.message) || res.statusText;
        const e = new Error(err || 'API error');
        e.status = res.status;
        throw e;
    }

    return data;
};

export const getRegistrosAuditoria = async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.usuario) params.set('usuario', filtros.usuario);
    if (filtros.accion) params.set('accion', filtros.accion);
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    if (filtros.limite) params.set('limite', String(filtros.limite));

    const query = params.toString() ? `?${params.toString()}` : '';
    return jsonRequest(`/api/reportes/auditoria${query}`);
};

export const getLogsAplicacion = async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.modulo) params.set('modulo', filtros.modulo);
    if (filtros.nivel) params.set('nivel', filtros.nivel);
    if (filtros.evento) params.set('evento', filtros.evento);
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    if (filtros.limite) params.set('limite', String(filtros.limite));

    const query = params.toString() ? `?${params.toString()}` : '';
    return jsonRequest(`/api/reportes/logs-aplicacion${query}`);
};

export const getLogsSeguridad = async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.evento) params.set('evento', filtros.evento);
    if (filtros.exito !== undefined && filtros.exito !== '') params.set('exito', String(filtros.exito));
    if (filtros.email) params.set('email', filtros.email);
    if (filtros.ip) params.set('ip', filtros.ip);
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    if (filtros.limite) params.set('limite', String(filtros.limite));

    const query = params.toString() ? `?${params.toString()}` : '';
    return jsonRequest(`/api/reportes/logs-seguridad${query}`);
};

export default {
    getRegistrosAuditoria,
    getLogsAplicacion,
    getLogsSeguridad,
};
