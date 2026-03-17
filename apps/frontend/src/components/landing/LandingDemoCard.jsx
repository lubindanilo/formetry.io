import React from "react";
import CircularScore from "../pose/analysis/CircularScore.jsx";
import MetricBar from "../pose/analysis/MetricBar.jsx";
import { DIMENSION_METRICS } from "../pose/analysis/metricConfig.js";
import { useTranslation } from "react-i18next";

/** Données mock pour la démo landing (L-Sit, score 80). */
const MOCK_SCORES = {
  global: 86,
  body_line: 84,
  symmetry: 79,
  lockout_extension: 96,
};

const MOCK_IMPROVEMENTS_KEYS = [
  "landing.demo_improvement_1",
  "landing.demo_improvement_2",
  "landing.demo_improvement_3",
];

/**
 * Carte démo du résultat d'analyse pour la landing (hero).
 * Affiche un faux résultat L-Sit avec score, métriques et conseils.
 */
export default function LandingDemoCard() {
  const { t } = useTranslation();
  return (
    <div className="landing-demo-card">
      <div className="landing-demo-card__image-wrap">
        <div className="landing-demo-card__image-placeholder">
          <img
            src="/landing.png"
            alt="Exemple d'analyse de posture en calisthénie"
            className="landing-demo-card__image"
          />
        </div>
      </div>

      <p className="landing-demo-card__figure">
        {t("landing.demo_detected_figure")}: <strong>Human Flag</strong>
      </p>

      <div className="landing-demo-card__analysis">
        <CircularScore value={MOCK_SCORES.global} size={120} strokeWidth={9} />
        <div className="landing-demo-card__metrics">
          {DIMENSION_METRICS.map(({ key, label }) => (
            <MetricBar key={key} label={t(label)} value={MOCK_SCORES[key]} />
          ))}
        </div>
      </div>

      <div className="landing-demo-card__feedback">
        <p className="landing-demo-card__feedback-title">
          {t("landing.demo_improvements_title")}
        </p>
        <ul className="landing-demo-card__list">
          {MOCK_IMPROVEMENTS_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
