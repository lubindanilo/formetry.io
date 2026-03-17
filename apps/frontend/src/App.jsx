import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import PoseSandbox from "./components/PoseSandbox.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import Blog from "./pages/Blog.jsx";
import AnalysisDetail from "./pages/AnalysisDetail.jsx";
import { useTranslation } from "react-i18next";

function Header() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === "/" && !user;
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`header ${isMenuOpen ? "header--menu-open" : ""}`}>
      <div className="header-nav">
        <h1 style={{ margin: 0 }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            {t("header.brand")}
          </Link>
        </h1>
        <button
          type="button"
          className="header-nav-toggle"
          aria-label={t("header.menu_open")}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="header-nav-toggle-bar" />
          <span className="header-nav-toggle-bar" />
          <span className="header-nav-toggle-bar" />
        </button>
        <div className="header-nav-links">
          {!loading && (
            <>
              <Link to="/accueil">{t("header.home")}</Link>
              {user ? <Link to="/">{t("header.dashboard")}</Link> : null}
              <Link to="/analyze">{t("header.analyze")}</Link>
              <Link to="/blog">{t("header.blog")}</Link>
              {user ? null : (
                <>
                  <Link to="/login">{t("header.login")}</Link>
                  <Link to="/register">{t("header.register")}</Link>
                </>
              )}
            </>
          )}
          <div className="header-lang-switch">
            <button
              type="button"
              onClick={() => i18n.changeLanguage("en")}
              className={i18n.language?.startsWith("en") ? "header-lang-active" : ""}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => i18n.changeLanguage("fr")}
              className={i18n.language?.startsWith("fr") ? "header-lang-active" : ""}
            >
              FR
            </button>
          </div>
        </div>
      </div>
      {!isLanding && (
        <p className="muted" style={{ margin: 0 }}>
        </p>
      )}
    </header>
  );
}

function LandingPage() {
  return <Landing />;
}

function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted">Chargement...</p>;
  if (user) return <Dashboard />;
  return <LandingPage />;
}

function AnalyzePage() {
  const { user } = useAuth();
  const userId = user?.id ?? "demo";
  return <PoseSandbox userId={userId} />;
}

function BlogPage() {
  return <Blog />;
}

export default function App() {
  return (
    <div className="page">
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/accueil" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/analysis/:analysisId" element={<AnalysisDetail />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
