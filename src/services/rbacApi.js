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

export const getRoles = () => request('/api/rbac/roles');
export const getPermisos = () => request('/api/rbac/permisos');
export const createRole = (data) => request('/api/rbac/roles', { method: 'POST', body: JSON.stringify(data) });
export const updateRole = (id, data) => request(`/api/rbac/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRole = (id) => request(`/api/rbac/roles/${id}`, { method: 'DELETE' });
export const assignPermiso = (rolId, permisoId) =>
  request(`/api/rbac/roles/${rolId}/permisos`, { method: 'POST', body: JSON.stringify({ permisoId }) });
export const removePermiso = (rolId, permisoId) =>
  request(`/api/rbac/roles/${rolId}/permisos/${permisoId}`, { method: 'DELETE' });
export const getMatriz = () => request('/api/rbac/matriz');
export const getUsuarios = () => request('/api/rbac/usuarios');
export const updateUserRole = (userId, rolId) =>
  request(`/api/rbac/usuarios/${userId}/rol`, { method: 'PUT', body: JSON.stringify({ rol_id: rolId }) });
export const desbloquearUsuario = (userId) =>
  request(`/api/rbac/usuarios/${userId}/desbloquear`, { method: 'POST' });
export const deleteUser = (userId) =>
  request(`/api/rbac/usuarios/${userId}`, { method: 'DELETE' });

export default {
  getRoles, getPermisos, createRole, updateRole, deleteRole,
  assignPermiso, removePermiso, getMatriz, getUsuarios, updateUserRole, desbloquearUsuario, deleteUser,
};
