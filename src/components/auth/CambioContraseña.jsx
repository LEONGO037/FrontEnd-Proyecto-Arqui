import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CambioContraseña.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CambioContraseña = () => {
  const { usuario } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingDefault, setCheckingDefault] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirmar: false });

  const [formData, setFormData] = useState({
    password_actual: '',
    nueva_password: '',
    confirmar_password: ''
  });

  useEffect(() => {
    if (usuario && usuario.rol === 'DOCENTE') {
      verificarPasswordDefault();
    } else {
      setCheckingDefault(false);
    }
  }, [usuario]);

  const verificarPasswordDefault = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/docente-password/${usuario.id}/es-default`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al verificar contraseña por defecto');

      const data = await res.json();
      if (data.es_password_default) {
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDefault(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setValidationErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    if (formData.nueva_password !== formData.confirmar_password) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/docente-password/${usuario.id}/cambiar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          password_actual: formData.password_actual,
          nueva_password: formData.nueva_password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al cambiar la contraseña');
        if (data.errores) setValidationErrors(data.errores);
        return;
      }

      // Éxito
      setShowModal(false);
      // Podríamos mostrar un alert de éxito o un toast aquí
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (checkingDefault || !showModal) return null;

  return (
    <div className="password-modal-overlay">
      <div className="password-modal-container">
        <div className="password-modal-header">
          <div className="modal-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="32" height="32">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2>Cambio Obligatorio</h2>
          <p>Para proteger tu cuenta, es necesario que personalices tu contraseña antes de continuar.</p>
        </div>

        {error && (
          <div className="error-container">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="error-content">
              <span className="error-text">{error}</span>
              {validationErrors.length > 0 && (
                <ul className="error-list">
                  {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-field">
            <label>Contraseña Actual</label>
            <div className="input-container">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPass.actual ? "text" : "password"}
                name="password_actual"
                className="password-input"
                placeholder="Ingresa la contraseña por defecto"
                value={formData.password_actual}
                onChange={handleChange}
                required
              />
              <button type="button" className="toggle-visibility" onClick={() => toggleVisibility('actual')}>
                {showPass.actual ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>Nueva Contraseña</label>
            <div className="input-container">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              <input
                type={showPass.nueva ? "text" : "password"}
                name="nueva_password"
                className="password-input"
                placeholder="Min. 8 caracteres"
                value={formData.nueva_password}
                onChange={handleChange}
                required
              />
              <button type="button" className="toggle-visibility" onClick={() => toggleVisibility('nueva')}>
                {showPass.nueva ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>Confirmar Nueva Contraseña</label>
            <div className="input-container">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <input
                type={showPass.confirmar ? "text" : "password"}
                name="confirmar_password"
                className="password-input"
                placeholder="Repite tu nueva contraseña"
                value={formData.confirmar_password}
                onChange={handleChange}
                required
              />
              <button type="button" className="toggle-visibility" onClick={() => toggleVisibility('confirmar')}>
                {showPass.confirmar ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="requirements-note">
            <strong>Requisitos de seguridad:</strong>
            <ul>
              <li>Mínimo 8 caracteres</li>
              <li>Una mayúscula</li>
              <li>Una minúscula</li>
              <li>Un número</li>
              <li>Un carácter especial</li>
            </ul>
          </div>

          <button type="submit" className="submit-password-btn" disabled={loading}>
            {loading ? <div className="spinner-small" /> : 'Actualizar y Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CambioContraseña;
