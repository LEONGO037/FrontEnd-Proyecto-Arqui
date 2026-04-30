const EMAIL_UCB_REGEX = /^[A-Z0-9._%+-]+@ucb\.edu\.bo$/i;
const NOMBRE_REGEX = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ ]{3,}$/;
const PASSWORD_STRONG_REGEX = /^(?=.*[a-zñáéíóú])(?=.*[A-ZÑÁÉÍÓÚ])(?=.*\d)(?=.*[@$!%*?&_\-#]).{12,}$/;

const normalizeValue = (value) => (typeof value === 'string' ? value.trim() : value);

const toNumberOrNaN = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
};

const rules = {
  required: (value, message) => {
    const normalized = normalizeValue(value);
    if (normalized === undefined || normalized === null || normalized === '') {
      return message || 'Este campo es obligatorio';
    }
    return null;
  },

  institutionalEmail: (value, message) => {
    const normalized = normalizeValue(value || '');
    if (!EMAIL_UCB_REGEX.test(normalized)) {
      return message || 'El correo debe ser institucional (@ucb.edu.bo)';
    }
    return null;
  },

  strongPassword: (value, message) => {
    const normalized = String(value || '');
    if (!PASSWORD_STRONG_REGEX.test(normalized)) {
      return message || 'La contraseña debe tener mínimo 12 caracteres, mayúscula, minúscula, número y carácter especial (@$!%*?&_-#)';
    }
    return null;
  },

  minLength: (value, min, message) => {
    const normalized = String(value || '').trim();
    if (normalized.length < min) {
      return message || `Debe tener al menos ${min} caracteres`;
    }
    return null;
  },

  positiveNumber: (value, message) => {
    const numberValue = toNumberOrNaN(value);
    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      return message || 'Debe ser un número mayor que 0';
    }
    return null;
  },

  positiveInteger: (value, message) => {
    const numberValue = toNumberOrNaN(value);
    if (!Number.isInteger(numberValue) || numberValue <= 0) {
      return message || 'Debe ser un entero mayor que 0';
    }
    return null;
  },

  gradeRange: (value, message) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = toNumberOrNaN(value);
    if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 100) {
      return message || 'La nota debe estar entre 0 y 100';
    }

    return null;
  },
};

const schemas = {
  login: [
    {
      field: 'email',
      validators: [
        (value) => rules.required(value, 'El correo es obligatorio'),
        (value) => rules.institutionalEmail(value),
      ],
    },
    {
      field: 'password',
      validators: [
        (value) => rules.required(value, 'La contraseña es obligatoria'),
      ],
    },
  ],

  register: [
    {
      field: 'nombre',
      validators: [
        (value) => rules.required(value, 'El nombre es obligatorio'),
      ],
    },
    {
      field: 'apellido_paterno',
      validators: [
        (value) => rules.required(value, 'El apellido paterno es obligatorio'),
      ],
    },
    {
      field: 'email',
      validators: [
        (value) => rules.required(value, 'El correo es obligatorio'),
        (value) => rules.institutionalEmail(value),
      ],
    },
    {
      field: 'password',
      validators: [
        (value) => rules.required(value, 'La contraseña es obligatoria'),
        (value) => rules.strongPassword(value),
      ],
    },
    {
      field: 'confirmPassword',
      validators: [
        (value) => rules.required(value, 'Debes confirmar la contraseña'),
      ],
    },
  ],

  crearCurso: [
    {
      field: 'nombre',
      validators: [
        (value) => rules.required(value, 'El nombre del curso es obligatorio'),
      ],
    },
    {
      field: 'descripcion',
      validators: [
        (value) => rules.required(value, 'La descripción del curso es obligatoria'),
      ],
    },
    {
      field: 'costo',
      validators: [
        (value) => rules.required(value, 'El costo es obligatorio'),
        (value) => rules.positiveNumber(value, 'El costo debe ser mayor que 0'),
      ],
    },
    {
      field: 'cupo_maximo',
      validators: [
        (value) => rules.required(value, 'El cupo máximo es obligatorio'),
        (value) => rules.positiveInteger(value, 'El cupo máximo debe ser un entero mayor que 0'),
      ],
    },
    {
      field: 'minimo_estudiantes',
      validators: [
        (value) => rules.required(value, 'El mínimo de estudiantes es obligatorio'),
        (value) => rules.positiveInteger(value, 'El mínimo de estudiantes debe ser un entero mayor que 0'),
      ],
    },
  ],
};

export const validateForm = (schemaName, data) => {
  const schema = schemas[schemaName] || [];
  const errors = {};

  for (const fieldConfig of schema) {
    const value = data[fieldConfig.field];

    for (const validator of fieldConfig.validators) {
      const error = validator(value, data);
      if (error) {
        errors[fieldConfig.field] = error;
        break;
      }
    }
  }

  if (schemaName === 'register' && !errors.confirmPassword) {
    const password = String(data.password || '');
    const confirmPassword = String(data.confirmPassword || '');
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
  }

  if (schemaName === 'crearCurso' && !errors.minimo_estudiantes && !errors.cupo_maximo) {
    const minimo = Number(data.minimo_estudiantes);
    const cupo = Number(data.cupo_maximo);
    if (Number.isInteger(minimo) && Number.isInteger(cupo) && minimo > cupo) {
      errors.minimo_estudiantes = 'El mínimo de estudiantes no puede ser mayor al cupo máximo';
    }
  }

  const firstError = Object.values(errors)[0] || null;
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
};

export const validateNotas = (notas = []) => {
  for (const nota of notas) {
    const error = rules.gradeRange(nota?.notaFinal);
    if (error) {
      return {
        isValid: false,
        error: `Nota inválida para ${nota?.nombre || 'estudiante'}. ${error}`,
      };
    }
  }

  return { isValid: true, error: null };
};

export const validationPatterns = {
  emailUcb: EMAIL_UCB_REGEX,
  strongPassword: PASSWORD_STRONG_REGEX,
};

export const validateNombre = (value, label = 'Este campo') => {
  const v = (value || '').trim();
  if (!v) return `${label} es obligatorio`;
  if (v.length < 3) return `${label} debe tener al menos 3 caracteres`;
  if (/\d/.test(v)) return `${label} no puede contener números`;
  if (!NOMBRE_REGEX.test(v)) return `${label} solo puede contener letras y espacios`;
  return null;
};

export const validateInstitutionalEmail = (email) => {
  const normalized = normalizeValue(email || '');
  return EMAIL_UCB_REGEX.test(normalized);
};

export const getPasswordRequirements = (password) => {
  const passwordValue = String(password || '');

  const checks = [
    {
      key: 'length',
      label: 'Mínimo 12 caracteres',
      valid: passwordValue.length >= 12,
    },
    {
      key: 'uppercase',
      label: 'Al menos una letra mayúscula',
      valid: /[A-Z]/.test(passwordValue),
    },
    {
      key: 'lowercase',
      label: 'Al menos una letra minúscula',
      valid: /[a-z]/.test(passwordValue),
    },
    {
      key: 'number',
      label: 'Al menos un número',
      valid: /\d/.test(passwordValue),
    },
    {
      key: 'special',
      label: 'Al menos un carácter especial (@$!%*?&_-#)',
      valid: /[@$!%*?&_\-#]/.test(passwordValue),
    },
  ];

  return {
    checks,
    allValid: checks.every((check) => check.valid),
  };
};
