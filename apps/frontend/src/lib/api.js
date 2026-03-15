/**
 * Appels API avec credentials pour envoyer les cookies HttpOnly (JWT).
 */
export async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, credentials: "include" });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
