// adminAsignarCursosDocente.jsx — Asignación de docentes a cursos
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../layout/headerPrincipal';
import Footer from '../layout/footerPrincipal';
import './adminAsignarCursosDocente.css';

const API_BASE = 'http://localhost:3000';

const AdminAsignarCursosDocente = () => {
    const { cursoId } = useParams();
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);
    const [docentes, setDocentes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setCargando(true);
            try {
                const token = localStorage.getItem('token');

                // 1. Obtener detalles del curso (solo los que no tienen docente)
                const resCurso = await fetch(`${API_BASE}/api/cursos/sin-docente`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!resCurso.ok) throw new Error('Error al obtener cursos');
                const todosCursos = await resCurso.json();
                const cursoEncontrado = todosCursos.find(c => c.id === parseInt(cursoId));
                setCurso(cursoEncontrado);

                // 2. Obtener lista de docentes
                const resDocentes = await fetch(`${API_BASE}/api/admin-docente-curso/docentes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!resDocentes.ok) throw new Error('Error al obtener docentes');
                const dataDocentes = await resDocentes.json();

                setDocentes(Array.isArray(dataDocentes) ? dataDocentes : []);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setCargando(false);
            }
        };

        fetchData();
    }, [cursoId]);

    const handleAsignar = async (docenteId) => {
        setEnviando(true);
        setError(null);
        setExito(null);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/api/admin-docente-curso/asignar-curso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuario_id: docenteId,
                    curso_id: parseInt(cursoId)
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al asignar docente');
            }

            setExito('¡Docente asignado correctamente al curso!');
            setTimeout(() => navigate('/admin/cursos'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    const docentesFiltrados = docentes.filter(d => {
        const query = busqueda.toLowerCase();
        const fullNombre = `${d.nombre} ${d.apellido_paterno || ''} ${d.apellido_materno || ''}`.toLowerCase();
        return fullNombre.includes(query) || d.email?.toLowerCase().includes(query);
    });

    // Componente de Esqueleto
    const SkeletonCard = () => (
        <div className="docente-assign-card skeleton">
            <div className="docente-assign-avatar skeleton-shimmer"></div>
            <div className="docente-assign-info">
                <div className="skeleton-line skeleton-shimmer" style={{ width: '80%', height: '1.25rem', marginBottom: '0.5rem' }}></div>
                <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: '0.9rem', marginBottom: '1rem' }}></div>
                <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: '1.5rem', borderRadius: '50px' }}></div>
            </div>
            <div className="skeleton-button skeleton-shimmer"></div>
        </div>
    );

    return (
        <div className="admin-asignar-page">
            <Header />

            <main className="admin-asignar-main">
                <div className="admin-asignar-header">
                    <button className="btn-back-square" onClick={() => navigate('/admin/cursos')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="admin-asignar-title">Asignar Docente</h1>
                        <p className="admin-asignar-subtitle">
                            Curso: <strong>{curso?.nombre || 'Cargando...'}</strong> (ID: {cursoId})
                        </p>
                    </div>
                </div>

                {error && <div className="admin-error-box">{error}</div>}
                {exito && <div className="admin-success-box">{exito}</div>}

                <div className="asignar-search-bar">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar docente por nombre o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="docentes-cards-grid">
                    {cargando ? (
                        // Mostrar 6 esqueletos mientras carga
                        [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                    ) : docentesFiltrados.length === 0 ? (
                        <div className="vacio-box">No se encontraron docentes disponibles.</div>
                    ) : docentesFiltrados.map(docente => (
                        <div key={docente.id} className="docente-assign-card">
                            <div className="docente-assign-avatar">
                                {docente.nombre?.charAt(0).toUpperCase()}
                            </div>
                            <div className="docente-assign-info">
                                <h3>{`${docente.nombre} ${docente.apellido_paterno || ''} ${docente.apellido_materno || ''}`.trim()}</h3>
                                <p>{docente.email}</p>
                                <div className="docente-meta-info" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <span className="docente-id-badge">ID: {docente.id}</span>
                                    {docente.telefono && <span className="docente-id-badge" style={{ background: '#ecfdf5', color: '#059669' }}>📞 {docente.telefono}</span>}
                                </div>
                            </div>
                            <button
                                className={`btn-assign-action ${enviando ? 'loading' : ''}`}
                                onClick={() => handleAsignar(docente.id)}
                                disabled={enviando}
                            >
                                {enviando ? 'Asignando...' : 'Asignar a este curso'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminAsignarCursosDocente;
