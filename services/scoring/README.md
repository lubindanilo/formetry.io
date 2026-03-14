# Scoring refactor

This refactor preserves the same FastAPI route and response schema while moving scoring logic to reusable metric modules, figure-specific specs, and thin evaluators. Compatibility wrappers are kept for `app.scoring_utils`, `app.registries`, and `app.figures`.
