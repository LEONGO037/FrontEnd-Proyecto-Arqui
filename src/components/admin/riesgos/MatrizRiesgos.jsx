import React, { useState, useEffect } from 'react';
import { getMatrizRiesgos, crearItemMatriz, actualizarItemMatriz, eliminarItemMatriz } from '../../../services/riesgosApi';
import './MatrizRiesgos.css';

const CALCULAR_NIVEL = (valor) => {
    if (valor >= 20) return 'Extremo';
    if (valor >= 11) return 'Alto';
    if (valor >= 6) return 'Moderado';
    return 'Bajo';
};

const COLOR_NIVEL = {
    Extremo: '#dc2626', // Red
    Alto: '#f97316',    // Orange
    Moderado: '#eab308', // Yellow
    Bajo: '#22c55e',    // Green
};

const MatrizRiesgos = ({ puedeGestionar }) => {
    const [matriz, setMatriz] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const [form, setForm] = useState({
        activo_informacion: '',
        amenaza_vulnerabilidad: '',
        consecuencia_riesgo: '',
        probabilidad_inherente: 3,
        impacto_inherente: 3,
        tratamiento_riesgo: 'Reducir',
        controles_implementar: '',
        control_tipo: 'P',
        control_nivel: 'S',
        control_frecuencia: 'PT',
        probabilidad_residual: 1,
        impacto_residual: 1,
        responsable_nombre: '',
    });

    const cargarDatos = async () => {
        setCargando(true);
        setError('');
        try {
            const data = await getMatrizRiesgos();
            setMatriz(data.datos || []);
        } catch (err) {
            setError(err.message || 'Error al cargar la matriz de riesgos');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const resetForm = () => {
        setForm({
            activo_informacion: '',
            amenaza_vulnerabilidad: '',
            consecuencia_riesgo: '',
            probabilidad_inherente: 3,
            impacto_inherente: 3,
            tratamiento_riesgo: 'Reducir',
            controles_implementar: '',
            control_tipo: 'P',
            control_nivel: 'S',
            control_frecuencia: 'PT',
            probabilidad_residual: 1,
            impacto_residual: 1,
            responsable_nombre: '',
        });
        setEditandoId(null);
    };

    const abrirCrear = () => {
        resetForm();
        setModalAbierto(true);
    };

    const abrirEditar = (item) => {
        setForm({
            activo_informacion: item.activo_informacion,
            amenaza_vulnerabilidad: item.amenaza_vulnerabilidad,
            consecuencia_riesgo: item.consecuencia_riesgo,
            probabilidad_inherente: item.probabilidad_inherente,
            impacto_inherente: item.impacto_inherente,
            tratamiento_riesgo: item.tratamiento_riesgo,
            controles_implementar: item.controles_implementar,
            control_tipo: item.control_tipo,
            control_nivel: item.control_nivel,
            control_frecuencia: item.control_frecuencia,
            probabilidad_residual: item.probabilidad_residual,
            impacto_residual: item.impacto_residual,
            responsable_nombre: item.responsable_nombre || '',
        });
        setEditandoId(item.id);
        setModalAbierto(true);
    };

    const guardar = async (e) => {
        e.preventDefault();
        setError('');
        const pInherente = Number(form.probabilidad_inherente);
        const iInherente = Number(form.impacto_inherente);
        const riesgoInherente = pInherente * iInherente;
        const nivelInherente = CALCULAR_NIVEL(riesgoInherente);

        const pResidual = Number(form.probabilidad_residual);
        const iResidual = Number(form.impacto_residual);
        const riesgoResidual = pResidual * iResidual;
        const nivelResidual = CALCULAR_NIVEL(riesgoResidual);

        const payload = {
            ...form,
            probabilidad_inherente: pInherente,
            impacto_inherente: iInherente,
            riesgo_inherente: riesgoInherente,
            nivel_riesgo_inherente: nivelInherente,
            probabilidad_residual: pResidual,
            impacto_residual: iResidual,
            riesgo_residual: riesgoResidual,
            nivel_riesgo_residual: nivelResidual,
        };

        try {
            if (editandoId) {
                await actualizarItemMatriz(editandoId, payload);
            } else {
                await crearItemMatriz(payload);
            }
            setModalAbierto(false);
            resetForm();
            await cargarDatos();
        } catch (err) {
            setError(err.message || 'Error al guardar el registro');
        }
    };

    const borrar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este análisis de riesgo de la matriz?')) return;
        setError('');
        try {
            await eliminarItemMatriz(id);
            await cargarDatos();
        } catch (err) {
            setError(err.message || 'Error al eliminar el registro');
        }
    };

    const riesgoInherenteCalculado = form.probabilidad_inherente * form.impacto_inherente;
    const riesgoResidualCalculado = form.probabilidad_residual * form.impacto_residual;

    return (
        <div className="matriz-container">
            <div className="matriz-controls-row">
                <h2 className="matriz-subtitle">📋 Matriz de Análisis de Riesgos de Seguridad de la Información</h2>
                {puedeGestionar && (
                    <button className="btn-primario add-matrix-btn" onClick={abrirCrear}>
                        + Nuevo Análisis de Riesgo
                    </button>
                )}
            </div>

            {error && <div className="riesgos-alert riesgos-alert-error">{error}</div>}

            {cargando ? (
                <div className="matriz-loading">Cargando matriz de análisis...</div>
            ) : (
                <div className="matriz-table-scroll-container">
                    <table className="matriz-table">
                        <thead>
                            <tr className="matriz-header-groups">
                                <th colSpan="2" className="group-activos">ACTIVOS</th>
                                <th className="group-identificacion">IDENTIFICACIÓN</th>
                                <th className="group-valoracion">VALORACIÓN</th>
                                <th colSpan="4" className="group-eval-inherente">EVALUACIÓN DEL RIESGO INHERENTE</th>
                                <th className="group-medicion">MEDICIÓN</th>
                                <th className="group-mitigacion">MITIGACIÓN</th>
                                <th colSpan="3" className="group-eficiencia">EFICIENCIA DEL CONTROL</th>
                                <th colSpan="4" className="group-residual">RIESGO RESIDUAL</th>
                                {puedeGestionar && <th rowSpan="2" className="group-acciones">ACCIONES</th>}
                            </tr>
                            <tr className="matriz-header-fields">
                                <th style={{ width: '40px' }}>No.</th>
                                <th style={{ minWidth: '150px' }}>Activo de Información (Aplicativo/Sistema)</th>
                                <th style={{ minWidth: '220px' }}>Amenaza / Vulnerabilidad</th>
                                <th style={{ minWidth: '220px' }}>Consecuencia / Riesgo</th>
                                <th style={{ width: '40px' }} title="Probabilidad">P</th>
                                <th style={{ width: '40px' }} title="Impacto">I</th>
                                <th style={{ width: '60px' }}>Valor</th>
                                <th style={{ minWidth: '100px' }}>Nivel de Riesgo</th>
                                <th style={{ minWidth: '100px' }}>Tratamiento</th>
                                <th style={{ minWidth: '220px' }}>Controles a Implementar</th>
                                <th style={{ width: '60px' }} title="Tipo (P, D, C, Di)">Tipo</th>
                                <th style={{ width: '60px' }} title="Nivel (A, S, M)">Nivel</th>
                                <th style={{ width: '80px' }} title="Frecuencia">Frecuencia</th>
                                <th style={{ width: '40px' }} title="Probabilidad Residual">P</th>
                                <th style={{ width: '40px' }} title="Impacto Residual">I</th>
                                <th style={{ width: '60px' }}>Valor</th>
                                <th style={{ minWidth: '100px' }}>Nivel Residual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matriz.map((item, idx) => (
                                <tr key={item.id} className="matriz-row">
                                    <td className="text-center font-bold">{idx + 1}</td>
                                    <td className="font-semibold text-white">{item.activo_informacion}</td>
                                    <td>{item.amenaza_vulnerabilidad}</td>
                                    <td>{item.consecuencia_riesgo}</td>
                                    <td className="text-center font-semibold">{item.probabilidad_inherente}</td>
                                    <td className="text-center font-semibold">{item.impacto_inherente}</td>
                                    <td className="text-center font-bold text-white">{item.riesgo_inherente}</td>
                                    <td className="text-center font-bold" style={{ color: COLOR_NIVEL[item.nivel_riesgo_inherente] }}>
                                        <span className="matrix-badge" style={{ backgroundColor: `${COLOR_NIVEL[item.nivel_riesgo_inherente]}22`, border: `1px solid ${COLOR_NIVEL[item.nivel_riesgo_inherente]}55` }}>
                                            {item.nivel_riesgo_inherente}
                                        </span>
                                    </td>
                                    <td className="text-center text-sky-400 font-semibold">{item.tratamiento_riesgo}</td>
                                    <td>{item.controles_implementar}</td>
                                    <td className="text-center font-medium text-emerald-400">{item.control_tipo}</td>
                                    <td className="text-center font-medium text-violet-400">{item.control_nivel}</td>
                                    <td className="text-center font-medium text-teal-400">{item.control_frecuencia}</td>
                                    <td className="text-center font-semibold">{item.probabilidad_residual}</td>
                                    <td className="text-center font-semibold">{item.impacto_residual}</td>
                                    <td className="text-center font-bold text-white">{item.riesgo_residual}</td>
                                    <td className="text-center font-bold" style={{ color: COLOR_NIVEL[item.nivel_riesgo_residual] }}>
                                        <span className="matrix-badge" style={{ backgroundColor: `${COLOR_NIVEL[item.nivel_riesgo_residual]}22`, border: `1px solid ${COLOR_NIVEL[item.nivel_riesgo_residual]}55` }}>
                                            {item.nivel_riesgo_residual}
                                        </span>
                                    </td>
                                    {puedeGestionar && (
                                        <td className="text-center">
                                            <div className="matrix-actions-cell">
                                                <button className="matrix-btn-edit" onClick={() => abrirEditar(item)} title="Editar">✏️</button>
                                                <button className="matrix-btn-delete" onClick={() => borrar(item.id)} title="Eliminar">🗑️</button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {matriz.length === 0 && (
                                <tr>
                                    <td colSpan={puedeGestionar ? 18 : 17} className="text-center py-8 text-slate-400">
                                        No hay análisis de riesgos registrados en la matriz.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de CRUD */}
            {modalAbierto && (
                <div className="riesgos-modal-overlay" onClick={() => setModalAbierto(false)}>
                    <div className="riesgos-modal matriz-modal-width" onClick={(e) => e.stopPropagation()}>
                        <h2>{editandoId ? 'Editar Análisis de Riesgo' : 'Nuevo Análisis de Riesgo'}</h2>
                        <p className="modal-desc">Completa todos los campos para efectuar el análisis de riesgo del activo.</p>
                        
                        <form onSubmit={guardar} className="matriz-modal-form">
                            <div className="form-section-title">1. Activo e Identificación</div>
                            <div className="form-row">
                                <label className="form-col-12">
                                    Activo de Información / Sistema Afectado *
                                    <input
                                        type="text"
                                        required
                                        value={form.activo_informacion}
                                        onChange={(e) => setForm({ ...form, activo_informacion: e.target.value })}
                                        placeholder="Ej: Sistema Core de Pólizas, Directorio Activo..."
                                    />
                                </label>
                            </div>
                            <div className="form-row">
                                <label className="form-col-6">
                                    Amenaza o Vulnerabilidad *
                                    <textarea
                                        rows="3"
                                        required
                                        value={form.amenaza_vulnerabilidad}
                                        onChange={(e) => setForm({ ...form, amenaza_vulnerabilidad: e.target.value })}
                                        placeholder="Describe la amenaza..."
                                    />
                                </label>
                                <label className="form-col-6">
                                    Consecuencias o Riesgos *
                                    <textarea
                                        rows="3"
                                        required
                                        value={form.consecuencia_riesgo}
                                        onChange={(e) => setForm({ ...form, consecuencia_riesgo: e.target.value })}
                                        placeholder="Consecuencias potenciales..."
                                    />
                                </label>
                            </div>

                            <div className="form-section-title">2. Evaluación del Riesgo Inherente</div>
                            <div className="form-row flex-items-center">
                                <label className="form-col-3">
                                    Probabilidad (1 a 5) *
                                    <select
                                        value={form.probabilidad_inherente}
                                        onChange={(e) => setForm({ ...form, probabilidad_inherente: Number(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </label>
                                <label className="form-col-3">
                                    Impacto (1 a 5) *
                                    <select
                                        value={form.impacto_inherente}
                                        onChange={(e) => setForm({ ...form, impacto_inherente: Number(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </label>
                                <div className="form-col-6 val-preview-box">
                                    <div className="val-preview-label">Riesgo Inherente:</div>
                                    <div className="val-preview-number" style={{ color: COLOR_NIVEL[CALCULAR_NIVEL(riesgoInherenteCalculado)] }}>
                                        {riesgoInherenteCalculado} ({CALCULAR_NIVEL(riesgoInherenteCalculado)})
                                    </div>
                                </div>
                            </div>

                            <div className="form-section-title">3. Medición y Mitigación (Controles)</div>
                            <div className="form-row">
                                <label className="form-col-4">
                                    Tratamiento *
                                    <select
                                        value={form.tratamiento_riesgo}
                                        onChange={(e) => setForm({ ...form, tratamiento_riesgo: e.target.value })}
                                    >
                                        {['Reducir', 'Aceptar', 'Evitar', 'Transferir'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </label>
                                <label className="form-col-8">
                                    Responsable de Mitigación
                                    <input
                                        type="text"
                                        value={form.responsable_nombre}
                                        onChange={(e) => setForm({ ...form, responsable_nombre: e.target.value })}
                                        placeholder="Ej: Juan Pérez (Seguridad IT)"
                                    />
                                </label>
                            </div>
                            <div className="form-row">
                                <label className="form-col-12">
                                    Controles a Implementar (Mitigación) *
                                    <textarea
                                        rows="2"
                                        required
                                        value={form.controles_implementar}
                                        onChange={(e) => setForm({ ...form, controles_implementar: e.target.value })}
                                        placeholder="Detalle de los controles..."
                                    />
                                </label>
                            </div>
                            <div className="form-row">
                                <label className="form-col-4">
                                    Tipo de Control
                                    <select
                                        value={form.control_tipo}
                                        onChange={(e) => setForm({ ...form, control_tipo: e.target.value })}
                                    >
                                        <option value="P">Preventivo (P)</option>
                                        <option value="D">Detectivo (D)</option>
                                        <option value="C">Correctivo (C)</option>
                                        <option value="P, D">Preventivo y Detectivo (P, D)</option>
                                    </select>
                                </label>
                                <label className="form-col-4">
                                    Nivel
                                    <select
                                        value={form.control_nivel}
                                        onChange={(e) => setForm({ ...form, control_nivel: e.target.value })}
                                    >
                                        <option value="A">Alto (A)</option>
                                        <option value="S">Suficiente (S)</option>
                                        <option value="M">Moderado (M)</option>
                                    </select>
                                </label>
                                <label className="form-col-4">
                                    Frecuencia
                                    <select
                                        value={form.control_frecuencia}
                                        onChange={(e) => setForm({ ...form, control_frecuencia: e.target.value })}
                                    >
                                        <option value="D">Diario (D)</option>
                                        <option value="S">Semanal (S)</option>
                                        <option value="M">Mensual (M)</option>
                                        <option value="A">Anual (A)</option>
                                        <option value="PT">Por Transacción (PT)</option>
                                    </select>
                                </label>
                            </div>

                            <div className="form-section-title">4. Evaluación del Riesgo Residual</div>
                            <div className="form-row flex-items-center">
                                <label className="form-col-3">
                                    P Residual (1 a 5) *
                                    <select
                                        value={form.probabilidad_residual}
                                        onChange={(e) => setForm({ ...form, probabilidad_residual: Number(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </label>
                                <label className="form-col-3">
                                    I Residual (1 a 5) *
                                    <select
                                        value={form.impacto_residual}
                                        onChange={(e) => setForm({ ...form, impacto_residual: Number(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </label>
                                <div className="form-col-6 val-preview-box">
                                    <div className="val-preview-label">Riesgo Residual:</div>
                                    <div className="val-preview-number" style={{ color: COLOR_NIVEL[CALCULAR_NIVEL(riesgoResidualCalculado)] }}>
                                        {riesgoResidualCalculado} ({CALCULAR_NIVEL(riesgoResidualCalculado)})
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secundario"
                                    onClick={() => setModalAbierto(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario">
                                    {editandoId ? 'Guardar Cambios' : 'Registrar Riesgo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatrizRiesgos;
