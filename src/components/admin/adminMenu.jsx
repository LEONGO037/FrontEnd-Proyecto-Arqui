// adminMenu.jsx — Panel de administración
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../layout/headerPrincipal';
import Footer from '../layout/footerPrincipal';
import './adminMenu.css';

const cards = [
    {
        id: 'usuarios',
        icon: '👥',
        title: 'Gestión de Usuarios',
        desc: 'Administra estudiantes, docentes y cuentas del sistema.',
        color: '#4f46e5',
        path: '/admin/usuarios',
    },
    {
        id: 'cursos',
        icon: '📚',
        title: 'Cursos',
        desc: 'Crea, edita y organiza el catálogo de cursos extraacadémicos.',
        color: '#0ea5e9',
        path: '/admin/cursos',
    },
    {
        id: 'docentes',
        icon: '🎓',
        title: 'Docentes',
        desc: 'Asigna docentes a cursos y gestiona sus perfiles.',
        color: '#10b981',
        path: '/admin/docentes',
    },
    {
        id: 'inscripciones',
        icon: '📋',
        title: 'Inscripciones',
        desc: 'Revisa y gestiona las inscripciones de los estudiantes.',
        color: '#f59e0b',
        path: '/admin/inscripciones',
    },
    {
        id: 'pagos',
        icon: '💳',
        title: 'Pagos',
        desc: 'Monitorea pagos, comprobantes y estado financiero.',
        color: '#8b5cf6',
        path: '/admin/pagos',
    },
    {
        id: 'reportes',
        icon: '📊',
        title: 'Reportes',
        desc: 'Genera estadísticas y reportes de la plataforma.',
        color: '#ef4444',
        path: '/admin/reportes',
    },
];

const AdminMenu = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const nombreAdmin = usuario?.nombre || 'Administrador';
    const fecha = new Date().toLocaleDateString('es-BO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="admin-page">
            <Header />

            <main className="admin-main">
                {/* Hero de bienvenida */}
                <section className="admin-hero">
                    <div className="admin-hero-content">
                        <div className="admin-avatar">{nombreAdmin.charAt(0).toUpperCase()}</div>
                        <div>
                            <p className="admin-date">{fecha}</p>
                            <h1 className="admin-title">
                                Bienvenido, <span className="admin-name">{nombreAdmin}</span>
                            </h1>
                            <span className="admin-badge">Administrador del Sistema</span>
                        </div>
                    </div>
                    <div className="admin-hero-glow" />
                </section>

                {/* Tarjetas de acceso rápido */}
                <section className="admin-grid-section">
                    <h2 className="admin-section-title">Panel de Control</h2>
                    <div className="admin-card-grid">
                        {cards.map((card) => (
                            <button
                                key={card.id}
                                className="admin-card"
                                onClick={() => navigate(card.path)}
                                style={{ '--card-color': card.color }}
                            >
                                <div className="admin-card-icon">{card.icon}</div>
                                <h3 className="admin-card-title">{card.title}</h3>
                                <p className="admin-card-desc">{card.desc}</p>
                                <div className="admin-card-arrow">→</div>
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AdminMenu;
