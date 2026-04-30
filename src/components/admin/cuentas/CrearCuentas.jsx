import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderDynamic from '../../layout/UserHeaderDynamic';
import Footer from '../../layout/footerPrincipal';
import { useAuth } from '../../../context/AuthContext';
import { getToken } from '../../../utils/tokenStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TIPO = { ESTUDIANTE: 'estudiante', DOCENTE: 'docente' };

const camposVacios = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  ci_nit: '',
  email: '',
  telefono: '',
  direccion: '',
};

const CrearCuentas = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [tipo, setTipo] = useState(TIPO.ESTUDIANTE);
  const [form, setForm] = useState(camposVacios);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setExito('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setExito('');

    try {
      let url, body;

      if (tipo === TIPO.ESTUDIANTE) {
        url = `${API_BASE}/api/estudiante/registrar`;
        body = { ...form, usuario_id: usuario?.id };
      } else {
        url = `${API_BASE}/api/admin-docente-curso/crear-docente`;
        body = { ...form, password: 'Docente#Ucb2026' };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar cuenta');

      const nombreCompleto = `${form.nombre} ${form.apellido_paterno}`;
      setExito(
        tipo === TIPO.ESTUDIANTE
          ? `Estudiante "${nombreCompleto}" registrado correctamente.`
          : `Docente "${nombreCompleto}" registrado. Contraseña inicial: Docente#Ucb2026`
      );
      setForm(camposVacios);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
      <UserHeaderDynamic />

      <main style={{ flex: 1, padding: '2rem', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <button
          onClick={() => navigate('/admin')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem',
          }}
        >
          ← Volver
        </button>

        <h1 style={{ color: '#003366', marginBottom: '0.25rem' }}>Registrar Nueva Cuenta</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Crea cuentas de estudiante o docente. Los datos quedan registrados de inmediato.
        </p>

        {/* Selector de tipo */}
        <div style={{
          display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
        }}>
          {[
            { value: TIPO.ESTUDIANTE, label: 'Estudiante', icon: '🎓' },
            { value: TIPO.DOCENTE,    label: 'Docente',    icon: '👨‍🏫' },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => { setTipo(value); setForm(camposVacios); setError(''); setExito(''); }}
              style={{
                flex: 1, padding: '0.85rem', borderRadius: 10, cursor: 'pointer',
                border: tipo === value ? '2px solid #003366' : '2px solid #e5e7eb',
                background: tipo === value ? '#eff6ff' : 'white',
                color: tipo === value ? '#003366' : '#6b7280',
                fontWeight: tipo === value ? 700 : 500,
                fontSize: '0.95rem', transition: 'all 0.15s',
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
            padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {exito && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #86efac', color: '#166534',
            padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem',
          }}>
            ✓ {exito}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          background: 'white', borderRadius: 14, padding: '1.5rem 2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            <Campo label="Nombre(s)" name="nombre" value={form.nombre}
              onChange={handleChange} required placeholder="Ej: María" />

            <Campo label="Apellido Paterno" name="apellido_paterno" value={form.apellido_paterno}
              onChange={handleChange} required placeholder="Ej: López" />

            <Campo label="Apellido Materno" name="apellido_materno" value={form.apellido_materno}
              onChange={handleChange} placeholder="Ej: Quispe" />

            <Campo label="C.I. / NIT" name="ci_nit" value={form.ci_nit}
              onChange={handleChange} required placeholder="Número de documento" />

            <div style={{ gridColumn: '1 / -1' }}>
              <Campo label="Correo Institucional (@ucb.edu.bo)" name="email" type="email"
                value={form.email} onChange={handleChange} required
                placeholder={tipo === TIPO.DOCENTE ? 'docente@ucb.edu.bo' : 'estudiante@ucb.edu.bo'} />
            </div>

            <Campo label="Teléfono" name="telefono" value={form.telefono}
              onChange={handleChange} placeholder="70000000" />

            <Campo label="Dirección" name="direccion" value={form.direccion}
              onChange={handleChange} placeholder="Calle, Av, Zona..." />

          </div>

          {tipo === TIPO.DOCENTE && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem 1rem',
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 8, fontSize: '0.82rem', color: '#92400e',
            }}>
              La contraseña inicial del docente será <strong>Docente#Ucb2026</strong>. Se recomienda cambiarla en el primer ingreso.
            </div>
          )}

          {tipo === TIPO.ESTUDIANTE && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem 1rem',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 8, fontSize: '0.82rem', color: '#1e40af',
            }}>
              La contraseña se genera automáticamente como <strong>nombre.apellido.ci_nit</strong> (todo en minúsculas).
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => { setForm(camposVacios); setError(''); setExito(''); }}
              style={{
                padding: '0.7rem 1.5rem', borderRadius: 8,
                border: '1px solid #d1d5db', background: 'white',
                color: '#374151', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={cargando}
              style={{
                padding: '0.7rem 1.8rem', borderRadius: 8, border: 'none',
                background: cargando ? '#93c5fd' : '#003366',
                color: 'white', cursor: cargando ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: '0.95rem',
              }}
            >
              {cargando ? 'Registrando...' : `Registrar ${tipo === TIPO.DOCENTE ? 'Docente' : 'Estudiante'}`}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

const Campo = ({ label, name, value, onChange, required, placeholder, type = 'text' }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
      {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '0.55rem 0.75rem', borderRadius: 7,
        border: '1px solid #d1d5db', fontSize: '0.9rem',
        boxSizing: 'border-box', outline: 'none',
      }}
    />
  </div>
);

export default CrearCuentas;
