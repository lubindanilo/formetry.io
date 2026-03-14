from typing import Any

from app.geometry import visibility


CONFIDENCE_FLOOR = 0.08


def clamp_confidence(value: float) -> float:
    return round(max(CONFIDENCE_FLOOR, min(1.0, value)), 3)


def average_visibility(landmarks: list[Any], names: list[str]) -> float:
    if not names:
        return 1.0
    values = [visibility(landmarks, name) for name in names]
    return sum(values) / len(values)


def metric_confidence(landmarks: list[Any], *names: str) -> float:
    return clamp_confidence(average_visibility(landmarks, list(names)))
