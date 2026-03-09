import React, { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import Footer from '../layout/footerPrincipal';
import { getAllPagos } from '../../services/pagosApi';
import './adminPagos.css';

const AdminPagos = () => {
    const [pagos, setPagos] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPagos();
    }, []);

    const fetchPagos = async () => {
        try {
            setLoading(true);
            const response = await getAllPagos();
            setPagos(response.data || []);
            setTotal(response.total || 0);
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError('No se pudieron cargar los pagos. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalMonto = pagos.reduce((acc, pago) => acc + parseFloat(pago.monto || 0), 0);

    if (loading) {
        return (
            <div className="admin-page">
                <AdminHeader />
                <main className="admin-main">
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="admin-page">
            <AdminHeader />

            <main className="admin-main">
                <div className="admin-pagos-container">
                    <header className="admin-pagos-header">
                        <h1 className="admin-pagos-title">Gestión de Pagos</h1>
                        <button className="admin-card-arrow" onClick={fetchPagos} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.5rem' }}>
                            🔄
                        </button>
                    </header>

                    {error && <div className="error-message">{error}</div>}

                    <section className="admin-stats-grid">
                        <div className="admin-stat-card">
                            <span className="stat-label">Total Recaudado</span>
                            <span className="stat-value">{formatCurrency(totalMonto)}</span>
                        </div>
                        <div className="admin-stat-card">
                            <span className="stat-label">Cantidad de Transacciones</span>
                            <span className="stat-value">{total}</span>
                        </div>
                        <div className="admin-stat-card">
                            <span className="stat-label">Estado del Sistema</span>
                            <span className="stat-value" style={{ color: '#10b981' }}>Activo</span>
                        </div>
                    </section>

                    <section className="admin-table-wrapper">
                        <table className="admin-pagos-table">
                            <thead>
                                <tr>
                                    <th>Referencia</th>
                                    <th>Estudiante</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                    <th>Método</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.length > 0 ? (
                                    pagos.map((pago) => (
                                        <tr key={pago.pago_id}>
                                            <td style={{ fontWeight: '500', color: '#4f46e5' }}>{pago.referencia}</td>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{`${pago.estudiante_nombre} ${pago.estudiante_apellido}`}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{pago.estudiante_email}</div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '700' }}>{formatCurrency(pago.monto)}</td>
                                            <td>
                                                <span className={`badge badge-${pago.estado.toLowerCase()}`}>
                                                    {pago.estado}
                                                </span>
                                            </td>
                                            <td>{pago.metodo_pago}</td>
                                            <td>{formatDate(pago.fecha_pago)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No se encontraron pagos realizados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminPagos;
