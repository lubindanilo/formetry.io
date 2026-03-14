from typing import Any

from app.geometry import angle_from_names, body_scale, xy
from app.scoring.aggregation import linear_score_from_error


def score_pair_height_symmetry(landmarks: list[Any], left_name: str, right_name: str, tolerance_ratio: float = 0.06, max_ratio: float = 0.28) -> float:
    _, y_left = xy(landmarks, left_name)
    _, y_right = xy(landmarks, right_name)
    ratio = abs(y_left - y_right) / body_scale(landmarks)
    return linear_score_from_error(ratio, tolerance=tolerance_ratio, max_error=max_ratio)


def score_joint_angle_symmetry(landmarks: list[Any], left_triplet: tuple[str, str, str], right_triplet: tuple[str, str, str], tolerance_deg: float = 10.0, max_error_deg: float = 45.0) -> float:
    left_angle = angle_from_names(landmarks, *left_triplet)
    right_angle = angle_from_names(landmarks, *right_triplet)
    return linear_score_from_error(abs(left_angle - right_angle), tolerance=tolerance_deg, max_error=max_error_deg)
