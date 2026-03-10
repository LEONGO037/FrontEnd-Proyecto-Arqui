// adminUsuarios.jsx — Gestión de docentes para administradores
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../layout/headerAdmin';
import Footer from '../layout/footerPrincipal';
import './adminUsuarios.css';

const API_BASE = 'http://localhost:3000';

const AdminUsuarios = () => {
    const navigate = useNavigate();
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Estado para el modal de registro
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci_nit: '',
        email: '',
        password: 'Docente#Ucb2026',
        telefono: '',
        direccion: ''
    });

    const fetchDocentes = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/api/admin-docente-curso/docentes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al cargar la lista de docentes');
            const data = await res.json();
            setDocentes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocentes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess('');
        setSubmitting(true);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/api/admin-docente-curso/crear-docente`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al registrar el docente');
            }

            setSuccess('¡Docente registrado exitosamente!');
            setShowModal(false);
            setFormData({
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                ci_nit: '',
                email: '',
                password: 'Docente#Ucb2026',
                telefono: '',
                direccion: ''
            });
            fetchDocentes(); // Recargar lista
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-page">
            <AdminHeader />

            <main className="admin-main">
                <div className="admin-usuarios-container">
                    <div className="admin-usuarios-header">
                        <div className="header-title-section">
                            <button className="btn-back-circle" onClick={() => navigate('/admin')} title="Regresar al Menú">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="admin-usuarios-title">Gestión de Docentes</h1>
                                <p className="admin-usuarios-subtitle">Manejo de la nómina de docentes del sistema</p>
                            </div>
                        </div>
                        <button className="btn-add-docente" onClick={() => setShowModal(true)}>
                            <span>+ Registrar Docente</span>
                        </button>
                    </div>

                    {error && <div className="admin-error-box" style={{ marginBottom: '1.5rem' }}>{error}</div>}
                    {success && <div className="admin-success-box" style={{ marginBottom: '1.5rem' }}>{success}</div>}

                    <div className="usuarios-table-container">
                        <table className="usuarios-table">
                            <thead>
                                <tr>
                                    <th>Docente</th>
                                    <th>C.I. / NIT</th>
                                    <th>Correo Electrónico</th>
                                    <th>Teléfono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Cargando docentes...</td></tr>
                                ) : docentes.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No hay docentes registrados.</td></tr>
                                ) : docentes.map(docente => (
                                    <tr key={docente.id}>
                                        <td>
                                            <div className="docente-avatar-cell">
                                                <div className="mini-avatar">{docente.nombre.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700 }}>{`${docente.nombre} ${docente.apellido_paterno} ${docente.apellido_materno || ''}`}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {docente.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{docente.ci_nit}</td>
                                        <td>{docente.email}</td>
                                        <td>{docente.telefono || 'Sin teléfono'}</td>
                                        <td>
                                            <button className="btn-edit" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Editar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Registro */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Registrar Nuevo Docente</h2>
                                <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="docente-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nombre(s)</label>
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Juan" />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido Paterno</label>
                                        <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required placeholder="Ej: Pérez" />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido Materno</label>
                                        <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} placeholder="Ej: Quispe" />
                                    </div>
                                    <div className="form-group">
                                        <label>C.I. / NIT</label>
                                        <input type="text" name="ci_nit" value={formData.ci_nit} onChange={handleChange} required placeholder="Número de documento" />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Correo Institucional (@ucb.edu.bo)</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="juan.perez@ucb.edu.bo" />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono de Contacto</label>
                                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="70000000" />
                                    </div>
                                    <div className="form-group">
                                        <label>Dirección</label>
                                        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle, Av, Zona..." />
                                    </div>

                                    <div className="full-width" style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                                        <strong>ℹ️ Seguridad:</strong> La contraseña predeterminada será <code>Docente#Ucb2026</code>. Se recomienda al docente cambiarla en su primer ingreso.
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                        <button type="submit" className="btn-submit" disabled={submitting}>
                                            {submitting ? 'Registrando...' : 'Registrar Docente'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default AdminUsuarios;
