// Login.jsx
import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = ({ initialMode = 'login', onClose, onLoginSuccess }) => {
  // Usar initialMode para establecer el estado inicial
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Actualizar modo si cambia initialMode (por si se reabre el modal)
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        // login real
        const { login } = await import('../../services/loginApi');
        const res = await login(formData.email, formData.password);
        onLoginSuccess?.(res);
        onClose?.();
      } else {
        // registro real
        if (formData.password !== formData.confirmPassword) {
          alert('Las contraseñas no coinciden');
          setIsLoading(false);
          return;
        }

        const { register, login } = await import('../../services/loginApi');

        // Intentar dividir nombre completo en nombre y apellidos
        const parts = (formData.name || '').trim().split(/\s+/);
        const nombre = parts.shift() || '';
        const apellido_paterno = parts.shift() || '';
        const apellido_materno = parts.join(' ') || '';

        await register({
          nombre,
          apellido_paterno,
          apellido_materno,
          ci_nit: '',
          telefono: '',
          direccion: '',
          email: formData.email,
          password: formData.password
        });

        // Auto-login después de registrar
        const res = await login(formData.email, formData.password);
        onLoginSuccess?.(res);
        onClose?.();
      }
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Error en autenticación';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-container" onClick={(e) => e.stopPropagation()}>
        {/* Botón cerrar */}
        <button className="close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Lado izquierdo - Decorativo */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="logo-large">X</div>
            <h2>X-College Nexus</h2>
            <p>Tu puerta de acceso a la excelencia académica</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🎓</span>
                <span>Cursos Extraacadémicos</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💳</span>
                <span>Pagos Seguros</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📜</span>
                <span>Certificados Digitales</span>
              </div>
            </div>
          </div>
          
          {/* Círculos decorativos animados */}
          <div className="decorative-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="login-form-section">
          <div className="form-header">
            <h3>{isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}</h3>
            <p>{isLogin 
              ? 'Ingresa tus credenciales institucionales para continuar' 
              : 'Regístrate con tu correo UCB para comenzar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Nombre completo</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Correo institucional</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="nombre@ucb.edu.bo"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Recordarme</span>
                </label>
                <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
              </div>
            )}

            <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                  <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Toggle entre login/register */}
          <div className="toggle-section">
            <p className="toggle-text">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button type="button" className="toggle-btn" onClick={toggleMode}>
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          {/* Nota de seguridad */}
          <div className="security-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Conexión segura SSL encriptada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;