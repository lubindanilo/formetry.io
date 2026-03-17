import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AnalysisDashboard from "../components/pose/analysis/AnalysisDashboard.jsx";
import { fetchJson } from "../lib/poseSandboxUtils.js";

export default function AnalysisDetail() {
  const { analysisId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetchJson(`/api/pose/history/${analysisId}`);
        if (!cancelled) {
          setData(res);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || String(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    if (analysisId) {
      load();
    } else {
      setLoading(false);
      setError("Missing analysisId");
    }
    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  const formattedDate =
    data && data.date
      ? new Date(data.date).toLocaleDateString(i18n.language || undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  return (
    <section className="card analysis-detail">
      <button
        type="button"
        className="btn btn-link analysis-detail-back"
        onClick={() => navigate(-1)}
      >
        ← {t("dashboard.history_back_to_dashboard")}
      </button>

      <h2 style={{ marginTop: 0 }}>
        {t("dashboard.history_detail_title")}
      </h2>

      {loading && <p className="muted">{t("common.loading")}</p>}
      {!loading && error && <p className="error">{error}</p>}

      {!loading && !error && data && (
        <div className="analysis-detail-body">
          <div className="analysis-detail-main">
            {data.imageUrl && (
              <div className="analysis-detail-image-wrap">
                <img
                  src={data.imageUrl}
                  alt={data.userLabel || "analysis"}
                  className="analysis-detail-image"
                />
              </div>
            )}

            <div className="analysis-detail-right">
              {data.techniqueScore?.scores && (
                <div className="analysis-detail-scores">
                  <AnalysisDashboard
                    scores={data.techniqueScore.scores}
                    improvements={Array.isArray(data.topFeedbacks) ? data.topFeedbacks : []}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

