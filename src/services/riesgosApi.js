import { getToken } from '../utils/tokenStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const request = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
        const err = new Error((data && data.error) || res.statusText);
        err.status = res.status;
        throw err;
    }
    return data;
};

const buildQuery = (params = {}) => {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') usp.set(k, v);
    });
    const q = usp.toString();
    return q ? `?${q}` : '';
};

// ───── Catálogo ────────────────────────────────────────────────────────────
export const getCatalogo = (params = {}) =>
    request(`/api/riesgos/catalogo${buildQuery(params)}`);

// ───── Dashboard ───────────────────────────────────────────────────────────
export const getResumen = () => request('/api/riesgos/resumen');

// ───── Registros ───────────────────────────────────────────────────────────
export const getRegistros = (params = {}) =>
    request(`/api/riesgos/registros${buildQuery(params)}`);

export const getRegistroDetalle = (id) =>
    request(`/api/riesgos/registros/${id}`);

export const crearRegistroManual = (data) =>
    request('/api/riesgos/registros', { method: 'POST', body: JSON.stringify(data) });

export const cambiarEstadoRegistro = (id, estado) =>
    request(`/api/riesgos/registros/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado }),
    });

// ───── Planes de acción ────────────────────────────────────────────────────
export const crearPlanAccion = (registroId, data) =>
    request(`/api/riesgos/registros/${registroId}/planes`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const actualizarPlanAccion = (planId, data) =>
    request(`/api/riesgos/planes/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

// ───── Detección automática ────────────────────────────────────────────────
export const ejecutarDeteccion = () =>
    request('/api/riesgos/deteccion/ejecutar', { method: 'POST' });

// ───── Matriz de Análisis de Riesgos ───────────────────────────────────────
export const getMatrizRiesgos = () =>
    request('/api/riesgos/matriz');

export const crearItemMatriz = (data) =>
    request('/api/riesgos/matriz', { method: 'POST', body: JSON.stringify(data) });

export const actualizarItemMatriz = (id, data) =>
    request(`/api/riesgos/matriz/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const eliminarItemMatriz = (id) =>
    request(`/api/riesgos/matriz/${id}`, { method: 'DELETE' });

export default {
    getCatalogo,
    getResumen,
    getRegistros,
    getRegistroDetalle,
    crearRegistroManual,
    cambiarEstadoRegistro,
    crearPlanAccion,
    actualizarPlanAccion,
    ejecutarDeteccion,
    getMatrizRiesgos,
    crearItemMatriz,
    actualizarItemMatriz,
    eliminarItemMatriz,
};
