// CursoDetalle.jsx — Vista ampliada del curso
import React from 'react';
import './CursoDetalle.css';

const VISUAL_MAP = {
  1: { icono: '💻', color: 'linear-gradient(135deg,#003366,#0055aa)', categoria: 'Tecnología', tags: ['Python','Java','UML'],        docente: 'Lic. María Fernández', horario: 'Lun-Mié  18:00–20:00', duracion: '16 semanas' },
  2: { icono: '📐', color: 'linear-gradient(135deg,#1e3a5f,#2e6da4)', categoria: 'Ciencias',   tags: ['Álgebra','Física','Ingeniería'], docente: 'Dr. Carlos Mendoza',  horario: 'Mar-Jue  16:00–18:00', duracion: '18 semanas' },
  3: { icono: '📊', color: 'linear-gradient(135deg,#5a8a1a,#8cc63f)', categoria: 'Negocios',   tags: ['Management','Liderazgo','Estrategia'], docente: 'Mg. Ana Quiroga', horario: 'Vie  14:00–18:00', duracion: '12 semanas' },
  4: { icono: '🌎', color: 'linear-gradient(135deg,#4338ca,#6366f1)', categoria: 'Idiomas',    tags: ['B2-C1','Business','Speaking'],   docente: 'Prof. David Smith',  horario: 'Lun-Mié-Vie  07:00–08:00', duracion: '20 semanas' },
  5: { icono: '🎨', color: 'linear-gradient(135deg,#b45309,#f59e0b)', categoria: 'Diseño',     tags: ['Figma','Prototipado','Usabilidad'], docente: 'Dis. Laura Quispe', horario: 'Sáb  09:00–13:00', duracion: '14 semanas' },
  6: { icono: '📈', color: 'linear-gradient(135deg,#065f46,#10b981)', categoria: 'Datos',      tags: ['Python','ML','Visualización'],  docente: 'Ing. Roberto Flores', horario: 'Mar-Jue  19:00–21:00', duracion: '16 semanas' },
};

const IconClose  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IconUser   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconClock  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCal    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconGroup  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconPlus   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconCheck  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

const CursoDetalle = ({ curso, inscrito, onClose, onInscribirse }) => {
  const v = VISUAL_MAP[curso?.id] || { icono: '📚', color: '#003366', categoria: 'Curso', tags: [], docente: '-', horario: '-', duracion: '-' };

  return (
    <div className="detalle-overlay" onClick={onClose}>
      <div className="detalle-modal" onClick={e => e.stopPropagation()}>

        {/* Banner */}
        <div className="detalle-banner" style={{ background: v.color }}>
          <span className="detalle-banner-emoji">{v.icono}</span>
          <button className="detalle-close" onClick={onClose}><IconClose /></button>
        </div>

        {/* Cuerpo */}
        <div className="detalle-body">
          <span className="detalle-chip">{v.categoria}</span>
          <h2 className="detalle-titulo">{curso.nombre}</h2>
          <div className="detalle-codigo">ID-{String(curso.id).padStart(3,'0')} · Cupo máximo: {curso.cupo_maximo} estudiantes</div>

          <p className="detalle-descripcion">{curso.descripcion}</p>

          <div className="detalle-info-grid">
            <div className="detalle-info-item">
              <div className="detalle-info-icon"><IconUser /></div>
              <div>
                <span className="detalle-info-label">Docente</span>
                <span className="detalle-info-value">{v.docente}</span>
              </div>
            </div>
            <div className="detalle-info-item">
              <div className="detalle-info-icon"><IconClock /></div>
              <div>
                <span className="detalle-info-label">Duración</span>
                <span className="detalle-info-value">{v.duracion}</span>
              </div>
            </div>
            <div className="detalle-info-item">
              <div className="detalle-info-icon"><IconCal /></div>
              <div>
                <span className="detalle-info-label">Horario</span>
                <span className="detalle-info-value">{v.horario}</span>
              </div>
            </div>
            <div className="detalle-info-item">
              <div className="detalle-info-icon"><IconGroup /></div>
              <div>
                <span className="detalle-info-label">Cupo</span>
                <span className="detalle-info-value">{curso.cupo_maximo} estudiantes</span>
              </div>
            </div>
          </div>

          <div className="detalle-tags">
            {v.tags.map(t => <span key={t} className="detalle-tag">{t}</span>)}
          </div>

          <div className="detalle-footer">
            <div className="detalle-precio-bloque">
              <div className="detalle-precio-label">Precio del curso</div>
              <div className="detalle-precio-valor">Bs. {curso.costo}</div>
              <div className="detalle-precio-usd">≈ ${(curso.costo / 7).toFixed(2)} USD</div>
            </div>

            {inscrito ? (
              <button className="btn-detalle-inscrito">
                <IconCheck /><span>Ya estás inscrito</span>
              </button>
            ) : (
              <button className="btn-detalle-inscribir" onClick={() => { onClose(); onInscribirse(curso); }}>
                <IconPlus /><span>Inscribirme ahora</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoDetalle;