import React from "react";
import { useTranslation } from "react-i18next";

export default function Blog() {
  const { t } = useTranslation();
  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>{t("header.blog")}</h2>
      <p className="muted">
        Coming soon.
      </p>
    </section>
  );
}

