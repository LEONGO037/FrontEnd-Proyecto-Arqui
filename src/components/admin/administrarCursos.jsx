// administrarCursos.jsx — Gestión de cursos para administradores
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../layout/headerAdmin';
import Footer from '../layout/footerPrincipal';
import { validateForm } from '../../utils/formValidators';
import './administrarCursos.css';

const API_BASE = 'http://localhost:3000';

const AdministrarCursos = () => {
    const navigate = useNavigate();
    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');

    const [mostrarModal, setMostrarModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        costo: '',
        cupo_maximo: '',
        minimo_estudiantes: '',
        prerrequisitos: []
    });

    const fetchCursos = async () => {
        setCargando(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_BASE}/api/cursos/sin-docente`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error al cargar cursos');

            const data = await res.json();
            setCursos(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchCursos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePrerrequisitoToggle = (id) => {
        setFormData(prev => {
            const current = prev.prerrequisitos;

            if (current.includes(id)) {
                return { ...prev, prerrequisitos: current.filter(pid => pid !== id) };
            } else {
                return { ...prev, prerrequisitos: [...current, id] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMensajeExito('');

        const validacion = validateForm('crearCurso', formData);
        if (!validacion.isValid) {
            setError(validacion.firstError);
            return;
        }

        const payload = {
            ...formData,
            costo: Number(formData.costo),
            cupo_maximo: Number(formData.cupo_maximo),
            minimo_estudiantes: formData.minimo_estudiantes ? Number(formData.minimo_estudiantes) : 1
        };

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_BASE}/api/cursos/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al crear el curso');
            }

            setMensajeExito('¡Curso creado exitosamente!');
            setMostrarModal(false);

            setFormData({
                nombre: '',
                descripcion: '',
                costo: '',
                cupo_maximo: '',
                minimo_estudiantes: '',
                prerrequisitos: []
            });

            fetchCursos();

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="admin-cursos-page">
            <AdminHeader />

            <main className="admin-cursos-main">

                <div className="admin-cursos-header">
                    <div className="header-title-section">

                        <button
                            className="btn-back-circle"
                            onClick={() => navigate('/admin')}
                            title="Regresar al Menú"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>

                        <div>
                            <h1 className="admin-cursos-title">Gestión de Cursos</h1>
                            <p className="admin-cursos-subtitle">
                                Administra el catálogo de cursos extraacadémicos
                            </p>
                        </div>

                    </div>

                    <div className="header-actions">
                        <button
                            className="btn-add-curso"
                            onClick={() => setMostrarModal(true)}
                        >
                            <span>+ Nuevo Curso</span>
                        </button>
                    </div>
                </div>

                {error && <div className="admin-error-box">{error}</div>}
                {mensajeExito && <div className="admin-success-box">{mensajeExito}</div>}

                <div className="cursos-table-container">
                    <table className="cursos-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Costo</th>
                                <th>Cupo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        Cargando cursos...
                                    </td>
                                </tr>
                            ) : cursos.map(curso => (
                                <tr key={curso.id}>
                                    <td>{curso.id}</td>
                                    <td className="font-bold">{curso.nombre}</td>
                                    <td className="curso-table-desc">{curso.descripcion}</td>
                                    <td>Bs. {curso.costo}</td>
                                    <td>{curso.cupo_maximo}</td>

                                    <td className="table-actions-cell">
                                        <button
                                            className="btn-assign-teacher"
                                            onClick={() => navigate(`/admin/asignar-docente/${curso.id}`)}
                                            title="Asignar Docente"
                                        >
                                            Asignar
                                        </button>

                                        <button className="btn-edit">
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

                {mostrarModal && (
                    <div
                        className="modal-overlay"
                        onClick={() => setMostrarModal(false)}
                    >

                        <div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                        >

                            <div className="modal-header">
                                <h2>Crear Nuevo Curso</h2>

                                <button
                                    className="close-modal"
                                    onClick={() => setMostrarModal(false)}
                                >
                                    &times;
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="curso-form"
                            >

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>Nombre del Curso</label>

                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                            placeholder="Ej: Arquitectura de Software"
                                        />
                                    </div>

                                    <div className="form-grid-2">

                                        <div className="form-group">
                                            <label>Costo (Bs.)</label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                name="costo"
                                                value={formData.costo}
                                                onChange={handleChange}
                                                required
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Cupo Máximo</label>

                                            <input
                                                type="number"
                                                name="cupo_maximo"
                                                value={formData.cupo_maximo}
                                                onChange={handleChange}
                                                required
                                                placeholder="0"
                                            />
                                        </div>

                                    </div>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Mínimo de Estudiantes</label>
                                            <input
                                                type="number"
                                                min="1"
                                                name="minimo_estudiantes"
                                                value={formData.minimo_estudiantes}
                                                onChange={handleChange}
                                                placeholder={formData.cupo_maximo ? `Ej: ${Math.ceil(Number(formData.cupo_maximo) * 0.3)}` : '1'}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Descripción</label>

                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                            required
                                            rows="3"
                                            placeholder="Describe brevemente el curso..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Prerrequisitos</label>

                                        <div className="prerrequisitos-list">
                                            {cursos.map(c => (
                                                <label
                                                    key={c.id}
                                                    className={`prerrequisito-item ${formData.prerrequisitos.includes(c.id)
                                                        ? 'selected'
                                                        : ''
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.prerrequisitos.includes(c.id)}
                                                        onChange={() => handlePrerrequisitoToggle(c.id)}
                                                    />

                                                    <span>{c.nombre}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setMostrarModal(false)}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-submit"
                                    >
                                        Crear Curso
                                    </button>

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

export default AdministrarCursos;