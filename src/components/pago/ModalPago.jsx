// ModalPago.jsx
import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import './ModalPago.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Iconos
const IconClose  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IconCheck  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IconAlert  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconLock   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

// Metadatos visuales por ID de curso (mismo orden que el catálogo)
const VISUAL_MAP = {
  1: { icono: '💻' }, 2: { icono: '📐' }, 3: { icono: '📊' },
  4: { icono: '🌎' }, 5: { icono: '🎨' }, 6: { icono: '📈' },
};

const ModalPago = ({ curso, onClose, onPagoExitoso }) => {
  const [clientId, setClientId]     = useState(null);
  const [montoUSD, setMontoUSD]     = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState('');
  const [exito, setExito]           = useState(null); // { transaccion }

  const visual = VISUAL_MAP[curso?.id] || { icono: '📚' };

  // ✅ CORRECCIÓN: función helper que lee el token fresco en cada llamada,
  // evitando que un token leído al montar el componente quede desactualizado
  // o sea null si el componente se cargó antes de que localStorage se poblara.
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
    }
    return token;
  };

  // Cargar clientId desde el backend (sin .env en el frontend)
  useEffect(() => {
    fetch(`${API_BASE}/api/pagos/config`)
      .then(r => r.json())
      .then(d => setClientId(d.clientId))
      .catch(() => setError('No se pudo conectar con el servidor de pagos'))
      .finally(() => setCargando(false));
  }, []);

  // ✅ CORRECCIÓN: token leído dentro del handler, no al montar el componente
  const handleCrearOrden = async () => {
    const token = getToken();

    const res = await fetch(`${API_BASE}/api/pagos/crear-orden`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ curso_id: curso.id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear la orden');
    setMontoUSD(data.monto);
    return data.orderID;
  };

  // ✅ CORRECCIÓN: token leído dentro del handler, no al montar el componente
  const handleAprobar = async (data) => {
    setError('');
    setCargando(true);
    try {
      const token = getToken();

      const res = await fetch(`${API_BASE}/api/pagos/capturar-orden`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderID: data.orderID, curso_id: curso.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setExito({ transaccion: result.transaccion });
      onPagoExitoso(curso.id);
    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setCargando(false);
    }
  };

  const handleError = (err) => {
    console.error('PayPal error:', err);
    setError('Ocurrió un error con PayPal. Intenta de nuevo.');
  };

  return (
    <div className="pago-overlay" onClick={onClose}>
      <div className="pago-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pago-header">
          <div className="pago-header-bg"><span /><span /></div>
          <div className="pago-header-inner">
            <button className="pago-close" onClick={onClose}><IconClose /></button>
            <span className="pago-curso-icono">{visual.icono}</span>
            <div className="pago-curso-nombre">{curso?.nombre}</div>
            <div className="pago-curso-codigo">Pago único · Sin suscripción</div>
          </div>
        </div>

        {/* Body */}
        <div className="pago-body">

          {/* Estado de éxito */}
          {exito ? (
            <div className="pago-exito">
              <div className="pago-exito-icono"><IconCheck /></div>
              <h3>¡Pago completado!</h3>
              <p>Ya estás inscrito en el curso. ¡Bienvenido!</p>
              <div className="pago-exito-id">ID: {exito.transaccion}</div>
              <button className="btn-pago-continuar" onClick={onClose}>
                Ver mis cursos inscritos
              </button>
            </div>
          ) : (
            <>
              {/* Resumen de precio */}
              <div className="pago-resumen">
                <div className="pago-resumen-row">
                  <span>Curso</span>
                  <span>{curso?.nombre}</span>
                </div>
                <div className="pago-resumen-row">
                  <span>Precio (Bs.)</span>
                  <span>Bs. {curso?.costo}</span>
                </div>
                {montoUSD && (
                  <div className="pago-resumen-row">
                    <span>Equivalente USD</span>
                    <span>${montoUSD}</span>
                  </div>
                )}
                <div className="pago-resumen-row">
                  <span>Total a pagar</span>
                  <span>${montoUSD || ((curso?.costo / 7).toFixed(2))}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="pago-error">
                  <IconAlert />
                  <span>{error}</span>
                </div>
              )}

              <div className="pago-divider"><span>Pagar con PayPal</span></div>

              {/* Botón PayPal */}
              {cargando ? (
                <div className="pago-cargando">
                  <div className="pago-spinner" />
                  <p>Cargando opciones de pago...</p>
                </div>
              ) : clientId ? (
                <div className="paypal-btn-wrapper">
                  <PayPalScriptProvider options={{
                    'client-id': clientId,
                    currency: 'USD',
                    intent: 'capture',
                  }}>
                    <PayPalButtons
                      style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay', height: 50 }}
                      createOrder={handleCrearOrden}
                      onApprove={handleAprobar}
                      onError={handleError}
                      onCancel={() => setError('Pago cancelado. Puedes intentarlo de nuevo.')}
                    />
                  </PayPalScriptProvider>
                </div>
              ) : (
                <div className="pago-error">
                  <IconAlert />
                  <span>No se pudo cargar el sistema de pagos. Verifica que el backend esté corriendo.</span>
                </div>
              )}

              <div className="pago-seguridad">
                <IconLock />
                <span>Pago 100% seguro · Procesado por PayPal Sandbox</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPago;