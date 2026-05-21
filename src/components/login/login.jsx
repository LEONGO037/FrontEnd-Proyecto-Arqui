// login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import loginApi from '../../services/loginApi';
const { login: apiLogin, register: apiRegister, solicitarReset, verificarCodigoReset, resetPassword: apiResetPassword } = loginApi;
import { getRolePath } from '../../utils/roleUtils';
import {
  validateForm,
  validateInstitutionalEmail,
  getPasswordRequirements,
  validateNombre,
} from '../../utils/formValidators';
import './Login.css';

const Login = ({ initialMode = 'login', onClose, onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', apellido_paterno: '', apellido_materno: '', confirmPassword: '' });
  const [nameErrors, setNameErrors] = useState({ nombre: '', apellido_paterno: '', apellido_materno: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Flujo "olvidé contraseña" — 3 pasos: 'email' | 'codigo' | 'nueva'
  const [forgotStep, setForgotStep] = useState(null); // null = no visible
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotDigitos, setForgotDigitos] = useState(['', '', '', '', '', '']);
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotNuevaPass, setForgotNuevaPass] = useState('');
  const [forgotConfirmarPass, setForgotConfirmarPass] = useState('');
  const [forgotMostrar, setForgotMostrar] = useState({ nueva: false, confirmar: false });
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const forgotInputsRef = React.useRef([]);
  const forgotReglas = getPasswordRequirements(forgotNuevaPass);
  const forgotCoinciden = forgotNuevaPass === forgotConfirmarPass;

  const isRegisterMode = !isLogin;
  const emailValue = formData.email || '';
  const emailWasTyped = emailValue.trim().length > 0;
  const isEmailValid = validateInstitutionalEmail(emailValue);
  const passwordRules = getPasswordRequirements(formData.password);
  const passwordWasTyped = (formData.password || '').length > 0;
  const confirmWasTyped = (formData.confirmPassword || '').length > 0;
  const passwordsMatch = formData.password === formData.confirmPassword;
  const passwordScore = passwordRules.checks.filter((rule) => rule.valid).length;

  let passwordStrengthLabel = 'Muy debil';
  let passwordStrengthClass = 'very-weak';
  if (passwordScore >= 5) { passwordStrengthLabel = 'Fuerte'; passwordStrengthClass = 'strong'; }
  else if (passwordScore >= 4) { passwordStrengthLabel = 'Media'; passwordStrengthClass = 'medium'; }
  else if (passwordScore >= 2) { passwordStrengthLabel = 'Debil'; passwordStrengthClass = 'weak'; }

  useEffect(() => { setIsLogin(initialMode === 'login'); }, [initialMode]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    if (name in nameErrors) {
      setNameErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const NAME_LABELS = { nombre: 'El nombre', apellido_paterno: 'El apellido paterno', apellido_materno: 'El apellido materno' };

  const handleNameBlur = (e) => {
    const { name, value } = e.target;
    if (!(name in nameErrors)) return;
    const isOptional = name === 'apellido_materno';
    if (isOptional && !value.trim()) return;
    const err = validateNombre(value, NAME_LABELS[name]);
    setNameErrors((prev) => ({ ...prev, [name]: err || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tipoFormulario = isLogin ? 'login' : 'register';
    const validacion = validateForm(tipoFormulario, formData);
    if (!validacion.isValid) { setError(validacion.firstError); return; }

    if (!isLogin) {
      const errs = {
        nombre: validateNombre(formData.nombre, NAME_LABELS.nombre) || '',
        apellido_paterno: validateNombre(formData.apellido_paterno, NAME_LABELS.apellido_paterno) || '',
        apellido_materno: formData.apellido_materno.trim()
          ? validateNombre(formData.apellido_materno, NAME_LABELS.apellido_materno) || ''
          : '',
      };
      setNameErrors(errs);
      if (Object.values(errs).some(Boolean)) return;
    }

    setIsLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await apiLogin(formData.email, formData.password);

        // Contraseña vencida o debe cambiar (docente nuevo)
        if (res?.debe_cambiar || res?.expirada) {
          if (res.token && res.usuario) {
            authLogin(res.usuario, res.token);
          }
          onClose?.();
          navigate('/cambiar-password', { state: { forzado: true } });
          return;
        }

        if (res?.usuario) {
          authLogin(res.usuario, res.token);
        }
        onClose?.();
        onLoginSuccess?.();
        navigate(getRolePath(res.usuario?.rol));
      } else {
        await apiRegister({
          nombre: formData.nombre,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno,
          email: formData.email, password: formData.password,
        });
        onClose?.();
        navigate(`/verificar-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err) {
      const errorMsg = err?.message || 'Error en autenticación. Intenta de nuevo.';
      if (isLogin && errorMsg.includes('verificar')) {
        onClose?.();
        navigate(`/verificar-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotEmail = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg('');
    try {
      await solicitarReset(forgotEmail);
      setForgotStep('codigo');
      setForgotMsg('');
    } catch {
      setForgotMsg('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotDigito = (index, valor) => {
    const v = valor.replace(/\D/g, '').slice(-1);
    const nuevos = [...forgotDigitos];
    nuevos[index] = v;
    setForgotDigitos(nuevos);
    if (v && index < 5) forgotInputsRef.current[index + 1]?.focus();
  };

  const handleForgotKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotDigitos[index] && index > 0) {
      forgotInputsRef.current[index - 1]?.focus();
    }
  };

  const handleForgotPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setForgotDigitos(pasted.split(''));
      forgotInputsRef.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleForgotCodigo = async (e) => {
    e.preventDefault();
    const codigo = forgotDigitos.join('');
    if (codigo.length !== 6) { setForgotMsg('Ingresa los 6 dígitos del código.'); return; }
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const data = await verificarCodigoReset(forgotEmail, codigo);
      setForgotResetToken(data.token);
      setForgotStep('nueva');
      setForgotMsg('');
    } catch (err) {
      setForgotMsg(err?.message || 'Código inválido o expirado.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotNueva = async (e) => {
    e.preventDefault();
    if (!forgotReglas.allValid) { setForgotMsg('La contraseña no cumple los requisitos de seguridad.'); return; }
    if (!forgotCoinciden) { setForgotMsg('Las contraseñas no coinciden.'); return; }
    setForgotLoading(true);
    setForgotMsg('');
    try {
      await apiResetPassword(forgotResetToken, forgotNuevaPass);
      setForgotStep('ok');
    } catch (err) {
      setForgotMsg(err?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setForgotStep(null);
    setForgotEmail('');
    setForgotDigitos(['', '', '', '', '', '']);
    setForgotResetToken('');
    setForgotNuevaPass('');
    setForgotConfirmarPass('');
    setForgotMostrar({ nueva: false, confirmar: false });
    setForgotMsg('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', nombre: '', apellido_paterno: '', apellido_materno: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
  };

  if (forgotStep) {
    const otpInputSt = {
      flex: 1, minWidth: 0, maxWidth: 44, height: 52, fontSize: '1.5rem',
      fontWeight: 700, textAlign: 'center', borderRadius: 10, outline: 'none',
      transition: 'border-color 0.2s', boxSizing: 'border-box',
      border: `2px solid ${forgotMsg && forgotStep === 'codigo' ? '#ef4444' : '#cbd5e1'}`,
    };

    let stepTitle = '';
    let stepDesc = '';
    if (forgotStep === 'email') { stepTitle = '¿Olvidaste tu contraseña?'; stepDesc = 'Ingresa tu correo y te enviaremos un código de verificación.'; }
    if (forgotStep === 'codigo') { stepTitle = 'Ingresa el código'; stepDesc = `Enviamos un código de 6 dígitos a ${forgotEmail}.`; }
    if (forgotStep === 'nueva') { stepTitle = 'Nueva contraseña'; stepDesc = 'Crea tu nueva contraseña. Debe tener mínimo 12 caracteres.'; }
    if (forgotStep === 'ok') { stepTitle = ''; stepDesc = ''; }

    return (
      <div className="login-overlay" onClick={() => { closeForgot(); onClose?.(); }}>
        <div className="login-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, gridTemplateColumns: '1fr', height: 'auto', maxHeight: 'min(92dvh, calc(100dvh - 2rem))' }}>
          <button className="close-btn" onClick={() => { closeForgot(); onClose?.(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="login-form-section" style={{ width: '100%' }}>

            {forgotStep === 'ok' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>Contraseña restablecida</h3>
                <p style={{ color: '#555', marginBottom: '1.5rem' }}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
                <button className="submit-btn" onClick={() => { closeForgot(); }}>
                  <span>Ir al inicio de sesión</span>
                </button>
              </div>
            ) : (
              <>
                <div className="form-header">
                  <h3>{stepTitle}</h3>
                  <p>{stepDesc}</p>
                </div>

                {forgotMsg && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.875rem', marginBottom: '1rem' }}>
                    ⚠️ {forgotMsg}
                  </div>
                )}

                {forgotStep === 'email' && (
                  <form onSubmit={handleForgotEmail} className="login-form">
                    <div className="form-group">
                      <label>Correo institucional</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <input className="login-input" type="email" placeholder="nombre.apellido@ucb.edu.bo"
                          value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                      </div>
                    </div>
                    <button type="submit" className={`submit-btn ${forgotLoading ? 'loading' : ''}`} disabled={forgotLoading}>
                      {forgotLoading ? <div className="spinner" /> : <span>Enviar código de verificación</span>}
                    </button>
                  </form>
                )}

                {forgotStep === 'codigo' && (
                  <form onSubmit={handleForgotCodigo} className="login-form">
                    <div className="form-group">
                      <label style={{ textAlign: 'center' }}>Código de 6 dígitos</label>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%' }} onPaste={handleForgotPaste}>
                        {forgotDigitos.map((d, i) => (
                          <input
                            key={i}
                            ref={(el) => (forgotInputsRef.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={(e) => handleForgotDigito(i, e.target.value)}
                            onKeyDown={(e) => handleForgotKeyDown(i, e)}
                            style={{ ...otpInputSt, borderColor: d ? '#003366' : (forgotMsg ? '#ef4444' : '#cbd5e1') }}
                          />
                        ))}
                      </div>
                    </div>
                    <button type="submit" className={`submit-btn ${forgotLoading ? 'loading' : ''}`} disabled={forgotLoading}>
                      {forgotLoading ? <div className="spinner" /> : <span>Verificar código</span>}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
                      ¿No recibiste el código?{' '}
                      <button type="button" style={{ background: 'none', border: 'none', color: '#003366', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', fontSize: 'inherit' }}
                        onClick={() => { setForgotStep('email'); setForgotDigitos(['', '', '', '', '', '']); setForgotMsg(''); }}>
                        Reenviar
                      </button>
                    </p>
                  </form>
                )}

                {forgotStep === 'nueva' && (
                  <form onSubmit={handleForgotNueva} className="login-form">
                    <div className="form-group">
                      <label>Nueva contraseña</label>
                      <div className="input-wrapper with-toggle">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input className="login-input" type={forgotMostrar.nueva ? 'text' : 'password'}
                          placeholder="••••••••••••" value={forgotNuevaPass}
                          onChange={(e) => { setForgotNuevaPass(e.target.value); setForgotMsg(''); }} required />
                        <button type="button" className="toggle-password" onClick={() => setForgotMostrar(p => ({ ...p, nueva: !p.nueva }))}>
                          {forgotMostrar.nueva
                            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                        </button>
                      </div>
                      {forgotNuevaPass && (
                        <ul style={{ listStyle: 'none', padding: '0.4rem 0 0', margin: 0, fontSize: '0.78rem' }}>
                          {forgotReglas.checks.map((r) => (
                            <li key={r.key} style={{ color: r.valid ? '#166534' : '#94a3b8', marginBottom: 2 }}>
                              {r.valid ? '✓' : '○'} {r.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Confirmar contraseña</label>
                      <div className="input-wrapper with-toggle">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input className="login-input" type={forgotMostrar.confirmar ? 'text' : 'password'}
                          placeholder="••••••••••••" value={forgotConfirmarPass}
                          onChange={(e) => { setForgotConfirmarPass(e.target.value); setForgotMsg(''); }} required
                          style={{ borderColor: forgotConfirmarPass ? (forgotCoinciden ? '#22c55e' : '#ef4444') : undefined }} />
                        <button type="button" className="toggle-password" onClick={() => setForgotMostrar(p => ({ ...p, confirmar: !p.confirmar }))}>
                          {forgotMostrar.confirmar
                            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                        </button>
                      </div>
                      {forgotConfirmarPass && (
                        <p style={{ fontSize: '0.78rem', color: forgotCoinciden ? '#166534' : '#dc2626', marginTop: 4 }}>
                          {forgotCoinciden ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                        </p>
                      )}
                    </div>
                    <button type="submit" className={`submit-btn ${forgotLoading ? 'loading' : ''}`} disabled={forgotLoading}>
                      {forgotLoading ? <div className="spinner" /> : <span>Restablecer contraseña</span>}
                    </button>
                  </form>
                )}

                <div className="toggle-section">
                  <p className="toggle-text">
                    <button type="button" className="toggle-btn" onClick={closeForgot}>
                      Volver al inicio de sesión
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="login-visual">
          <div className="visual-content">
            <div className="logo-large">X</div>
            <h2>X-College Nexus</h2>
            <p>Tu puerta de acceso a la excelencia académica</p>
            <div className="features-list">
              <div className="feature-item"><span className="feature-icon">🎓</span><span>Cursos Extraacadémicos</span></div>
              <div className="feature-item"><span className="feature-icon">💳</span><span>Pagos Seguros</span></div>
              <div className="feature-item"><span className="feature-icon">📜</span><span>Certificados Digitales</span></div>
            </div>
          </div>
          <div className="decorative-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="form-header">
            <h3>{isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}</h3>
            <p>{isLogin ? 'Ingresa tus credenciales para continuar' : 'Regístrate para comenzar'}</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Nombre(s)</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <input className="login-input" type="text" name="nombre" placeholder="Ej: María"
                      value={formData.nombre} onChange={handleChange} onBlur={handleNameBlur} required />
                  </div>
                  {nameErrors.nombre && <p className="field-hint field-hint-error">{nameErrors.nombre}</p>}
                </div>
                <div className="form-group">
                  <label>Apellido Paterno</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <input className="login-input" type="text" name="apellido_paterno" placeholder="Ej: López"
                      value={formData.apellido_paterno} onChange={handleChange} onBlur={handleNameBlur} required />
                  </div>
                  {nameErrors.apellido_paterno && <p className="field-hint field-hint-error">{nameErrors.apellido_paterno}</p>}
                </div>
                <div className="form-group">
                  <label>Apellido Materno</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <input className="login-input" type="text" name="apellido_materno" placeholder="Ej: Quispe (opcional)"
                      value={formData.apellido_materno} onChange={handleChange} onBlur={handleNameBlur} />
                  </div>
                  {nameErrors.apellido_materno && <p className="field-hint field-hint-error">{nameErrors.apellido_materno}</p>}
                </div>
              </>
            )}

            <div className="form-group">
              <label>Correo institucional</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input className="login-input" type="email" name="email" placeholder="nombre.apellido@ucb.edu.bo"
                  value={formData.email} onChange={handleChange} required />
              </div>
              {isRegisterMode && emailWasTyped && !isEmailValid && (
                <p className="field-hint field-hint-error">Formato esperado: nombre.apellido@ucb.edu.bo</p>
              )}
              {isRegisterMode && emailWasTyped && isEmailValid && (
                <p className="field-hint field-hint-success">Correo institucional válido</p>
              )}
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper with-toggle">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input className="login-input" type={showPassword ? 'text' : 'password'} name="password"
                  placeholder="••••••••" value={formData.password} onChange={handleChange} required
                  minLength={isLogin ? undefined : 12} />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>

              {isRegisterMode && (
                <div className="password-rules" aria-live="polite">
                  <div className="password-strength-wrapper">
                    <div className="password-strength-header">
                      <span>Fuerza</span>
                      <strong className={`password-strength-label ${passwordStrengthClass}`}>
                        {passwordWasTyped ? passwordStrengthLabel : 'Sin evaluar'}
                      </strong>
                    </div>
                    <div className="password-strength-track" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow={passwordScore}>
                      <span className={`password-strength-fill ${passwordStrengthClass}`} style={{ width: `${(passwordScore / 5) * 100}%` }} />
                    </div>
                  </div>
                  <p className="password-rules-title">La contraseña debe cumplir:</p>
                  <ul className="password-rules-list">
                    {passwordRules.checks.map((rule) => (
                      <li key={rule.key} className={`password-rule-item ${rule.valid ? 'ok' : 'pending'}`}>
                        <span className="password-rule-icon">{rule.valid ? '✓' : '○'}</span>
                        <span>{rule.label}</span>
                      </li>
                    ))}
                  </ul>
                  {passwordWasTyped && passwordRules.allValid && (
                    <p className="field-hint field-hint-success">Formato de contraseña cumplido</p>
                  )}
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirmar contraseña</label>
                <div className="input-wrapper with-toggle">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input className="login-input" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                    placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required={!isLogin} />
                  <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
                {confirmWasTyped && !passwordsMatch && <p className="field-hint field-hint-error">Las contraseñas no coinciden</p>}
                {confirmWasTyped && passwordsMatch && <p className="field-hint field-hint-success">Las contraseñas coinciden</p>}
              </div>
            )}

            {isLogin && (
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /><span>Recordarme</span>
                </label>
                <button type="button" className="forgot-password" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#003366', fontSize: '0.875rem', textDecoration: 'underline' }}
                  onClick={() => { setForgotStep('email'); setError(''); }}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <div className="spinner" /> : (
                <>
                  <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                  <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="toggle-section">
            <p className="toggle-text">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button type="button" className="toggle-btn" onClick={toggleMode}>
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
