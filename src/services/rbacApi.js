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

export const getRoles = (options = {}) => {
  const params = new URLSearchParams();
  if (options.includeInactive) params.set('include_inactive', 'true');
  const query = params.toString();
  return request(`/api/rbac/roles${query ? `?${query}` : ''}`);
};

export const getPermisos = (options = {}) => {
  const params = new URLSearchParams();
  if (options.includeInactive) params.set('include_inactive', 'true');
  const query = params.toString();
  return request(`/api/rbac/permisos${query ? `?${query}` : ''}`);
};
export const createRole = (data) => request('/api/rbac/roles', { method: 'POST', body: JSON.stringify(data) });
export const updateRole = (id, data) => request(`/api/rbac/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRole = (id) => request(`/api/rbac/roles/${id}`, { method: 'DELETE' });
export const assignPermiso = (rolId, permisoId) =>
  request(`/api/rbac/roles/${rolId}/permisos`, { method: 'POST', body: JSON.stringify({ permisoId }) });
export const removePermiso = (rolId, permisoId) =>
  request(`/api/rbac/roles/${rolId}/permisos/${permisoId}`, { method: 'DELETE' });
export const getMatriz = () => request('/api/rbac/matriz');
export const getUsuarios = (options = {}) => {
  const params = new URLSearchParams();
  if (options.includeInactive) params.set('include_inactive', 'true');
  const query = params.toString();
  return request(`/api/rbac/usuarios${query ? `?${query}` : ''}`);
};
export const getUsuarioDetalle = (userId) => request(`/api/rbac/usuarios/${userId}/detalle`);
export const createUser = (data) => request('/api/rbac/usuarios', { method: 'POST', body: JSON.stringify(data) });
export const updateUserRole = (userId, rolId) =>
  request(`/api/rbac/usuarios/${userId}/rol`, { method: 'PUT', body: JSON.stringify({ rol_id: rolId }) });
export const desbloquearUsuario = (userId) =>
  request(`/api/rbac/usuarios/${userId}/desbloquear`, { method: 'POST' });
export const deleteUser = (userId) =>
  request(`/api/rbac/usuarios/${userId}`, { method: 'DELETE' });

export default {
  getRoles, getPermisos, createRole, updateRole, deleteRole,
  assignPermiso, removePermiso, getMatriz, getUsuarios, getUsuarioDetalle, createUser, updateUserRole, desbloquearUsuario, deleteUser,
};
