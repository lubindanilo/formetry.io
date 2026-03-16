import React from "react";
import { useTranslation } from "react-i18next";

const STEPS = [
  { num: 1, labelKey: "analyze.step_import" },
  { num: 2, labelKey: "analyze.step_confirm" },
  { num: 3, labelKey: "analyze.step_score" },
  { num: 4, labelKey: "analyze.step_save" },
];

export default function AnalyzeStepper({ currentStep }) {
  const { t } = useTranslation();
  const step = Math.max(1, Math.min(4, currentStep));
  return (
    <nav className="analyze-stepper" aria-label={t("analyze.aria_steps")}>
      <ol className="analyze-stepper-list">
        {STEPS.map(({ num, labelKey }) => (
          <li
            key={num}
            className={`analyze-stepper-item ${num === step ? "active" : ""} ${num < step ? "done" : ""}`}
          >
            <span className="analyze-stepper-num">{num}</span>
            <span className="analyze-stepper-label">{t(labelKey)}</span>
            {num < 4 ? <span className="analyze-stepper-sep" aria-hidden /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
