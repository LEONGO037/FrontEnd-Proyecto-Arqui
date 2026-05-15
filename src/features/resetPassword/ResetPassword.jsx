import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/loginApi';
import { getPasswordRequirements } from '../../utils/formValidators';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState({ nueva: false, confirmar: false });
  const [estado, setEstado] = useState('idle');
  const [mensaje, setMensaje] = useState('');

  const reglas = getPasswordRequirements(nuevaPassword);
  const coinciden = nuevaPassword === confirmar;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMensaje('Token inválido. Solicita un nuevo enlace de restablecimiento.');
      setEstado('error');
      return;
    }
    if (!reglas.allValid) {
      setMensaje('La contraseña no cumple los requisitos de seguridad.');
      setEstado('error');
      return;
    }
    if (!coinciden) {
      setMensaje('Las contraseñas no coinciden.');
      setEstado('error');
      return;
    }
    setEstado('cargando');
    setMensaje('');
    try {
      const data = await resetPassword(token, nuevaPassword);
      setEstado('ok');
      setMensaje(data.mensaje || 'Contraseña restablecida correctamente.');
    } catch (err) {
      setEstado('error');
      setMensaje(err?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    }
  };

  const card = {
    background: 'white', borderRadius: 16, padding: '2.5rem 2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)', maxWidth: 440, width: '100%',
    fontFamily: 'sans-serif',
  };

  const inputWrap = { position: 'relative', display: 'flex', alignItems: 'center' };
  const inputSt = { width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.8rem', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' };
  const toggleBtn = { position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.8rem' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa', padding: '1.5rem', boxSizing: 'border-box' }}>
      <div style={card}>
        {estado === 'ok' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#166534' }}>Contraseña restablecida</h2>
            <p style={{ color: '#555', marginBottom: '1.5rem' }}>{mensaje}</p>
            <button
              onClick={() => navigate('/')}
              style={{ background: '#003366', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
            >
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ color: '#003366', marginBottom: '0.25rem' }}>Restablecer contraseña</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Ingresa tu nueva contraseña. Debe tener mínimo 12 caracteres.
            </p>

            {mensaje && (
              <div style={{ background: estado === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1.5px solid ${estado === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, color: estado === 'error' ? '#dc2626' : '#166534', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1rem' }}>
                {mensaje}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Nueva contraseña
                </label>
                <div style={inputWrap}>
                  <input
                    type={mostrar.nueva ? 'text' : 'password'}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    style={inputSt}
                  />
                  <button type="button" style={toggleBtn} onClick={() => setMostrar(p => ({ ...p, nueva: !p.nueva }))}>
                    {mostrar.nueva ? 'Ocultar' : 'Ver'}
                  </button>
                </div>

                {nuevaPassword && (
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0', margin: 0, fontSize: '0.8rem' }}>
                    {reglas.checks.map((r) => (
                      <li key={r.key} style={{ color: r.valid ? '#166534' : '#94a3b8', marginBottom: 2 }}>
                        {r.valid ? '✓' : '○'} {r.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Confirmar contraseña
                </label>
                <div style={inputWrap}>
                  <input
                    type={mostrar.confirmar ? 'text' : 'password'}
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    style={{ ...inputSt, borderColor: confirmar ? (coinciden ? '#22c55e' : '#ef4444') : '#cbd5e1' }}
                  />
                  <button type="button" style={toggleBtn} onClick={() => setMostrar(p => ({ ...p, confirmar: !p.confirmar }))}>
                    {mostrar.confirmar ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                {confirmar && (
                  <p style={{ fontSize: '0.8rem', color: coinciden ? '#166534' : '#dc2626', marginTop: 4 }}>
                    {coinciden ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={estado === 'cargando'}
                style={{ background: '#003366', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem', cursor: estado === 'cargando' ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '1rem', width: '100%', opacity: estado === 'cargando' ? 0.7 : 1 }}
              >
                {estado === 'cargando' ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
              <button type="button" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
                Volver al inicio
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
