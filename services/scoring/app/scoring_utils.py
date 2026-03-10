from typing import Any

from app.geometry import (
    angle_from_names,
    body_scale,
    horizontal_error_deg,
    midpoint,
    point_to_line_distance,
    vertical_error_deg,
    xy,
)
from app.schemas import DimensionScore, MetricScore


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
        confidence=round(max(0.25, min(1.0, confidence)), 3),
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
        effective_weight = base_weight * max(0.25, metric.confidence)
        weighted_scores.append(metric.score)
        effective_weights.append(effective_weight)

    score = weighted_average(weighted_scores, effective_weights)
    confidence = average([metric.confidence for metric in metrics])

    return DimensionScore(
        score=clamp_score(score),
        confidence=round(max(0.25, min(1.0, confidence)), 3),
        metrics=metrics,
    )


def score_midline_horizontal(
    landmarks: list[Any],
    start_left: str,
    start_right: str,
    end_left: str,
    end_right: str,
    tolerance_deg: float = 8.0,
    max_error_deg: float = 35.0,
) -> float:
    start = midpoint(landmarks, start_left, start_right)
    end = midpoint(landmarks, end_left, end_right)
    error = horizontal_error_deg(start, end)
    return linear_score_from_error(error, tolerance=tolerance_deg, max_error=max_error_deg)


def score_midline_vertical(
    landmarks: list[Any],
    start_left: str,
    start_right: str,
    end_left: str,
    end_right: str,
    tolerance_deg: float = 7.0,
    max_error_deg: float = 25.0,
) -> float:
    start = midpoint(landmarks, start_left, start_right)
    end = midpoint(landmarks, end_left, end_right)
    error = vertical_error_deg(start, end)
    return linear_score_from_error(error, tolerance=tolerance_deg, max_error=max_error_deg)


def score_hip_on_line(
    landmarks: list[Any],
    tolerance_ratio: float = 0.08,
    max_ratio: float = 0.30,
) -> float:
    shoulders_mid = midpoint(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER")
    hips_mid = midpoint(landmarks, "LEFT_HIP", "RIGHT_HIP")
    ankles_mid = midpoint(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE")
    ratio = point_to_line_distance(hips_mid, shoulders_mid, ankles_mid) / body_scale(landmarks)
    return linear_score_from_error(ratio, tolerance=tolerance_ratio, max_error=max_ratio)


def score_handstand_stack(
    landmarks: list[Any],
    tolerance_ratio: float = 0.06,
    max_ratio: float = 0.28,
) -> float:
    wrists_mid = midpoint(landmarks, "LEFT_WRIST", "RIGHT_WRIST")
    shoulders_mid = midpoint(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER")
    hips_mid = midpoint(landmarks, "LEFT_HIP", "RIGHT_HIP")
    ankles_mid = midpoint(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE")
    x_values = [wrists_mid[0], shoulders_mid[0], hips_mid[0], ankles_mid[0]]
    spread_ratio = (max(x_values) - min(x_values)) / body_scale(landmarks)
    return linear_score_from_error(spread_ratio, tolerance=tolerance_ratio, max_error=max_ratio)


def score_lsit_leg_height(
    landmarks: list[Any],
    tolerance_ratio: float = 0.08,
    max_ratio: float = 0.35,
) -> float:
    hips_mid = midpoint(landmarks, "LEFT_HIP", "RIGHT_HIP")
    ankles_mid = midpoint(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE")
    ratio = abs(ankles_mid[1] - hips_mid[1]) / body_scale(landmarks)
    return linear_score_from_error(ratio, tolerance=tolerance_ratio, max_error=max_ratio)


def score_lsit_compression(
    landmarks: list[Any],
    side: str,
    target_deg: float = 90.0,
    tolerance_deg: float = 12.0,
    max_error_deg: float = 65.0,
) -> float:
    value = angle_from_names(landmarks, f"{side}_SHOULDER", f"{side}_HIP", f"{side}_KNEE")
    return linear_score_from_target(
        value,
        target=target_deg,
        tolerance=tolerance_deg,
        max_error=max_error_deg,
    )


def score_pair_height_symmetry(
    landmarks: list[Any],
    left_name: str,
    right_name: str,
    tolerance_ratio: float = 0.04,
    max_ratio: float = 0.22,
) -> float:
    _, y_left = xy(landmarks, left_name)
    _, y_right = xy(landmarks, right_name)
    ratio = abs(y_left - y_right) / body_scale(landmarks)
    return linear_score_from_error(ratio, tolerance=tolerance_ratio, max_error=max_ratio)


def score_joint_angle_symmetry(
    landmarks: list[Any],
    left_triplet: tuple[str, str, str],
    right_triplet: tuple[str, str, str],
    tolerance_deg: float = 8.0,
    max_error_deg: float = 40.0,
) -> float:
    left_angle = angle_from_names(landmarks, *left_triplet)
    right_angle = angle_from_names(landmarks, *right_triplet)
    return linear_score_from_error(abs(left_angle - right_angle), tolerance=tolerance_deg, max_error=max_error_deg)


def score_joint_extension(
    landmarks: list[Any],
    a_name: str,
    b_name: str,
    c_name: str,
    target_deg: float = 180.0,
    tolerance_deg: float = 10.0,
    max_error_deg: float = 55.0,
) -> float:
    value = angle_from_names(landmarks, a_name, b_name, c_name)
    return linear_score_from_target(value, target=target_deg, tolerance=tolerance_deg, max_error=max_error_deg)


def score_elbow_lockout(landmarks: list[Any], side: str) -> float:
    return score_joint_extension(
        landmarks,
        f"{side}_SHOULDER",
        f"{side}_ELBOW",
        f"{side}_WRIST",
    )


def score_knee_lockout(landmarks: list[Any], side: str) -> float:
    return score_joint_extension(
        landmarks,
        f"{side}_HIP",
        f"{side}_KNEE",
        f"{side}_ANKLE",
    )


def score_hip_extension(landmarks: list[Any], side: str) -> float:
    return score_joint_extension(
        landmarks,
        f"{side}_SHOULDER",
        f"{side}_HIP",
        f"{side}_KNEE",
        target_deg=180.0,
        tolerance_deg=12.0,
        max_error_deg=60.0,
    )
