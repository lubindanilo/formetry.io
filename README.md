## AI Form Coach

Application de coaching de formes de street workout / calisthenics, basée sur MediaPipe Pose, un service de scoring Python et une API Node/Express.

### Améliorations du 2026-03-03

- **Scoring Python (`pose_rules.py`)** : refactor des règles de classification pour s'appuyer davantage sur la géométrie du corps (angles articulaires, orientations de segments, distances normalisées, scores "soft" d'ordre vertical).  
  - Ajout de features dérivés (angles épaules/hanches/nuque, tilts du tronc, des jambes et des bras, distances normalisées, scores de "jambes au-dessus du tronc", "mains sous/au-dessus des épaules", etc.).  
  - Réécriture des fonctions `score_handstand`, `score_human_flag`, `score_planche`, `score_elbow_lever`, `score_l_sit`, `score_lever_generic` pour les rendre plus robustes et continues (moins de conditions binaires).
- **Service de scoring (`main.py`)** : sécurisation de l'écriture dans le CSV de dataset pour que l'API continue à répondre même si l'append échoue, en ajoutant un warning explicite plutôt qu'une erreur serveur.
- **API Node (`apps/api/src/routes/pose.js`)** : correction de la route `/api/pose/confirm` pour garantir que la confirmation d'un label utilisateur n'échoue pas lorsque `s3KeyResult` est manquant, et journalisation améliorée des erreurs.

Ces changements améliorent à la fois la **précision de la classification des figures** (Handstand, Planche, L-Sit, Levers, etc.) et la **fiabilité du flux de confirmation**, nécessaire pour constituer un dataset supervisé (landmarks + `userLabel`) en vue d'entraîner un futur modèle d'apprentissage automatique.

