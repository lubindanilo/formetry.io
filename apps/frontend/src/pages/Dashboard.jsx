import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getScoreLabel, getScoreColor } from "../components/pose/analysis/scoreTheme.js";
import CircularScore from "../components/pose/analysis/CircularScore.jsx";
import { useTranslation } from "react-i18next";
import { fetchJson } from "../lib/poseSandboxUtils.js";

export default function Dashboard() {
  const { user, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [showAllHistory, setShowAllHistory] = React.useState(false);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const history = user?.posture_history ?? [];
  const hasMoreHistory = history.length > 10;
  const displayedHistory = React.useMemo(() => {
    const reversed = [...history].reverse();
    return showAllHistory ? reversed : reversed.slice(0, 10);
  }, [history, showAllHistory]);
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

  async function handleDeleteAccount() {
    if (!window.confirm(t("dashboard.delete_account_confirm"))) return;
    try {
      await fetchJson("/api/auth/delete-account", {
        method: "DELETE",
      });
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      // Simple fallback : une alerte. On pourrait ajouter un message dédié dans l'UI si besoin.
      alert(err?.message || t("dashboard.delete_account_error"));
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <h2>
          {user?.displayName
            ? t("dashboard.greeting", { name: user.displayName })
            : t("dashboard.greeting_no_name")}
        </h2>
      </div>

      <div className="dashboard-stats card">
        <h3>{t("dashboard.level_title")}</h3>
        {averageScore != null ? (
          <div className="dashboard-level-circle">
            <CircularScore value={averageScore} />
          </div>
        ) : (
          <p className="muted">{t("dashboard.level_empty")}</p>
        )}
      </div>

      <div className="dashboard-actions">
        <Link to="/analyze" className="btn btn-primary">
          {t("common.new_analysis")}
        </Link>
      </div>

      <div className="dashboard-history card">
        <h3>{t("dashboard.history_title")}</h3>
        {displayedHistory.length === 0 ? (
          <p className="muted">{t("dashboard.history_empty")}</p>
        ) : (
          <>
            <ul className="history-list">
              {displayedHistory.map((entry, i) => (
                <li key={entry.date + (entry.analysisId || "") + i} className="history-item">
                  <span className="history-date">
                    {new Date(entry.date).toLocaleDateString(i18n.language || undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
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
                    {entry.feedbackGlobal ? t(entry.feedbackGlobal) : "—"}
                  </span>
                  {entry.scoreGlobal != null && (
                    <span className="history-score">{Math.round(entry.scoreGlobal)}/100</span>
                  )}
                  {entry.analysisId && (
                    <Link
                      to={`/analysis/${entry.analysisId}`}
                      className="btn btn-link history-view"
                    >
                      {t("dashboard.history_view", "Voir")}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {hasMoreHistory && (
              <button
                type="button"
                className="btn btn-link history-toggle"
                onClick={() => setShowAllHistory((v) => !v)}
              >
                {showAllHistory
                  ? t("dashboard.history_show_less", "Voir moins")
                  : t("dashboard.history_show_all", "Tout voir")}
              </button>
            )}
          </>
        )}
      </div>

      <div className="dashboard-progression card">
        <h3>{t("dashboard.progression_title")}</h3>
        {byFigure.size === 0 ? (
          <p className="muted">{t("dashboard.progression_empty")}</p>
        ) : (
          <div className="progression-by-figure">
            {Array.from(byFigure.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([figure, entries]) => {
                const scores = entries
                  .map((e) => (typeof e.scoreGlobal === "number" ? e.scoreGlobal : null))
                  .filter((s) => s !== null);
                return (
                  <div key={figure} className="progression-figure-block">
                    <h4 className="progression-figure-title">{formatFigureLabel(figure)}</h4>
                    {scores.length === 0 ? (
                      <p className="muted progression-figure-empty">
                        {t("dashboard.progression_need_two")}
                      </p>
                    ) : (
                      <>
                        {scores.length === 1 ? (
                          <p className="muted progression-figure-empty">
                            {t("dashboard.progression_one_analysis", {
                              score: scores[0],
                            })}
                          </p>
                        ) : null}
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
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <div className="dashboard-delete-account">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button
            type="button"
            className="btn"
            onClick={handleLogout}
          >
            {t("header.logout")}
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleDeleteAccount}
          >
            {t("dashboard.delete_account_button")}
          </button>
        </div>
      </div>
    </section>
  );
}
