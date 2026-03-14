from typing import Any

from app.geometry import angle_from_names, body_scale, midpoint
from app.scoring.aggregation import linear_score_from_error, linear_score_from_target


def score_lsit_leg_height(landmarks: list[Any], tolerance_ratio: float = 0.08, max_ratio: float = 0.35) -> float:
    hips_mid = midpoint(landmarks, "LEFT_HIP", "RIGHT_HIP")
    ankles_mid = midpoint(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE")
    ratio = abs(ankles_mid[1] - hips_mid[1]) / body_scale(landmarks)
    return linear_score_from_error(ratio, tolerance=tolerance_ratio, max_error=max_ratio)


def score_lsit_compression(landmarks: list[Any], side: str, target_deg: float = 90.0, tolerance_deg: float = 12.0, max_error_deg: float = 65.0) -> float:
    value = angle_from_names(landmarks, f"{side}_SHOULDER", f"{side}_HIP", f"{side}_KNEE")
    return linear_score_from_target(value, target=target_deg, tolerance=tolerance_deg, max_error=max_error_deg)
