export const PERMISSIONS = {
  USUARIOS_GESTIONAR:      'usuarios:gestionar',
  ROLES_GESTIONAR:         'roles:gestionar',
  CURSOS_GESTIONAR:        'cursos:gestionar',
  CURSOS_VER:              'cursos:ver',
  INSCRIPCIONES_GESTIONAR: 'inscripciones:gestionar',
  PAGOS_VER:               'pagos:ver',
  REPORTES_VER:            'reportes:ver',
  AUDITORIA_VER:           'auditoria:ver',
  USUARIO_ESTUDIANTE:      'usuario:estudiante',
  USUARIO_DOCENTE:         'usuario:docente',
};

export const ROLES = {
  ESTUDIANTE:      'ESTUDIANTE',
  DOCENTE:         'DOCENTE',
  ADMIN_CUENTAS:   'ADMIN_CUENTAS',
  ADMIN_SEGURIDAD: 'ADMIN_SEGURIDAD',
  ADMIN_CURSOS:    'ADMIN_CURSOS',
  ADMIN_PAGOS:     'ADMIN_PAGOS',
  ADMIN_REPORTES:  'ADMIN_REPORTES',
  // Legacy — kept for backward compatibility
  ADMINISTRADOR:   'ADMINISTRADOR',
};

export const ADMIN_ROLES = [
  ROLES.ADMIN_CUENTAS,
  ROLES.ADMIN_SEGURIDAD,
  ROLES.ADMIN_CURSOS,
  ROLES.ADMIN_PAGOS,
  ROLES.ADMIN_REPORTES,
  ROLES.ADMINISTRADOR,
];

export const getRolPath = (rol) => {
  switch (rol) {
    case ROLES.ADMIN_CUENTAS:
      return '/admin/cuentas';
    case ROLES.ADMIN_SEGURIDAD:
    case ROLES.ADMIN_CURSOS:
    case ROLES.ADMIN_PAGOS:
    case ROLES.ADMIN_REPORTES:
    case ROLES.ADMINISTRADOR:
      return '/admin';
    case ROLES.DOCENTE:
      return '/docente';
    default:
      return '/cursos';
  }
};

// Backward-compatible alias
export const getRolePath = getRolPath;
