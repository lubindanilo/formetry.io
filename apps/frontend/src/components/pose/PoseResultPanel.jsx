import React from "react";
import { useNavigate } from "react-router-dom";
import { round4 } from "../../lib/poseSandboxUtils.js";
import AnalysisDashboard from "./analysis/AnalysisDashboard.jsx";
import { useTranslation } from "react-i18next";

/** Afficher Confidence, analysisId, s3Key*, Scores debug (debug). */
const SHOW_RESULT_DEBUG = false;

/** Message de warning qu'on ne souhaite pas afficher (angle caméra / profil). */
const HIDDEN_WARNING_CAMERA_ANGLE =
  "Angle caméra: essaie plutôt un profil net (de côté). Pour Planche/L-Sit/Levers/Elbow lever/Human flag, le profil est beaucoup plus fiable.";

export default function PoseResultPanel({
  classify,
  flowError,
  userLabel,
  setUserLabel,
  supportedPoses,
  confirmLabel,
  confirmStatus,
  confirmError,
  techniqueScore,
  analysisId,
  isLoggedIn,
  savedToDashboard,
  onSaveToDashboard,
  saveStatus,
  saveError,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      {flowError ? (
        <p className="error">{t("poseResult.flow_error", { message: flowError })}</p>
      ) : null}

      {!classify ? null : (
        <div style={{ display: "grid", gap: 10 }}>
          <div className="muted">
            <div
              className="pose-detected-figure"
              style={{
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                fontWeight: 500,
              }}
            >
              {t("poseResult.detected_figure", { pose: classify.pose })}
            </div>
            {SHOW_RESULT_DEBUG ? (
              <>
                <div>
                  Confidence: <span className="mono">{round4(classify.confidence)}</span>
                </div>
                <div>
                  analysisId: <span className="mono">{classify.analysisId}</span>
                </div>
                <div>
                  s3KeyImage: <span className="mono">{classify.s3KeyImage}</span>
                </div>
                <div>
                  s3KeyResult: <span className="mono">{classify.s3KeyResult}</span>
                </div>
              </>
            ) : null}
          </div>

          {Array.isArray(classify.warnings) &&
          classify.warnings.filter((w) => w !== HIDDEN_WARNING_CAMERA_ANGLE).length > 0 ? (
            <ul className="list">
              {classify.warnings
                .filter((w) => w !== HIDDEN_WARNING_CAMERA_ANGLE)
                .map((w, i) => (
                  <li key={`${w}-${i}`} className="row" style={{ gridTemplateColumns: "1fr" }}>
                    <span className="mono">{w}</span>
                  </li>
                ))}
            </ul>
          ) : null}

          {SHOW_RESULT_DEBUG && classify.scores ? (
            <details>
              <summary className="muted">Scores debug</summary>
              <pre className="mono" style={{ whiteSpace: "pre-wrap", margin: 0, marginTop: 8 }}>
                {JSON.stringify(classify.scores, null, 2)}
              </pre>
            </details>
          ) : null}

          <div style={{ display: "grid", gap: 8 }}>
            <label className="muted" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={userLabel}
                onChange={(e) => setUserLabel(e.target.value)}
                disabled={confirmStatus === "confirming"}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #2a2a2e",
                  background: "#0f0f11",
                  color: "#f2f2f2",
                }}
              >
                <option value="">{t("poseResult.modifier_option")}</option>
                {supportedPoses.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="btn"
              onClick={confirmLabel}
              disabled={!userLabel || confirmStatus === "confirming"}
              style={{
                fontSize: "1rem",
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                fontWeight: 600,
              }}
            >
              {confirmStatus === "confirming"
                ? t("poseResult.confirming")
                : t("poseResult.confirm_button")}
            </button>

            {confirmError ? (
              <p className="error">
                {t("poseResult.confirm_error", { message: confirmError })}
              </p>
            ) : null}
            {confirmStatus === "done" ? (
              <>
                {techniqueScore?.scores ? (
                  <div style={{ marginTop: 8 }}>
                    <p
                      style={{
                        marginBottom: 8,
                        color: "#fff",
                        fontSize: "1.05rem",
                        fontWeight: 500,
                      }}
                    >
                      {t("poseResult.analysis_result_title")}
                    </p>
                    <AnalysisDashboard scores={techniqueScore.scores} improvements={techniqueScore.improvements?.map((i) => i.message || "").filter(Boolean)} />
                    {Array.isArray(techniqueScore.improvements) && techniqueScore.improvements.length > 0 ? (
                      <div style={{ marginTop: 12 }}>
                        <p
                          className="pose-improvements-title"
                          style={{
                            marginBottom: 6,
                            fontSize: "1.05rem",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          {t("poseResult.improvements_title")}
                        </p>
                        <ol
                          className="list pose-improvements-list"
                          style={{
                            margin: 0,
                            paddingLeft: 20,
                            paddingRight: 4,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {techniqueScore.improvements.map((item, i) => (
                            <li key={`${item.metricKey}-${i}`} style={{ color: "#e2e2e2" }}>
                              {item.message}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {techniqueScore && (
                  <div style={{ marginTop: 14 }}>
                    {isLoggedIn ? (
                      savedToDashboard ? (
                        <p className="muted" style={{ margin: 0, color: "#22c55e" }}>
                          {t("poseResult.saved_to_dashboard")}
                        </p>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onSaveToDashboard}
                            disabled={saveStatus === "saving" || !analysisId}
                            style={{ textDecoration: "none", fontSize: "0.85rem" }}
                          >
                            {saveStatus === "saving"
                              ? t("poseResult.saving")
                              : t("poseResult.save_button")}
                          </button>
                          {saveError ? <p className="error" style={{ marginTop: 8, marginBottom: 0 }}>{saveError}</p> : null}
                        </>
                      )
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          if (!analysisId) return;
                          const search = new URLSearchParams({
                            analysisId: String(analysisId),
                          }).toString();
                          navigate(`/register?${search}`);
                        }}
                        disabled={!analysisId}
                        style={{ textDecoration: "none", fontSize: "0.85rem" }}
                      >
                        {t("poseResult.save_and_create_button")}
                      </button>
                    )}
                  </div>
                )}
                {SHOW_RESULT_DEBUG && techniqueScore ? (
                  <details style={{ marginTop: 12 }}>
                    <summary className="muted">Résultat brut (debug)</summary>
                    <pre className="mono" style={{ whiteSpace: "pre-wrap", margin: 0, marginTop: 8 }}>
                      {JSON.stringify(techniqueScore, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

