import React from "react";
import { getScoreColor, getScoreLabel, getTrackColor } from "./scoreTheme.js";

/**
 * Une métrique sous forme de barre horizontale + score + indicateur de statut.
 * Présentation uniquement : label, value, max.
 */
export default function MetricBar({ label, value, max = 100 }) {
  const score = Math.max(0, Math.min(max, Number(value)));
  const pct = max > 0 ? (score / max) * 100 : 0;
  const color = getScoreColor(score);
  const trackColor = getTrackColor();
  const isSuccess = score >= 60;

  return (
    <div className="analysis-metric-bar" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: "0.95rem", color: "#f2f2f2", fontWeight: 500 }}>{label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", color: "#f2f2f2" }}>
          {isSuccess ? (
            <span style={{ color }} aria-hidden="true">
              ✓
            </span>
          ) : null}
          <span className="mono">{Math.round(score)}/100</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${getScoreLabel(score)}`}
        style={{
          height: 8,
          borderRadius: 4,
          background: trackColor,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 4,
            transition: "width 0.4s ease-out",
          }}
        />
      </div>
    </div>
  );
}
