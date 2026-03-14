/**
 * Configuration des métriques d'analyse technique.
 * Single source of truth pour les clés API et libellés affichés.
 * Ajouter une entrée ici pour qu'une nouvelle métrique soit affichée dans le dashboard.
 */
export const GLOBAL_KEY = "global";

/** Ordre d'affichage et libellés des métriques (hors score global) */
export const DIMENSION_METRICS = [
  { key: "body_line", label: "Alignement corporel" },
  { key: "symmetry", label: "Symétrie" },
  { key: "lockout_extension", label: "Extension des membres" },
];

/** Libellé du score global (titre section / jauge circulaire) */
export const GLOBAL_LABEL = "Score Global";

/** Score max affiché (sur 100) */
export const SCORE_MAX = 100;
