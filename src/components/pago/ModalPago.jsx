// ModalPago.jsx - Versión actualizada para múltiples cursos
import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import './ModalPago.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Iconos
const IconClose  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IconCheck  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IconAlert  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconLock   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconCourse = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const IconMoney  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

// Metadatos visuales por ID de curso (mismo orden que el catálogo)
const VISUAL_MAP = {
  1: { icono: '💻' }, 2: { icono: '📐' }, 3: { icono: '📊' },
  4: { icono: '🌎' }, 5: { icono: '🎨' }, 6: { icono: '📈' },
};

/**
 * ModalPago - Componente de pago con PayPal (soporta múltiples cursos)
 * @param {Object|Object[]} cursos - Un curso o array de cursos a pagar
 * @param {number} total - Total en Bs. (opcional, se calcula si no se proporciona)
 * @param {Function} onClose - Callback al cerrar el modal
 * @param {Function} onPagoExitoso - Callback cuando el pago es exitoso, recibe array de IDs
 */
const ModalPago = ({ cursos, total: totalProp, onClose, onPagoExitoso }) => {
  const [clientId, setClientId]     = useState(null);
  const [montoUSD, setMontoUSD]     = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState('');
  const [exito, setExito]           = useState(null);

  // Normalizar cursos a array
  const cursosArray = Array.isArray(cursos) ? cursos : [cursos];
  const cursoPrincipal = cursosArray[0];
  
  // Calcular totales
  const totalBs = totalProp || cursosArray.reduce((sum, c) => sum + Number(c.costo), 0);
  const totalUSD = (totalBs / 7).toFixed(2);
  
  // IDs de cursos para el callback
  const cursoIds = cursosArray.map(c => c.id);

  const visual = VISUAL_MAP[cursoPrincipal?.id] || { icono: '📚' };

  // Función helper que lee el token fresco en cada llamada
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
    }
    return token;
  };

  // Cargar clientId desde el backend
  useEffect(() => {
    fetch(`${API_BASE}/api/pagos/config`)
      .then(r => r.json())
      .then(d => setClientId(d.clientId))
      .catch(() => setError('No se pudo conectar con el servidor de pagos'))
      .finally(() => setCargando(false));
  }, []);

  // Crear orden con múltiples cursos
  const handleCrearOrden = async () => {
    const token = getToken();

    const res = await fetch(`${API_BASE}/api/pagos/crear-orden`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        curso_ids: cursoIds,  // Array de IDs para el backend
        total_bs: totalBs     // Total en bolivianos
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear la orden');
    setMontoUSD(data.monto);
    return data.orderID;
  };

  // Capturar orden y procesar inscripciones
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
        body: JSON.stringify({ 
          orderID: data.orderID, 
          curso_ids: cursoIds  // Array de IDs para el backend
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setExito({ transaccion: result.transaccion });
      onPagoExitoso(cursoIds);
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

  // Título dinámico según cantidad de cursos
  const tituloCursos = cursosArray.length === 1 
    ? cursoPrincipal?.nombre 
    : `${cursosArray.length} cursos`;

  return (
    <div className="pago-contenido-carrito">
      {/* Estado de éxito */}
      {exito ? (
        <div className="pago-exito">
          <div className="pago-exito-icono"><IconCheck /></div>
          <h3>¡Pago completado!</h3>
          <p>Ya estás inscrito en {cursosArray.length === 1 ? 'el curso' : 'los cursos'}. ¡Bienvenido!</p>
          
          {/* Lista de cursos inscritos */}
          <div className="pago-exito-cursos">
            <p>Curso{cursosArray.length > 1 ? 's' : ''} inscrito{cursosArray.length > 1 ? 's' : ''}:</p>
            <ul>
              {cursosArray.map(curso => (
                <li key={curso.id}>
                  <span className="curso-icono">{VISUAL_MAP[curso.id]?.icono || '📚'}</span>
                  <span className="curso-nombre">{curso.nombre}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pago-exito-id">ID Transacción: {exito.transaccion}</div>
          <button
            className="btn-pago-continuar"
            onClick={() => { window.location.href = '/perfil'; }}
          >
            Ver mis cursos inscritos
          </button>
        </div>
      ) : (
        <>
          {/* Header compacto para el carrito */}
          <div className="pago-header-compacto">
            <span className="pago-curso-icono">{visual.icono}</span>
            <div>
              <div className="pago-curso-nombre">{tituloCursos}</div>
              <div className="pago-curso-cantidad">
                {cursosArray.length} curso{cursosArray.length > 1 ? 's' : ''} en el carrito
              </div>
            </div>
          </div>

          {/* Lista de cursos */}
          {cursosArray.length > 1 && (
            <div className="pago-lista-cursos">
              {cursosArray.map((curso, index) => (
                <div key={curso.id} className="pago-curso-item">
                  <span className="item-num">{index + 1}</span>
                  <span className="item-icono">{VISUAL_MAP[curso.id]?.icono || '📚'}</span>
                  <span className="item-nombre">{curso.nombre}</span>
                  <span className="item-precio">Bs. {curso.costo}</span>
                </div>
              ))}
            </div>
          )}

          {/* Resumen de precio */}
          <div className="pago-resumen">
            <div className="pago-resumen-row">
              <span>Subtotal ({cursosArray.length} curso{cursosArray.length > 1 ? 's' : ''})</span>
              <span>Bs. {totalBs}</span>
            </div>
            {montoUSD && (
              <div className="pago-resumen-row">
                <span>Equivalente USD</span>
                <span>${montoUSD}</span>
              </div>
            )}
            <div className="pago-resumen-row total">
              <span>Total a pagar</span>
              <span>${montoUSD || totalUSD}</span>
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
  );
};

export default ModalPago;
