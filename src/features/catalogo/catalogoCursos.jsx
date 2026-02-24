// catalogoCursos.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ModalPago from '../../components/pago/ModalPago';
import CursoDetalle from '../../components/cursoDetalle/CursoDetalle';
import './catalogoCursos.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const VISUAL = [
  { icono: '💻', color: 'linear-gradient(135deg,#003366,#0055aa)', categoria: 'Tecnología', tags: ['Python','Java','UML'] },
  { icono: '📐', color: 'linear-gradient(135deg,#1e3a5f,#2e6da4)', categoria: 'Ciencias',   tags: ['Álgebra','Física','Ingeniería'] },
  { icono: '📊', color: 'linear-gradient(135deg,#5a8a1a,#8cc63f)', categoria: 'Negocios',   tags: ['Management','Liderazgo','Estrategia'] },
  { icono: '🌎', color: 'linear-gradient(135deg,#4338ca,#6366f1)', categoria: 'Idiomas',    tags: ['B2-C1','Business','Speaking'] },
  { icono: '🎨', color: 'linear-gradient(135deg,#b45309,#f59e0b)', categoria: 'Diseño',     tags: ['Figma','Prototipado','Usabilidad'] },
  { icono: '📈', color: 'linear-gradient(135deg,#065f46,#10b981)', categoria: 'Datos',      tags: ['Python','ML','Visualización'] },
];

const IconMoney = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPlus  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconArrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconInfo  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconEye   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

const CursoCard = ({ curso, visual, inscrito, onInscribir, onVerDetalle }) => {
  const [hover, setHover] = useState(false);
  return (
    <div className="curso-catalogo-card">
      <div className="card-banner" style={{ background: visual.color }}>
        <span style={{ position:'relative', zIndex:2 }}>{visual.icono}</span>
        <span className="card-chip">{visual.categoria}</span>
      </div>
      <div className="card-body">
        <div className="card-titulo">{curso.nombre}</div>
        <div className="card-codigo">ID-{String(curso.id).padStart(3,'0')}</div>
        <p className="card-desc">{curso.descripcion}</p>
        <div className="card-detalles">
          <div className="detalle-item"><IconMoney /><span>Bs. {curso.costo}</span></div>
        </div>
        <div className="card-tags">
          {visual.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        <button
          onClick={() => onVerDetalle(curso)}
          style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', background:'none', border:'none', color:'#7a9cc0', fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit', cursor:'pointer', padding:'0.2rem 0', marginBottom:'0.5rem' }}
        >
          <IconEye /><span>Ver detalle</span>
        </button>

        <button
          className={`btn-inscribir ${inscrito ? 'inscrito' : 'disponible'}`}
          onClick={() => !inscrito && onInscribir(curso)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          disabled={inscrito}
        >
          {inscrito
            ? <><IconCheck /><span>¡Ya estás inscrito!</span></>
            : <><IconPlus /><span>Inscribirme al curso</span></>
          }
        </button>
      </div>
    </div>
  );
};

const CatalogoCursos = () => {
  const navigate = useNavigate();
  // ✅ CORRECCIÓN: se eliminó inscribirCurso del destructuring ya que el backend
  // lo ejecuta automáticamente al capturar el pago de PayPal. Llamarlo de nuevo
  // causaría el error "Ya estás inscrito en este curso".
  const { usuario, estaInscrito, cursosInscritos, marcarInscrito } = useAuth();

  const [cursos, setCursos]               = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cursoDetalle, setCursoDetalle]   = useState(null);
  const [cursoPago, setCursoPago]         = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/cursos`)
      .then(r => r.json())
      .then(data => setCursos(Array.isArray(data) ? data : []))
      .catch(() => setCursos([]))
      .finally(() => setCargandoCursos(false));
  }, []);

  // ✅ CORRECCIÓN: se eliminó la llamada redundante a inscribirCurso().
  // marcarInscrito() actualiza el estado local en memoria; el backend ya
  // registró la inscripción dentro de postCapturarOrden (pagos.controller.js).
  const handlePagoExitoso = (cursoId) => {
    marcarInscrito(cursoId);
    setCursoPago(null);
  };

  return (
    <div className="catalogo-page">
      <div className="catalogo-header">
        <div className="catalogo-header-bg"><span /><span /></div>
        <div className="catalogo-header-inner">
          <div className="cat-breadcrumb">
            <a href="/">Inicio</a><span className="sep">›</span><span>Catálogo de Cursos</span>
          </div>
          <h1>Cursos <span>Disponibles</span></h1>
          <p>Explora la oferta académica y arma tu plan de estudios</p>
        </div>
      </div>

      <div className="catalogo-body">
        {usuario && (
          <div className="info-sesion">
            <IconInfo />
            <p>Bienvenido/a <strong>{usuario.nombre}</strong>. Selecciona los cursos que quieres tomar.</p>
          </div>
        )}

        <div className="catalogo-contador">
          <p>
            Mostrando <strong>{cursos.length} cursos</strong>
            {cursosInscritos.length > 0 && (
              <> · <strong style={{ color:'#8cc63f' }}>{cursosInscritos.length} inscrito{cursosInscritos.length > 1 ? 's' : ''}</strong></>
            )}
          </p>
          {cursosInscritos.length > 0 && (
            <button className="btn-ver-perfil" onClick={() => navigate('/perfil')}>
              <IconArrow />Ver mi perfil y cursos inscritos
            </button>
          )}
        </div>

        {cargandoCursos ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#888', fontSize:'1.1rem' }}>
            Cargando cursos...
          </div>
        ) : (
          <div className="cursos-catalogo-grid">
            {cursos.map((curso, i) => (
              <CursoCard
                key={curso.id}
                curso={curso}
                visual={VISUAL[i % VISUAL.length]}
                inscrito={estaInscrito(curso.id)}
                onInscribir={(c) => setCursoPago(c)}
                onVerDetalle={(c) => setCursoDetalle(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal: Vista detalle del curso */}
      {cursoDetalle && (
        <CursoDetalle
          curso={cursoDetalle}
          inscrito={estaInscrito(cursoDetalle.id)}
          onClose={() => setCursoDetalle(null)}
          onInscribirse={(c) => { setCursoDetalle(null); setCursoPago(c); }}
        />
      )}

      {/* Modal: Pago con PayPal */}
      {cursoPago && (
        <ModalPago
          curso={cursoPago}
          onClose={() => setCursoPago(null)}
          onPagoExitoso={handlePagoExitoso}
        />
      )}
    </div>
  );
};

export default CatalogoCursos;