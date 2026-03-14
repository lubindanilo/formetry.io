from typing import Any

from app.reliability import metric_confidence


def resolve_metric_confidence(landmarks: list[Any], points: tuple[str, ...]) -> float:
    return metric_confidence(landmarks, *points)
