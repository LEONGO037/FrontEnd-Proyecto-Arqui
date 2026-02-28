// homePrincipal.jsx
import React, { useState, useEffect } from 'react';
import './homePrincipal.css';
import Login from '../../components/login/login'; 

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login'); // 'login' o 'register'

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Función para abrir login en modo específico
  const openLogin = (mode) => {
    setLoginMode(mode);
    setShowLogin(true);
  };

  // Función para cerrar login
  const closeLogin = () => {
    setShowLogin(false);
  };

  // Función cuando el login es exitoso
  const handleLoginSuccess = () => {
    setShowLogin(false);
    console.log('Autenticación exitosa');
  };

  const features = [
    {
      icon: '🔒',
      title: 'Registro Seguro',
      desc: 'Inscripciones mediante protocolos HTTPS para garantizar la seguridad de tus datos personales.',
      color: '#8cc63f'
    },
    {
      icon: '💳',
      title: 'Pagos Electrónicos',
      desc: 'Aceptamos pagos vía QR, transferencia bancaria y tarjetas de débito/crédito.',
      color: '#003366'
    },
    {
      icon: '⚡',
      title: 'Gestión Automática',
      desc: 'Tu registro se sincroniza con la base central institucional inmediatamente después de un pago exitoso.',
      color: '#8cc63f'
    }
  ];

  const stats = [
    { number: '50+', label: 'Cursos Disponibles' },
    { number: '10k+', label: 'Estudiantes' },
    { number: '99%', label: 'Satisfacción' }
  ];

  return (
    <div className="home-container">
      {/* Hero Section con Partículas Animadas */}
      <header className="hero">
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }} />
          ))}
        </div>
        
        <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
          <div className="hero-badge">🏛️ Plataforma Oficial College Nexus</div>
          <h1>X-College Nexus</h1>
          <p className="hero-subtitle">Sistema de Registro y Pago de Cursos Extraacadémicos</p>
          <p className="university-name">College Nexus</p>
          <p className="faculty-name">Facultad Experimental</p>
          
          <div className="hero-cta">
            <button className="btn-primary">
              <span>Ver Cursos Disponibles</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            {/*<button className="btn-secondary">Ver Demo</button>*/}
          </div>
        </div>

        {/* Stats flotantes */}
        <div className="floating-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.2}s` }}>
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Sección de Features con Glassmorphism */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-tag">Características</span>
          <h2>¿Por qué elegir nuestra plataforma?</h2>
          <p className="section-desc">Diseñada específicamente para la comunidad College Nexus</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ '--accent-color': feature.color }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <div className="feature-hover-effect"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Proceso */}
      <section className="process-section">
        <h2>Proceso de Inscripción</h2>
        <div className="process-steps">
          {[
            { step: '01', title: 'Explora', desc: 'Navega entre los cursos disponibles' },
            { step: '02', title: 'Selecciona', desc: 'Elige los cursos de tu interés' },
            { step: '03', title: 'Paga', desc: 'Realiza el pago de forma segura' },
            { step: '04', title: 'Confirma', desc: 'Recibe tu constancia inmediata' }
          ].map((item, index) => (
            <div key={index} className="process-step">
              <div className="step-number">{item.step}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              {index < 3 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* Requisitos con diseño moderno */}
      <section className="info-banner">
        <div className="banner-content">
          <div className="banner-icon">📋</div>
          <div className="banner-text">
            <h3>Información Importante</h3>
            <ul className="modern-list">
              <li>
                <span className="check-icon">✓</span>
                <span>Validación de prerrequisitos académicos en línea</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>Envío automático de facturas y certificados a tu correo</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>Soporte para múltiples inscripciones en una sola transacción</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Listo para comenzar?</h2>
          <p>Únete a miles de estudiantes que ya confían en X-College Nexus</p>
          {/* BOTÓN MODIFICADO: Abre directamente en modo registro */}
          <button 
            className="btn-primary btn-large"
            onClick={() => openLogin('register')}
          >
            Crear Cuenta Gratis
            <span className="btn-shine"></span>
          </button>
        </div>
      </section>

      {/* Modal de Login - Se renderiza condicionalmente */}
      {showLogin && (
        <Login 
          initialMode={loginMode}
          onClose={closeLogin}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default Home;