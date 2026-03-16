/**
 * Configuration des métriques d'analyse technique.
 * Single source of truth pour les clés API et libellés affichés.
 * Ajouter une entrée ici pour qu'une nouvelle métrique soit affichée dans le dashboard.
 */
export const GLOBAL_KEY = "global";

/** Ordre d'affichage et libellés des métriques (hors score global).
 * Le label est une clé d'i18n pour permettre la traduction.
 */
export const DIMENSION_METRICS = [
  { key: "body_line", label: "metrics.body_line" },
  { key: "symmetry", label: "metrics.symmetry" },
  { key: "lockout_extension", label: "metrics.lockout_extension" },
];

/** Libellé du score global (clé i18n du titre section / jauge circulaire) */
export const GLOBAL_LABEL = "metrics.global";

/** Score max affiché (sur 100) */
export const SCORE_MAX = 100;
