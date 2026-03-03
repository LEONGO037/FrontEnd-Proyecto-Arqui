// src/services/docenteApi.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const jsonRequest = async (path, options = {}) => {
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
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

// Obtener cursos del docente
export const obtenerMisCursos = async () => {
  return jsonRequest('/api/docente/mis-cursos', { method: 'GET' });
};

// Obtener estudiantes de un curso
export const obtenerEstudiantesCurso = async (cursoId) => {
  return jsonRequest(`/api/docente/curso/${cursoId}/estudiantes`, { method: 'GET' });
};

// Guardar notas de estudiantes
export const guardarNotasEstudiantes = async (cursoId, notas) => {
  const notasValidas = (notas || []).filter(
    (item) => item?.estudiante_curso_id && item?.nota_final !== null && item?.nota_final !== undefined
  );

  if (notasValidas.length === 0) {
    return { mensaje: 'No hay notas válidas para guardar', resultados: [] };
  }

  const resultados = await Promise.all(
    notasValidas.map((item) =>
      jsonRequest(`/api/docente/curso/${cursoId}/estudiante/${item.estudiante_curso_id}/nota`, {
        method: 'POST',
        body: JSON.stringify({ nota: item.nota_final })
      })
    )
  );

  return { mensaje: 'Notas guardadas correctamente', resultados };
};

// Obtener métricas de un curso
export const obtenerMetricasCurso = async (cursoId) => {
  return jsonRequest(`/api/docente/${cursoId}/metricas`, { method: 'GET' });
};

// Cambiar estado del curso
export const cambiarEstadoCurso = async (cursoId, estadoCurso) => {
  return jsonRequest('/api/docente/estado-curso', {
    method: 'PUT',
    body: JSON.stringify({ curso_id: cursoId, estado_curso: estadoCurso })
  });
};

export default {
  obtenerMisCursos,
  obtenerEstudiantesCurso,
  guardarNotasEstudiantes,
  obtenerMetricasCurso,
  cambiarEstadoCurso
};
