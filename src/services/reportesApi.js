// src/services/reportesApi.js
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
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
        const err = (data && data.error) || (data && data.message) || res.statusText;
        const e = new Error(err || 'API error');
        e.status = res.status;
        throw e;
    }
    return data;
};

/**
 * Estadísticas de resumen: totales de inscripciones, pagos, ingresos.
 * También incluye el desglose por curso.
 */
export const getResumenReportes = async () => {
    return jsonRequest('/api/reportes/resumen');
};

/**
 * Lista detallada de inscripciones (JSON).
 * @param {Object} filtros - { desde?: string, hasta?: string, curso_id?: number }
 */
export const getReporteInscripciones = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    if (filtros.curso_id) params.set('curso_id', filtros.curso_id);
    const query = params.toString() ? `?${params}` : '';
    return jsonRequest(`/api/reportes/inscripciones${query}`);
};

/**
 * Lista detallada de pagos confirmados (JSON).
 * @param {Object} filtros - { desde?: string, hasta?: string }
 */
export const getReportePagos = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    const query = params.toString() ? `?${params}` : '';
    return jsonRequest(`/api/reportes/pagos${query}`);
};

/**
 * Descarga el PDF de inscripciones y lo abre como archivo.
 * Maneja la respuesta como Blob para forzar la descarga del navegador.
 */
export const descargarPDFInscripciones = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    if (filtros.curso_id) params.set('curso_id', filtros.curso_id);
    const query = params.toString() ? `?${params}` : '';

    const res = await fetch(`${API_BASE}/api/reportes/inscripciones/pdf${query}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al generar el PDF de inscripciones');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_inscripciones_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Descarga el PDF de pagos y lo abre como archivo.
 */
export const descargarPDFPagos = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    const query = params.toString() ? `?${params}` : '';

    const res = await fetch(`${API_BASE}/api/reportes/pagos/pdf${query}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al generar el PDF de pagos');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_pagos_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export default {
    getResumenReportes,
    getReporteInscripciones,
    getReportePagos,
    descargarPDFInscripciones,
    descargarPDFPagos,
};