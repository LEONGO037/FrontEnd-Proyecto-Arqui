import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { changePassword } from '../../services/loginApi';
import { getPasswordRequirements } from '../../utils/formValidators';
import './CambiarPasswordPanel.css';

const CambiarPasswordPanel = ({
  titulo = 'Cambiar contrasena',
  buttonLabel = 'Cambiar contrasena',
  renderTrigger = true,
  open: openProp,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: '',
  });
  const [mostrar, setMostrar] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isControlled = typeof openProp === 'boolean';
  const open = isControlled ? openProp : internalOpen;

  const setOpen = (next) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    if (onOpenChange) {
      onOpenChange(next);
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const reglas = useMemo(
    () => getPasswordRequirements(formData.nuevaPassword),
    [formData.nuevaPassword]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const toggle = (key) => {
    setMostrar((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openModal = () => {
    setOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.passwordActual || !formData.nuevaPassword || !formData.confirmarPassword) {
      setError('Completa todos los campos.');
      return;
    }

    if (formData.nuevaPassword !== formData.confirmarPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    if (!reglas.allValid) {
      setError('La nueva contrasena no cumple los requisitos de seguridad.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(formData.passwordActual, formData.nuevaPassword);
      setSuccess('Contrasena actualizada correctamente.');
      setFormData({ passwordActual: '', nuevaPassword: '', confirmarPassword: '' });
      setMostrar({ actual: false, nueva: false, confirmar: false });
      setTimeout(() => setOpen(false), 800);
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la contrasena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {renderTrigger && (
        <button type="button" className="pwd-open-btn" onClick={openModal}>
          {buttonLabel}
        </button>
      )}

      {open && typeof document !== 'undefined' && createPortal(
        <div className="pwd-modal-overlay" onClick={closeModal}>
          <section className="pwd-panel" onClick={(e) => e.stopPropagation()}>
            <div className="pwd-header">
              <h3>{titulo}</h3>
              <button type="button" className="pwd-close-btn" onClick={closeModal}>
                X
              </button>
            </div>

            {error && <p className="pwd-msg pwd-error">{error}</p>}
            {success && <p className="pwd-msg pwd-success">{success}</p>}

            <form onSubmit={handleSubmit} className="pwd-form">
              <label>
                Contrasena actual
                <div className="pwd-input-wrap">
                  <input
                    type={mostrar.actual ? 'text' : 'password'}
                    name="passwordActual"
                    value={formData.passwordActual}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={() => toggle('actual')}>Ver</button>
                </div>
              </label>

              <label>
                Nueva contrasena
                <div className="pwd-input-wrap">
                  <input
                    type={mostrar.nueva ? 'text' : 'password'}
                    name="nuevaPassword"
                    value={formData.nuevaPassword}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={() => toggle('nueva')}>Ver</button>
                </div>
              </label>

              <label>
                Confirmar nueva contrasena
                <div className="pwd-input-wrap">
                  <input
                    type={mostrar.confirmar ? 'text' : 'password'}
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={() => toggle('confirmar')}>Ver</button>
                </div>
              </label>

              <ul className="pwd-rules">
                {reglas.checks.map((rule) => (
                  <li key={rule.key} className={rule.valid ? 'ok' : ''}>
                    {rule.valid ? 'OK' : '-'} {rule.label}
                  </li>
                ))}
              </ul>

              <button type="submit" disabled={loading} className="pwd-submit">
                {loading ? 'Actualizando...' : 'Actualizar contrasena'}
              </button>
            </form>
          </section>
        </div>,
        document.body
      )}
    </>
  );
};

export default CambiarPasswordPanel;
