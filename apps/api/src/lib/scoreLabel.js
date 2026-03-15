/**
 * Bands de score 0–100 → libellé qualitatif (aligné avec le frontend scoreTheme).
 * Utilisé pour stocker feedbackGlobal dans posture_history.
 */
const BANDS = [
  { min: 90, max: 100, label: "Excellent" },
  { min: 80, max: 89, label: "Très bien" },
  { min: 70, max: 79, label: "Bien" },
  { min: 55, max: 69, label: "Correct" },
  { min: 40, max: 54, label: "Fragile" },
  { min: 0, max: 39, label: "À retravailler" }
];

function normalizeScore(score) {
  if (score === undefined || score === null || score === "") return 0;
  if (typeof score !== "number" || Number.isNaN(score)) return 0;
  if (score > 0 && score <= 1) return Math.round(score * 100);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * @param {number} score - Score entre 0 et 100 (ou 0–1)
 * @returns {string} "Excellent" | "Très bien" | "Bien" | "Correct" | "Fragile" | "À retravailler"
 */
function getScoreLabel(score) {
  const value = normalizeScore(score);
  const band = BANDS.find((b) => value >= b.min && value <= b.max);
  return band ? band.label : BANDS[BANDS.length - 1].label;
}

module.exports = { getScoreLabel, normalizeScore };
