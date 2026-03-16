import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import { fetchJson } from "../lib/poseSandboxUtils.js";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(location.search);
  const pendingAnalysisId = searchParams.get("analysisId");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(email.trim(), password, displayName.trim());

      if (pendingAnalysisId) {
        try {
          await fetchJson("/api/pose/save-to-dashboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ analysisId: pendingAnalysisId }),
          });
        } catch (saveErr) {
          // On ne bloque pas la navigation si la sauvegarde échoue.
          console.error("Failed to auto-save analysis after register:", saveErr);
        }
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message ?? t("auth.register_error_default"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h2>{t("auth.register_title")}</h2>
        <p className="muted">{t("auth.register_subtitle")}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error ? <p className="error">{error}</p> : null}
          <label>
            <span className="auth-label">{t("auth.email_label")}</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </label>
          <label>
            <span className="auth-label">{t("auth.password_label")}</span>
            <div className="auth-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder={t("auth.password_placeholder")}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                title={
                  showPassword
                    ? t("auth.hide_password")
                    : t("auth.show_password")
                }
                aria-label={
                  showPassword
                    ? t("auth.hide_password")
                    : t("auth.show_password")
                }
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </label>
          <label>
            <span className="auth-label">{t("auth.name_label")}</span>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="auth-input"
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ fontSize: "0.95rem" }}
          >
            {submitting
              ? t("auth.register_submitting")
              : t("auth.register_submit")}
          </button>
        </form>
        <p className="auth-footer muted">
          {t("auth.have_account")}{" "}
          <Link to="/login">{t("auth.login_submit")}</Link>
        </p>
      </div>
    </div>
  );
}
