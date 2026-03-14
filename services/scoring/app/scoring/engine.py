from typing import Any

from app.schemas import DimensionScore
from app.scoring.aggregation import build_dimension, make_metric
from app.scoring.base_types import MetricDefinition
from app.scoring.confidence import resolve_metric_confidence


def evaluate_dimension(landmarks: list[Any], definitions: list[MetricDefinition]) -> DimensionScore:
    metrics = []
    weights: dict[str, float] = {}
    for definition in definitions:
        score = definition.scorer(landmarks, **definition.kwargs)
        confidence = resolve_metric_confidence(landmarks, definition.confidence_points)
        metrics.append(make_metric(definition.name, score, confidence, meta=definition.meta))
        weights[definition.name] = definition.weight
    return build_dimension(metrics, weights=weights)
