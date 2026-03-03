// homePrincipal.jsx — Refactorizado completamente
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './homePrincipal.css';
import Login from '../../components/login/login';

const Home = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const openLogin = (mode) => { setLoginMode(mode); setShowLogin(true); };

  return (
    <div className="home-wrap">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="home-hero">
        {/* Fondo decorativo */}
        <div className="hero-bg">
          <div className="hero-orb hero-orb--1" />
          <div className="hero-orb hero-orb--2" />
          <div className="hero-orb hero-orb--3" />
          <div className="hero-grid" />
        </div>

        {/* Contenido centrado */}
        <div className={`hero-center ${visible ? 'hero-center--in' : ''}`}>
          <span className="hero-pill">🏛️ Plataforma Oficial College Nexus</span>

          <h1 className="hero-title">
            X-College<br />
            <span className="hero-title--accent">Nexus</span>
          </h1>

          <p className="hero-sub">
            Sistema de Registro y Pago de Cursos Extraacadémicos
          </p>
          <p className="hero-inst">College Nexus · Facultad Experimental</p>

          <div className="hero-btns">
            <button
              className="btn-cta btn-cta--primary"
              onClick={() => navigate('/cursos')}
            >
              Ver Cursos Disponibles
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              className="btn-cta btn-cta--secondary"
              onClick={() => openLogin('register')}
            >
              Crear Cuenta Gratis
            </button>
          </div>
        </div>

        {/* Stats — dentro del hero, debajo del contenido */}
        <div className={`hero-stats ${visible ? 'hero-stats--in' : ''}`}>
          {[
            { n: '50+',  l: 'Cursos' },
            { n: '10k+', l: 'Estudiantes' },
            { n: '99%',  l: 'Satisfacción' },
          ].map(({ n, l }, i) => (
            <div key={i} className="hero-stat" style={{ animationDelay: `${0.4 + i * 0.15}s` }}>
              <span className="hero-stat__num">{n}</span>
              <span className="hero-stat__lbl">{l}</span>
            </div>
          ))}
        </div>

        {/* Separador wave */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
            <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0Z" fill="#f5f7fa" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="home-features">
        <div className="section-label">Características</div>
        <h2 className="section-title">¿Por qué elegir nuestra plataforma?</h2>
        <p className="section-sub">Diseñada específicamente para la comunidad College Nexus</p>

        <div className="features-grid">
          {[
            { emoji: '🔒', title: 'Registro Seguro',       desc: 'Inscripciones mediante protocolos HTTPS para garantizar la seguridad de tus datos personales.', color: '#8cc63f' },
            { emoji: '💳', title: 'Pagos Electrónicos',    desc: 'Aceptamos pagos vía QR, transferencia bancaria y tarjetas de débito/crédito con PayPal.', color: '#003366' },
            { emoji: '⚡', title: 'Gestión Automática',    desc: 'Tu registro se sincroniza con la base central institucional inmediatamente después del pago.', color: '#0066cc' },
          ].map(({ emoji, title, desc, color }, i) => (
            <div key={i} className="feat-card" style={{ '--c': color }}>
              <div className="feat-card__icon">{emoji}</div>
              <h3 className="feat-card__title">{title}</h3>
              <p className="feat-card__desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROCESO
      ══════════════════════════════════════════ */}
      <section className="home-process">
        <h2 className="section-title section-title--light">Proceso de Inscripción</h2>

        <div className="process-grid">
          {[
            { n: '01', t: 'Explora',   d: 'Navega entre los cursos disponibles' },
            { n: '02', t: 'Selecciona',d: 'Elige los cursos de tu interés' },
            { n: '03', t: 'Paga',      d: 'Realiza el pago de forma segura' },
            { n: '04', t: 'Confirma',  d: 'Recibe tu constancia inmediata' },
          ].map(({ n, t, d }, i) => (
            <div key={i} className="proc-step">
              <div className="proc-step__num">{n}</div>
              <h4 className="proc-step__title">{t}</h4>
              <p className="proc-step__desc">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INFO BANNER
      ══════════════════════════════════════════ */}
      <section className="home-info">
        <div className="info-card">
          <div className="info-card__emoji">📋</div>
          <div className="info-card__body">
            <h3>Información Importante</h3>
            <ul>
              <li><span className="check">✓</span>Validación de prerrequisitos académicos en línea</li>
              <li><span className="check">✓</span>Envío automático de facturas y certificados a tu correo</li>
              <li><span className="check">✓</span>Soporte para múltiples inscripciones en una sola transacción</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="home-cta">
        <h2>¿Listo para comenzar?</h2>
        <p>Únete a miles de estudiantes que ya confían en X-College Nexus</p>
        <button
          className="btn-cta btn-cta--primary btn-cta--lg"
          onClick={() => openLogin('register')}
        >
          Crear Cuenta Gratis
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {showLogin && (
        <Login
          initialMode={loginMode}
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};

export default Home;