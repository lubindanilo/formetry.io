/**
 * Thème visuel basé sur le score (0–100).
 * Couleur et libellé qualitatif pour un affichage cohérent (barres, jauge, texte).
 */

const BANDS = [
  { min: 80, max: 100, color: "#22c55e", colorLight: "#4ade80", label: "Très bien" },
  { min: 60, max: 79, color: "#84cc16", colorLight: "#a3e635", label: "Bien" },
  { min: 40, max: 59, color: "#eab308", colorLight: "#facc15", label: "Moyen" },
  { min: 0, max: 39, color: "#ef4444", colorLight: "#f87171", label: "À améliorer" },
];

/** Score maximum utilisé pour les bandes */
export const SCORE_MAX = 100;

function findBand(score) {
  const value = Math.max(0, Math.min(SCORE_MAX, Number(score)));
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
 * Retourne le libellé qualitatif du score (ex. "Très bien").
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
