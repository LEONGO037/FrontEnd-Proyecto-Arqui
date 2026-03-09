import React, { useState, useEffect } from 'react';
import HeaderEstudiante from './headerEstudiante';
import Footer from '../layout/footerPrincipal';
import { getMisPagos } from '../../services/pagosApi';
import '../admin/adminPagos.css'; // Reutilizamos estilos base de admin para consistencia

const EstudiantePagos = () => {
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPagos();
    }, []);

    const fetchPagos = async () => {
        try {
            setLoading(true);
            const data = await getMisPagos();
            setPagos(data || []);
        } catch (err) {
            console.error('Error fetching student payments:', err);
            setError('No se pudieron cargar tus pagos. Intenta de nuevo más tarde.');
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="admin-page">
                <HeaderEstudiante />
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
            <HeaderEstudiante />

            <main className="admin-main" style={{ marginTop: '100px' }}>
                <div className="admin-pagos-container">
                    <header className="admin-pagos-header">
                        <h1 className="admin-pagos-title">Mis Pagos Realizados</h1>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                            Aquí puedes ver el historial de tus transacciones y el estado de tus inscripciones.
                        </p>
                    </header>

                    {error && <div className="error-message" style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}

                    <section className="admin-table-wrapper">
                        <table className="admin-pagos-table">
                            <thead>
                                <tr>
                                    <th>Referencia</th>
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
                                            <td style={{ fontWeight: '600', color: '#4f46e5' }}>{pago.referencia}</td>
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
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                            <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Aún no has realizado ningún pago.</div>
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

export default EstudiantePagos;
