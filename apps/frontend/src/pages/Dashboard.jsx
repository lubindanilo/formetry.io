import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getScoreLabel, getScoreColor } from "../components/pose/analysis/scoreTheme.js";

export default function Dashboard() {
  const { user, refreshMe } = useAuth();

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const history = user?.posture_history ?? [];
  const recent = [...history].reverse().slice(0, 10);
  const globalScores = history
    .map((h) => (typeof h.scoreGlobal === "number" ? h.scoreGlobal : null))
    .filter((s) => s !== null);
  const averageScore =
    globalScores.length > 0
      ? Math.round(
          globalScores.reduce((a, b) => a + b, 0) / globalScores.length
        )
      : null;
  const levelLabel = averageScore != null ? getScoreLabel(averageScore) : null;
  const levelColor = averageScore != null ? getScoreColor(averageScore) : null;

  function formatFigureLabel(label) {
    if (!label || label === "—") return "—";
    return label
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Grouper l'historique par figure (userLabel) pour la progression
  const byFigure = React.useMemo(() => {
    const map = new Map();
    for (const entry of history) {
      const figure = (entry.userLabel || "").trim() || "—";
      if (!map.has(figure)) map.set(figure, []);
      map.get(figure).push(entry);
    }
    // Trier chaque liste par date (anciennes d'abord)
    for (const entries of map.values()) {
      entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return map;
  }, [history]);

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <h2>
          Bonjour{user?.displayName ? ` ${user.displayName}` : ""}
        </h2>
        <p className="muted">
          {user?.email}
        </p>
      </div>

      <div className="dashboard-stats card">
        <h3>Votre niveau</h3>
        {levelLabel != null ? (
          <p className="dashboard-level" style={{ color: levelColor ?? undefined }}>
            {levelLabel}
          </p>
        ) : (
          <p className="muted">Effectuez une analyse pour voir votre niveau global.</p>
        )}
        {averageScore != null && (
          <p className="muted">Score moyen : {averageScore}/100 </p>
        )}
      </div>

      <div className="dashboard-actions">
        <Link to="/analyze" className="btn btn-primary">
          Nouvelle analyse
        </Link>
      </div>

      <div className="dashboard-history card">
        <h3>Dernières analyses</h3>
        {recent.length === 0 ? (
          <p className="muted">Aucune analyse pour le moment. Lancez une analyse pour enregistrer votre progression.</p>
        ) : (
          <ul className="history-list">
            {recent.map((entry, i) => (
              <li key={entry.date + (entry.analysisId || "") + i} className="history-item">
                <span className="history-date">
                  {new Date(entry.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="history-figure">{entry.userLabel || "—"}</span>
                <span
                  className="history-feedback"
                  style={{
                    color:
                      entry.feedbackGlobal
                        ? getScoreColor(
                            entry.scoreGlobal != null ? entry.scoreGlobal : 0
                          )
                        : undefined,
                  }}
                >
                  {entry.feedbackGlobal || "—"}
                </span>
                {entry.scoreGlobal != null && (
                  <span className="history-score">{Math.round(entry.scoreGlobal)}/100</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dashboard-progression card">
        <h3>Progression par figure</h3>
        {byFigure.size === 0 ? (
          <p className="muted">Aucune analyse pour le moment. Lancez une analyse pour voir votre progression par figure.</p>
        ) : (
          <div className="progression-by-figure">
            {Array.from(byFigure.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([figure, entries]) => {
                const scores = entries
                  .map((e) => (typeof e.scoreGlobal === "number" ? e.scoreGlobal : null))
                  .filter((s) => s !== null);
                const hasTrend = scores.length >= 2;
                return (
                  <div key={figure} className="progression-figure-block">
                    <h4 className="progression-figure-title">{formatFigureLabel(figure)}</h4>
                    {!hasTrend ? (
                      <p className="muted progression-figure-empty">
                        {scores.length === 1
                          ? `1 analyse : ${scores[0]}/100`
                          : "Au moins deux analyses pour voir la tendance."}
                      </p>
                    ) : (
                      <div className="progression-chart">
                        {scores.map((s, i) => (
                          <div
                            key={i}
                            className="progression-bar-wrap"
                            title={`${s}/100`}
                          >
                            <div
                              className="progression-bar"
                              style={{
                                width: `${s}%`,
                                backgroundColor: getScoreColor(s),
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}
