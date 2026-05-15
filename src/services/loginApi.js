import { getToken, clearToken } from '../utils/tokenStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const jsonRequest = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = (data && data.error) || (data && data.message) || res.statusText;
    const e = new Error(err || 'API error');
    e.status = res.status;
    e.payload = data;
    throw e;
  }
  return data;
};

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/api/autenticacion/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  // Devolvemos el payload aunque sea debe_cambiar o expirada, para que el frontend actue
  if (res.ok || (data?.debe_cambiar) || (data?.expirada)) return data;

  const e = new Error((data && data.error) || res.statusText || 'Error de autenticación');
  e.status = res.status;
  e.payload = data;
  throw e;
};

export const register = async (payload) =>
  jsonRequest('/api/autenticacion/registrar', { method: 'POST', body: JSON.stringify(payload) });

export const verificarCodigo = async (email, codigo) =>
  jsonRequest('/api/autenticacion/verificar-codigo', {
    method: 'POST',
    body: JSON.stringify({ email, codigo }),
  });

export const changePassword = async (passwordActual, nuevaPassword) => {
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  return jsonRequest('/api/autenticacion/cambiar-password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password_actual: passwordActual, nueva_password: nuevaPassword }),
  });
};

export const solicitarReset = async (email) =>
  jsonRequest('/api/autenticacion/solicitar-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const verificarCodigoReset = async (email, codigo) =>
  jsonRequest('/api/autenticacion/verificar-codigo-reset', {
    method: 'POST',
    body: JSON.stringify({ email, codigo }),
  });

export const resetPassword = async (token, nuevaPassword) =>
  jsonRequest('/api/autenticacion/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, nueva_password: nuevaPassword }),
  });

export const logout = () => {
  clearToken();
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default { login, register, verificarCodigo, changePassword, solicitarReset, verificarCodigoReset, resetPassword, logout, getAuthHeaders };
