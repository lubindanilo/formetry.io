import React from "react";

const STEPS = [
  { num: 1, label: "Importer l'image" },
  { num: 2, label: "Confirmer la figure détectée" },
  { num: 3, label: "Voir le score" },
  { num: 4, label: "Sauvegarder l'analyse" },
];

export default function AnalyzeStepper({ currentStep }) {
  const step = Math.max(1, Math.min(4, currentStep));
  return (
    <nav className="analyze-stepper" aria-label="Étapes de l'analyse">
      <ol className="analyze-stepper-list">
        {STEPS.map(({ num, label }) => (
          <li
            key={num}
            className={`analyze-stepper-item ${num === step ? "active" : ""} ${num < step ? "done" : ""}`}
          >
            <span className="analyze-stepper-num">{num}</span>
            <span className="analyze-stepper-label">{label}</span>
            {num < 4 ? <span className="analyze-stepper-sep" aria-hidden /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
