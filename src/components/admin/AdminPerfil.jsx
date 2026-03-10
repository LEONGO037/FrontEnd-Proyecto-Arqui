// AdminPerfil.jsx — Perfil simplificado para administradores
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../layout/headerAdmin';
import Footer from '../layout/footerPrincipal';
import './adminMenu.css'; // Reutilizamos estilos de layout

const AdminPerfil = () => {
    const { usuario } = useAuth();

    const iniciales = usuario
        ? usuario.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    return (
        <div className="admin-page">
            <AdminHeader />

            <main className="admin-main">
                <section className="admin-hero" style={{ minHeight: 'auto', padding: '4rem 2rem' }}>
                    <div className="admin-hero-content">
                        <div className="admin-avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}>
                            {iniciales}
                        </div>
                        <div>
                            <h1 className="admin-title">Mi Perfil <span className="admin-name">Administrativo</span></h1>
                            <span className="admin-badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                                Acceso Total al Sistema
                            </span>
                        </div>
                    </div>
                </section>

                <section className="admin-grid-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="admin-card" style={{ cursor: 'default', padding: '2.5rem', textAlign: 'left', display: 'block' }}>
                        <h2 style={{ marginBottom: '2rem', color: '#1e1b4b', borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem' }}>
                            Información de la Cuenta
                        </h2>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Nombre Completo
                                </label>
                                <p style={{ fontSize: '1.2rem', color: '#1f2937', fontWeight: '500', marginTop: '0.25rem' }}>
                                    {usuario?.nombre || 'Administrador'}
                                </p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Correo Electrónico
                                </label>
                                <p style={{ fontSize: '1.2rem', color: '#1f2937', fontWeight: '500', marginTop: '0.25rem' }}>
                                    {usuario?.email || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Rol en el Sistema
                                </label>
                                <p style={{ fontSize: '1.2rem', color: '#4f46e5', fontWeight: '700', marginTop: '0.25rem' }}>
                                    {usuario?.rol || 'ADMINISTRADOR'}
                                </p>
                            </div>

                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.75rem', border: '1px solid #fee2e2' }}>
                                <p style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                                    <strong>Nota de seguridad:</strong> Esta cuenta tiene privilegios administrativos. Asegúrate de cerrar sesión al terminar tus actividades.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AdminPerfil;
