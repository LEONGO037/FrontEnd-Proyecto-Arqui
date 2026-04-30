import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verificarCodigo } from '../../services/loginApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const VerificarEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [digitos, setDigitos] = useState(['', '', '', '', '', '']);
  const [estado, setEstado] = useState('idle'); // 'idle' | 'cargando' | 'ok' | 'error'
  const [mensaje, setMensaje] = useState('');
  const [reenvioMsg, setReenvioMsg] = useState('');
  const inputsRef = useRef([]);

  const handleDigito = (index, valor) => {
    const v = valor.replace(/\D/g, '').slice(-1);
    const nuevos = [...digitos];
    nuevos[index] = v;
    setDigitos(nuevos);
    if (v && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigitos(pasted.split(''));
      inputsRef.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const codigo = digitos.join('');
    if (codigo.length !== 6) {
      setMensaje('Ingresa los 6 dígitos del código.');
      setEstado('error');
      return;
    }
    if (!email) {
      setMensaje('Correo electrónico requerido.');
      setEstado('error');
      return;
    }
    setEstado('cargando');
    setMensaje('');
    try {
      const data = await verificarCodigo(email, codigo);
      setEstado('ok');
      setMensaje(data.mensaje || 'Correo verificado. Ya puedes iniciar sesión.');
    } catch (err) {
      setEstado('error');
      setMensaje(err?.message || 'Código inválido o expirado. Intenta de nuevo.');
    }
  };

  const handleReenviar = async () => {
    if (!email) { setReenvioMsg('Ingresa tu correo primero.'); return; }
    try {
      await fetch(`${API_BASE}/api/autenticacion/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _reenvio: true, email }),
      });
    } catch { /* ignore */ }
    setReenvioMsg('Si el correo existe en el sistema, se reenvió el código.');
    setTimeout(() => setReenvioMsg(''), 5000);
  };

  const card = {
    background: 'white', borderRadius: 16, padding: '2.5rem 2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)', maxWidth: 420, width: '100%',
    textAlign: 'center', fontFamily: 'sans-serif',
  };

  const inputStyle = {
    width: 44, height: 52, fontSize: '1.5rem', fontWeight: 700, textAlign: 'center',
    border: '2px solid #cbd5e1', borderRadius: 10, outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
      <div style={card}>
        {estado === 'ok' ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#166534', marginBottom: '0.5rem' }}>¡Correo verificado!</h2>
            <p style={{ color: '#555', marginBottom: '1.5rem' }}>{mensaje}</p>
            <button
              onClick={() => navigate('/')}
              style={{ background: '#003366', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
            >
              Ir al inicio de sesión
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
            <h2 style={{ color: '#003366', marginBottom: '0.25rem' }}>Verifica tu correo</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Ingresa el código de <strong>6 dígitos</strong> que enviamos a tu correo electrónico.
            </p>

            <form onSubmit={handleSubmit}>
              {!emailParam && (
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="email"
                    placeholder="Tu correo institucional"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: '1.25rem' }} onPaste={handlePaste}>
                {digitos.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigito(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    style={{
                      ...inputStyle,
                      borderColor: estado === 'error' ? '#ef4444' : d ? '#003366' : '#cbd5e1',
                    }}
                  />
                ))}
              </div>

              {mensaje && (
                <p style={{ color: estado === 'error' ? '#dc2626' : '#166534', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {estado === 'error' ? '⚠️ ' : '✓ '}{mensaje}
                </p>
              )}

              <button
                type="submit"
                disabled={estado === 'cargando'}
                style={{ background: '#003366', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', width: '100%', opacity: estado === 'cargando' ? 0.7 : 1 }}
              >
                {estado === 'cargando' ? 'Verificando...' : 'Verificar código'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
              ¿No recibiste el código?{' '}
              <button type="button" onClick={handleReenviar} style={{ background: 'none', border: 'none', color: '#003366', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                Reenviar
              </button>
              {reenvioMsg && <p style={{ color: '#166534', marginTop: 4 }}>{reenvioMsg}</p>}
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerificarEmail;
