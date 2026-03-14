import React from "react";
import { DIMENSION_METRICS, GLOBAL_KEY, GLOBAL_LABEL, SCORE_MAX } from "./metricConfig.js";
import CircularScore from "./CircularScore.jsx";
import MetricBar from "./MetricBar.jsx";

/**
 * Dashboard d'affichage des résultats d'analyse technique.
 * Reçoit l'objet scores (global, body_line, symmetry, lockout_extension) et affiche
 * la jauge globale + les barres par dimension.
 */
export default function AnalysisDashboard({ scores }) {
  if (!scores || typeof scores !== "object") return null;

  const globalScore = scores[GLOBAL_KEY];
  const hasGlobal = typeof globalScore === "number" && !Number.isNaN(globalScore);

  return (
    <div className="analysis-dashboard">
      {hasGlobal ? (
        <CircularScore value={globalScore} max={SCORE_MAX} size={160} strokeWidth={10} />
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "#f2f2f2" }}>
          {GLOBAL_LABEL}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {DIMENSION_METRICS.map(({ key, label }) => {
            const value = scores[key];
            if (typeof value !== "number" || Number.isNaN(value)) return null;
            return <MetricBar key={key} label={label} value={value} max={SCORE_MAX} />;
          })}
        </div>
      </div>
    </div>
  );
}
