// src/services/loginApi.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const jsonRequest = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
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
  const data = await jsonRequest('/api/autenticacion/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario || null));
  }
  return data;
};

export const register = async (payload) => {
  const data = await jsonRequest('/api/autenticacion/registrar', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default { login, register, logout, getAuthHeaders };