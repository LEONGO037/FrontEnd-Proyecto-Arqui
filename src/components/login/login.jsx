import React, { useState, useRef } from "react";
import "./login.css";

/* ──────────────────────────────────────────────────────
   Íconos SVG inline (sin dependencias externas)
────────────────────────────────────────────────────── */
const Icon = {
  BookOpen: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
};

/* ──────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
────────────────────────────────────────────────────── */
const Login = ({ onClose, onLoginSuccess, initialMode = "login" }) => {
  const [mode, setMode]             = useState(initialMode); // "login" | "register"
  const [showPass, setShowPass]     = useState(false);
  const [showPass2, setShowPass2]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const overlayRef                  = useRef(null);

  /* Form state */
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "", confirm: "",
  });

  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose?.(); };
  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setError(""); };

  /* ── LOGIN ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Por favor completa todos los campos."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://localhost:3000/api/autenticacion/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Credenciales incorrectas");
      localStorage.setItem("token",   data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      onLoginSuccess?.(data);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.email || !form.password || !form.confirm) {
      setError("Por favor completa todos los campos."); return;
    }
    if (form.password !== form.confirm) { setError("Las contraseñas no coinciden."); return; }
    if (form.password.length < 8)       { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://localhost:3000/api/autenticacion/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:            form.nombre,
          apellido_paterno:  form.apellido,
          email:             form.email,
          password:          form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrarse");
      setMode("login");
      setError("");
      setForm((p) => ({ ...p, password: "", confirm: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lv-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="lv-card" role="dialog" aria-modal="true">

        {/* ════════════ PANEL IZQUIERDO ════════════ */}
        <div className="lv-left">
          <div className="lv-grid" />

          {/* Logo */}
          <div className="lv-logo">
            <div className="lv-logo__mark">
              <Icon.BookOpen />
            </div>
            <div>
              <div className="lv-logo__text">X-College Nexus</div>
              <div className="lv-logo__sub">Plataforma Académica</div>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="lv-left__body">
            <h2 className="lv-left__headline">
              Tu acceso a la<br /><span>excelencia académica</span>
            </h2>
            <p className="lv-left__desc">
              Regístrate en cursos extraacadémicos, gestiona tus pagos y obtén tus certificados en un solo lugar.
            </p>
            <div className="lv-features">
              <div className="lv-feature">
                <div className="lv-feature__icon"><Icon.BookOpen /></div>
                <span className="lv-feature__label">Cursos Extraacadémicos</span>
              </div>
              <div className="lv-feature">
                <div className="lv-feature__icon"><Icon.CreditCard /></div>
                <span className="lv-feature__label">Pagos Seguros con PayPal</span>
              </div>
              <div className="lv-feature">
                <div className="lv-feature__icon"><Icon.Award /></div>
                <span className="lv-feature__label">Certificados Digitales</span>
              </div>
            </div>
          </div>

          <div className="lv-left__footer">College Nexus · Facultad Experimental</div>
        </div>

        {/* ════════════ PANEL DERECHO ════════════ */}
        <div className="lv-right">
          {/* Cerrar */}
          <button className="lv-close" onClick={onClose} aria-label="Cerrar">
            <Icon.Close />
          </button>

          {/* Tabs */}
          <div className="lv-tabs" role="tablist">
            <button
              className={`lv-tab ${mode === "login" ? "lv-tab--active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
              role="tab"
            >
              Iniciar Sesión
            </button>
            <button
              className={`lv-tab ${mode === "register" ? "lv-tab--active" : ""}`}
              onClick={() => { setMode("register"); setError(""); }}
              role="tab"
            >
              Registrarse
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} noValidate>
              <h2 className="lv-form__title">Bienvenido de vuelta</h2>
              <p className="lv-form__sub">Ingresa tus credenciales para continuar</p>

              {error && (
                <div className="lv-error">
                  <Icon.Alert />
                  <span>{error}</span>
                </div>
              )}

              <div className="lv-group">
                <label className="lv-label" htmlFor="login-email">Correo institucional</label>
                <div className="lv-field">
                  <div className="lv-field__icon"><Icon.Mail /></div>
                  <input
                    id="login-email"
                    className="lv-input"
                    type="email"
                    placeholder="usuario@ucb.edu.bo"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="lv-group">
                <label className="lv-label" htmlFor="login-pass">Contraseña</label>
                <div className="lv-field">
                  <div className="lv-field__icon"><Icon.Lock /></div>
                  <input
                    id="login-pass"
                    className="lv-input"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set("password")}
                    autoComplete="current-password"
                    style={{ paddingRight: "3rem" }}
                  />
                  <button
                    type="button"
                    className="lv-field__toggle"
                    onClick={() => setShowPass((p) => !p)}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
              </div>

              <div className="lv-extras">
                <label className="lv-remember">
                  <input type="checkbox" />
                  Recordarme
                </label>
                <button type="button" className="lv-forgot">¿Olvidaste tu contraseña?</button>
              </div>

              <button className="lv-submit" type="submit" disabled={loading}>
                {loading ? (
                  <><div className="lv-submit__spinner" /> Iniciando sesión...</>
                ) : (
                  <>Iniciar Sesión <Icon.ArrowRight /></>
                )}
              </button>

              <p className="lv-footer-link">
                ¿No tienes cuenta?{" "}
                <button type="button" onClick={() => { setMode("register"); setError(""); }}>
                  Regístrate aquí
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} noValidate>
              <h2 className="lv-form__title">Crear cuenta</h2>
              <p className="lv-form__sub">Únete a la plataforma en segundos</p>

              {error && (
                <div className="lv-error">
                  <Icon.Alert />
                  <span>{error}</span>
                </div>
              )}

              <div className="lv-group lv-group--row">
                <div>
                  <label className="lv-label" htmlFor="reg-nombre">Nombre</label>
                  <div className="lv-field">
                    <div className="lv-field__icon"><Icon.User /></div>
                    <input
                      id="reg-nombre"
                      className="lv-input"
                      type="text"
                      placeholder="Juan"
                      value={form.nombre}
                      onChange={set("nombre")}
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="lv-label" htmlFor="reg-apellido">Apellido</label>
                  <div className="lv-field">
                    <div className="lv-field__icon"><Icon.User /></div>
                    <input
                      id="reg-apellido"
                      className="lv-input"
                      type="text"
                      placeholder="Pérez"
                      value={form.apellido}
                      onChange={set("apellido")}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              <div className="lv-group">
                <label className="lv-label" htmlFor="reg-email">Correo institucional</label>
                <div className="lv-field">
                  <div className="lv-field__icon"><Icon.Mail /></div>
                  <input
                    id="reg-email"
                    className="lv-input"
                    type="email"
                    placeholder="usuario@ucb.edu.bo"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="lv-group">
                <label className="lv-label" htmlFor="reg-pass">Contraseña</label>
                <div className="lv-field">
                  <div className="lv-field__icon"><Icon.Lock /></div>
                  <input
                    id="reg-pass"
                    className="lv-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={set("password")}
                    autoComplete="new-password"
                    style={{ paddingRight: "3rem" }}
                  />
                  <button
                    type="button"
                    className="lv-field__toggle"
                    onClick={() => setShowPass((p) => !p)}
                    aria-label={showPass ? "Ocultar" : "Mostrar"}
                  >
                    {showPass ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
              </div>

              <div className="lv-group">
                <label className="lv-label" htmlFor="reg-confirm">Confirmar contraseña</label>
                <div className="lv-field">
                  <div className="lv-field__icon"><Icon.Lock /></div>
                  <input
                    id="reg-confirm"
                    className="lv-input"
                    type={showPass2 ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={form.confirm}
                    onChange={set("confirm")}
                    autoComplete="new-password"
                    style={{ paddingRight: "3rem" }}
                  />
                  <button
                    type="button"
                    className="lv-field__toggle"
                    onClick={() => setShowPass2((p) => !p)}
                    aria-label={showPass2 ? "Ocultar" : "Mostrar"}
                  >
                    {showPass2 ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
              </div>

              <button className="lv-submit" type="submit" disabled={loading} style={{ marginTop: ".375rem" }}>
                {loading ? (
                  <><div className="lv-submit__spinner" /> Creando cuenta...</>
                ) : (
                  <>Crear cuenta <Icon.ArrowRight /></>
                )}
              </button>

              <p className="lv-footer-link">
                ¿Ya tienes cuenta?{" "}
                <button type="button" onClick={() => { setMode("login"); setError(""); }}>
                  Inicia sesión
                </button>
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;