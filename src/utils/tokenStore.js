// Token stored in a cookie (SameSite=Strict, 2h TTL matching JWT expiry).
// clearToken() also wipes localStorage and sessionStorage so no auth data lingers.
const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7200; // seconds — matches JWT expiresIn: '2h'

export const setToken = (t) => {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(t)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
};

export const getToken = () => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const clearToken = () => {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
  localStorage.clear();
  sessionStorage.clear();
};

export const hasToken = () => getToken() !== null;

// Decodes the JWT payload (no signature verification — server verifies on each request).
export const decodePayload = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }
    return payload;
  } catch {
    clearToken();
    return null;
  }
};
