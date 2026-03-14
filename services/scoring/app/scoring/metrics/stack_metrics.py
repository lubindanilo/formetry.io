from typing import Any

from app.geometry import body_scale, midpoint
from app.scoring.aggregation import linear_score_from_error


def score_handstand_stack(landmarks: list[Any], tolerance_ratio: float = 0.06, max_ratio: float = 0.28) -> float:
    wrists_mid = midpoint(landmarks, "LEFT_WRIST", "RIGHT_WRIST")
    shoulders_mid = midpoint(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER")
    hips_mid = midpoint(landmarks, "LEFT_HIP", "RIGHT_HIP")
    ankles_mid = midpoint(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE")
    x_values = [wrists_mid[0], shoulders_mid[0], hips_mid[0], ankles_mid[0]]
    spread_ratio = (max(x_values) - min(x_values)) / body_scale(landmarks)
    return linear_score_from_error(spread_ratio, tolerance=tolerance_ratio, max_error=max_ratio)
