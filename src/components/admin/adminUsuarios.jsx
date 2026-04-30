// adminUsuarios.jsx — Gestión de docentes para administradores
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeaderDynamic from '../layout/UserHeaderDynamic';
import Footer from '../layout/footerPrincipal';
import { getToken } from '../../utils/tokenStore';
import './adminUsuarios.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminUsuarios = () => {
    const navigate = useNavigate();
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [docenteEditId, setDocenteEditId] = useState(null);
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
        const token = getToken();
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

    const abrirModalEdicion = (docente) => {
        setError(null);
        setSuccess('');
        setDocenteEditId(docente.id);
        setFormData({
            nombre: docente.nombre || '',
            apellido_paterno: docente.apellido_paterno || '',
            apellido_materno: docente.apellido_materno || '',
            ci_nit: docente.ci_nit || '',
            email: docente.email || '',
            password: 'Docente#Ucb2026',
            telefono: docente.telefono || '',
            direccion: docente.direccion || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess('');
        setSubmitting(true);

        const token = getToken();

        try {
            const payload = {
                nombre: formData.nombre,
                apellido_paterno: formData.apellido_paterno,
                apellido_materno: formData.apellido_materno,
                ci_nit: formData.ci_nit,
                email: formData.email,
                telefono: formData.telefono,
                direccion: formData.direccion
            };

            const res = await fetch(`${API_BASE}/api/admin-docente-curso/docentes/${docenteEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al actualizar el docente');
            }

            setSuccess('Docente actualizado correctamente.');
            setShowEditModal(false);
            setDocenteEditId(null);
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
            fetchDocentes();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-page">
            <UserHeaderDynamic />

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
                                <h1 className="admin-usuarios-title">Listado de Docentes</h1>
                                <p className="admin-usuarios-subtitle">Consulta de docentes registrados en el sistema</p>
                            </div>
                        </div>
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
                                            <button
                                                className="btn-edit"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                onClick={() => abrirModalEdicion(docente)}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Edicion */}
                {showEditModal && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Editar Docente</h2>
                                <button className="close-modal" onClick={() => setShowEditModal(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="docente-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nombre(s)</label>
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Juan" />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido Paterno</label>
                                        <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required placeholder="Ej: Perez" />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido Materno</label>
                                        <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} placeholder="Ej: Quispe" />
                                    </div>
                                    <div className="form-group">
                                        <label>C.I. / NIT</label>
                                        <input type="text" name="ci_nit" value={formData.ci_nit} onChange={handleChange} required placeholder="Numero de documento" />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Correo Institucional (@ucb.edu.bo)</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="juan.perez@ucb.edu.bo" />
                                    </div>
                                    <div className="form-group">
                                        <label>Telefono de Contacto</label>
                                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="70000000" />
                                    </div>
                                    <div className="form-group">
                                        <label>Direccion</label>
                                        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle, Av, Zona..." />
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
                                        <button type="submit" className="btn-submit" disabled={submitting}>
                                            {submitting ? 'Guardando...' : 'Guardar Cambios'}
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
