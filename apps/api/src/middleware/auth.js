const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "auth_token";

/**
 * Lit le JWT depuis le cookie HttpOnly (ou header Authorization Bearer pour les appels API).
 * Si valide, attache req.user = { id: userId } (id = _id MongoDB en string).
 * N'attache rien si absent ou invalide (pas d'erreur 401 automatique).
 */
function authOptional(req, res, next) {
  let token = null;
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7);
  }
  if (!token) return next();

  if (!JWT_SECRET) {
    console.warn("[auth] JWT_SECRET not set, skipping verification");
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next();
  }
}

/**
 * Comme authOptional mais renvoie 401 si non authentifié.
 */
function authRequired(req, res, next) {
  authOptional(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    next();
  });
}

module.exports = { authOptional, authRequired, COOKIE_NAME };
