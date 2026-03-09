// src/services/pagosApi.js
import { getAuthHeaders } from './loginApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const jsonRequest = async (path, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        data = text;
    }

    if (!res.ok) {
        const err = (data && data.error) || (data && data.message) || res.statusText;
        const e = new Error(err || 'API error');
        e.status = res.status;
        e.payload = data;
        throw e;
    }
    return data;
};

/**
 * Obtiene todos los pagos realizados (solo para administradores)
 */
export const getAllPagos = async (limit = 10, offset = 0) => {
    return await jsonRequest(`/api/pagos?limit=${limit}&offset=${offset}`, {
        method: 'GET'
    });
};

export default {
    getAllPagos
};
