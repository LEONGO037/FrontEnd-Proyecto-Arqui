// theme.js — single source of truth for College Nexus design tokens.
// Import and call injectTheme() once in main.jsx.

export const COLORS = {
  primary:      '#003366',
  primaryHover: '#004d99',
  accent:       '#8cc63f',
  danger:       '#dc2626',
  success:      '#16a34a',
  warning:      '#f59e0b',

  textPrimary:   '#1e293b',
  textSecondary: '#475569',
  textMuted:     '#94a3b8',

  bgPage:  '#f5f7fa',
  bgCard:  '#ffffff',
  bgInput: '#ffffff',

  border:      '#d1d5db',
  borderFocus: '#003366',
};

export const RADII = {
  sm: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
};

export const SHADOWS = {
  card:  '0 4px 20px rgba(0,51,102,0.06)',
  modal: '0 20px 60px rgba(0,51,102,0.18)',
};

// Injected as a <style> tag so it overrides browser dark-mode defaults
// on all native form controls, no matter which component renders them.
const GLOBAL_FORM_CSS = `
  /* ── Force light theme on all form controls ── */
  input,
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  input[type="date"],
  input[type="search"],
  textarea,
  select {
    background-color: ${COLORS.bgInput} !important;
    color: ${COLORS.textPrimary} !important;
    color-scheme: light;
  }

  input::placeholder,
  textarea::placeholder {
    color: ${COLORS.textMuted} !important;
    opacity: 1;
  }

  /* Options in <select> dropdowns */
  select option {
    background-color: ${COLORS.bgCard} !important;
    color: ${COLORS.textPrimary} !important;
  }

  /* ── Fix Vite template button dark defaults ── */
  button {
    background-color: transparent;
    color: inherit;
    border-color: transparent;
  }
`;

let injected = false;

export function injectTheme() {
  if (injected || document.getElementById('cn-global-theme')) return;
  injected = true;
  const el = document.createElement('style');
  el.id = 'cn-global-theme';
  el.textContent = GLOBAL_FORM_CSS;
  document.head.appendChild(el);
}
