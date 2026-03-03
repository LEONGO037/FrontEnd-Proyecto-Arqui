// utils/roleUtils.js
// Constantes de roles (tal como los retorna el backend)
export const ROLES = {
    ESTUDIANTE: 'ESTUDIANTE',
    ADMINISTRADOR: 'ADMINISTRADOR',
    DOCENTE: 'DOCENTE',
};

/**
 * Retorna la ruta de destino según el rol del usuario.
 */
export const getRolePath = (rol) => {
    switch (rol) {
        case ROLES.ADMINISTRADOR:
            return '/admin';
        case ROLES.DOCENTE:
            return '/docente';
        default:
            return '/cursos';
    }
};
