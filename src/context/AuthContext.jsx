// AuthContext.jsx — inicializa sesión desde localStorage (JWT persistente)
import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cursosInscritos, setCursosInscritos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (token && userRaw) {
      try {
        const userParsed = JSON.parse(userRaw);
        setUsuario(userParsed);
        fetchInscripciones(token);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setCargando(false);
  }, []);

  const fetchInscripciones = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/api/inscripciones/mis-inscripciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCursosInscritos(data.map(i => i.curso_id));
    } catch (err) {
      console.error('Error al cargar inscripciones:', err);
    }
  };

  const login = (datosUsuario) => {
    setUsuario(datosUsuario);
    const token = localStorage.getItem('token');
    if (token) fetchInscripciones(token);
  };

  const logout = () => {
    setUsuario(null);
    setCursosInscritos([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const inscribirCurso = async (cursoId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autenticado');
    const res = await fetch(`${API_BASE}/api/inscripciones/inscribir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ curso_id: cursoId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al inscribirse');
    }
    setCursosInscritos(prev => prev.includes(cursoId) ? prev : [...prev, cursoId]);
  };

  const desinscribirCurso = async (cursoId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autenticado');
    const res = await fetch(`${API_BASE}/api/inscripciones/desinscribir/${cursoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al desinscribirse');
    }
    setCursosInscritos(prev => prev.filter(id => id !== cursoId));
  };

  const estaInscrito = (cursoId) => cursosInscritos.includes(cursoId);

  // Marcar inscrito localmente luego de un pago exitoso (sin llamar al backend)
  const marcarInscrito = (cursoId) => {
    setCursosInscritos(prev => prev.includes(cursoId) ? prev : [...prev, cursoId]);
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      cursosInscritos,
      cargando,
      login,
      logout,
      inscribirCurso,
      desinscribirCurso,
      estaInscrito,
      marcarInscrito,
    }}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

// Función local: actualiza el estado en memoria sin llamar al backend
// (usada después de un pago exitoso, donde el backend ya inscribió al usuario)
export const marcarInscritoLocal = (setCursosInscritos) => (cursoId) => {
  setCursosInscritos(prev => prev.includes(cursoId) ? prev : [...prev, cursoId]);
};