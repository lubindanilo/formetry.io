from app.schemas import DimensionScore, MetricScore


METRIC_CONFIDENCE_FLOOR = 0.08
DIMENSION_CONFIDENCE_FLOOR = 0.10
WEIGHT_CONFIDENCE_FLOOR = 0.10


def clamp_score(value: float) -> float:
    return round(max(0.0, min(100.0, value)), 2)


def average(values: list[float]) -> float:
    if not values:
        return 0.0
    return sum(values) / len(values)


def weighted_average(values: list[float], weights: list[float]) -> float:
    if not values or not weights or len(values) != len(weights):
        return 0.0
    total = sum(weights)
    if total <= 0:
        return average(values)
    return sum(v * w for v, w in zip(values, weights)) / total


def linear_score_from_error(error: float, tolerance: float, max_error: float) -> float:
    if error <= tolerance:
        return 100.0
    if error >= max_error:
        return 0.0
    ratio = (error - tolerance) / (max_error - tolerance)
    return clamp_score(100.0 * (1.0 - ratio))


def linear_score_from_target(value: float, target: float, tolerance: float, max_error: float) -> float:
    error = abs(value - target)
    return linear_score_from_error(error, tolerance=tolerance, max_error=max_error)


def make_metric(name: str, score: float, confidence: float, meta: dict | None = None) -> MetricScore:
    return MetricScore(
        name=name,
        score=clamp_score(score),
        confidence=round(max(METRIC_CONFIDENCE_FLOOR, min(1.0, confidence)), 3),
        meta=meta or {},
    )


def build_dimension(metrics: list[MetricScore], weights: dict[str, float] | None = None) -> DimensionScore:
    if not metrics:
        return DimensionScore(score=0.0, confidence=0.0, metrics=[])
    weights = weights or {}
    weighted_scores = []
    effective_weights = []
    for metric in metrics:
        base_weight = weights.get(metric.name, 1.0)
        effective_weight = base_weight * max(WEIGHT_CONFIDENCE_FLOOR, metric.confidence)
        weighted_scores.append(metric.score)
        effective_weights.append(effective_weight)
    score = weighted_average(weighted_scores, effective_weights)
    confidence = average([metric.confidence for metric in metrics])
    return DimensionScore(
        score=clamp_score(score),
        confidence=round(max(DIMENSION_CONFIDENCE_FLOOR, min(1.0, confidence)), 3),
        metrics=metrics,
    )
