// ===========================================================================
// Configuración de reCAPTCHA v2 (checkbox "No soy un robot") — Punto 1.4
//
// Site key viene del .env (VITE_RECAPTCHA_SITE_KEY).
// El widget se renderiza con <ReCAPTCHA /> del paquete react-google-recaptcha.
// El token se obtiene cuando el usuario marca el checkbox.
// ===========================================================================

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

export const captchaConfigurado = () => !!RECAPTCHA_SITE_KEY;
