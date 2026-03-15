import React from "react";
import CircularScore from "../pose/analysis/CircularScore.jsx";
import MetricBar from "../pose/analysis/MetricBar.jsx";
import { DIMENSION_METRICS } from "../pose/analysis/metricConfig.js";

/** Données mock pour la démo landing (L-Sit, score 80). */
const MOCK_SCORES = {
  global: 80,
  body_line: 68,
  symmetry: 94,
  lockout_extension: 83,
};

const MOCK_IMPROVEMENTS = [
  "Remonte les talons jusqu'à la ligne des hanches.",
  "Tendre au maximum la jambe gauche.",
  "Tendre au maximum la jambe droite.",
];

const MOCK_STRONG = "Bonne symétrie générale";

/**
 * Carte démo du résultat d'analyse pour la landing (hero).
 * Affiche un faux résultat L-Sit avec score, métriques et conseils.
 */
export default function LandingDemoCard() {
  return (
    <div className="landing-demo-card">
      <div className="landing-demo-card__header">Calisthenics AI</div>

      <div className="landing-demo-card__image-wrap">
        <div className="landing-demo-card__image-placeholder">
          <span className="landing-demo-card__image-label">L-Sit</span>
          <svg
            className="landing-demo-card__skeleton"
            viewBox="0 0 200 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            {/* Skeleton overlay: head, spine, limbs */}
            <circle cx="100" cy="28" r="8" stroke="rgba(147, 197, 253, 0.9)" strokeWidth="2" fill="none" />
            <path d="M100 36 L100 70 L100 95" stroke="rgba(147, 197, 253, 0.9)" strokeWidth="2" fill="none" />
            <path d="M72 45 L100 55 L128 45" stroke="rgba(147, 197, 253, 0.9)" strokeWidth="2" fill="none" />
            <path d="M100 55 L85 95 L75 130" stroke="rgba(147, 197, 253, 0.9)" strokeWidth="2" fill="none" />
            <path d="M100 55 L115 95 L125 130" stroke="rgba(147, 197, 253, 0.9)" strokeWidth="2" fill="none" />
            <path d="M100 95 L75 95 L55 120" stroke="rgba(147, 197, 253, 0.9)" strokeWidth="2" fill="none" />
            <path d="M100 95 L125 95 L145 120" stroke="rgba(147, 197, 253, 0.9)" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="landing-demo-card__badge">
          <span className="landing-demo-card__badge-icon" aria-hidden>✓</span>
          <span>Aligné pour la mesure</span>
        </div>
      </div>

      <p className="landing-demo-card__figure">
        Figure détectée: <strong>L-Sit</strong>
      </p>

      <div className="landing-demo-card__analysis">
        <CircularScore value={MOCK_SCORES.global} size={140} strokeWidth={10} />
        <div className="landing-demo-card__metrics">
          {DIMENSION_METRICS.map(({ key, label }) => (
            <MetricBar key={key} label={label} value={MOCK_SCORES[key]} />
          ))}
        </div>
      </div>

      <div className="landing-demo-card__feedback">
        <p className="landing-demo-card__feedback-title">À corriger en priorité</p>
        <ul className="landing-demo-card__list">
          {MOCK_IMPROVEMENTS.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
        <p className="landing-demo-card__feedback-title">Point fort:</p>
        <ul className="landing-demo-card__list landing-demo-card__list--strong">
          <li>{MOCK_STRONG}</li>
        </ul>
      </div>
    </div>
  );
}
