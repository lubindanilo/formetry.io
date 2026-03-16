/**
 * Thème visuel basé sur le score (0–100).
 * Couleur et libellé qualitatif pour un affichage cohérent (barres, jauge, texte).
 */

const BANDS = [
  { min: 90, max: 100, color: "#047857", colorLight: "#059669", label: "score.excellent" },
  { min: 80, max: 89, color: "#16a34a", colorLight: "#22c55e", label: "score.very_good" },
  { min: 70, max: 79, color: "#65a30d", colorLight: "#84cc16", label: "score.good" },
  { min: 55, max: 69, color: "#ea580c", colorLight: "#f97316", label: "score.fair" },
  { min: 40, max: 54, color: "#c2410c", colorLight: "#ea580c", label: "score.fragile" },
  { min: 0, max: 39, color: "#b91c1c", colorLight: "#dc2626", label: "score.to_improve" },
];

/** Score maximum utilisé pour les bandes */
export const SCORE_MAX = 100;

/**
 * Normalise toute valeur reçue en score 0–100.
 * Gère : échelle 0–1 (ex. 0.8 → 80), "80/100", "80 %", "80,0", undefined/null/objet/string vide.
 */
export function normalizeScore(score) {
  if (score === undefined || score === null || score === "") {
    return 0;
  }
  if (typeof score === "object" || typeof score === "boolean") {
    return 0;
  }
  if (typeof score === "number") {
    if (Number.isNaN(score)) return 0;
    if (score > 0 && score <= 1) return Math.round(score * 100);
    return Math.max(0, Math.min(SCORE_MAX, Math.round(score)));
  }
  const s = String(score).trim();
  if (s === "") return 0;
  const match = s.match(/^(\d+[,.]?\d*)\s*\/\s*100$/) || s.match(/^(\d+[,.]?\d*)\s*%?$/) || s.match(/^(\d+[,.]?\d*)/);
  const num = match ? parseFloat(match[1].replace(",", ".")) : NaN;
  if (Number.isNaN(num)) return 0;
  if (num > 0 && num <= 1) return Math.round(num * 100);
  return Math.max(0, Math.min(SCORE_MAX, Math.round(num)));
}

function findBand(score) {
  const value = normalizeScore(score);
  return BANDS.find((b) => value >= b.min && value <= b.max) || BANDS[BANDS.length - 1];
}

/**
 * Retourne la couleur principale associée au score (barres, texte).
 * @param {number} score - Score entre 0 et 100
 * @returns {string} Couleur hex
 */
export function getScoreColor(score) {
  return findBand(score).color;
}

/**
 * Retourne une couleur plus claire (dégradés, surbrillance).
 * @param {number} score - Score entre 0 et 100
 * @returns {string} Couleur hex
 */
export function getScoreColorLight(score) {
  return findBand(score).colorLight;
}

/**
 * Retourne la clé i18n du libellé qualitatif du score (ex. "score.very_good").
 * @param {number} score - Score entre 0 et 100
 * @returns {string}
 */
export function getScoreLabel(score) {
  return findBand(score).label;
}

/**
 * Couleur pour la partie non remplie des barres / jauge.
 * @returns {string}
 */
export function getTrackColor() {
  return "rgba(255,255,255,0.12)";
}
