from typing import Any

from app.geometry import body_scale, horizontal_error_deg, midpoint, point_to_line_distance, vertical_error_deg
from app.scoring.aggregation import linear_score_from_error


def score_midline_horizontal(landmarks: list[Any], start_left: str, start_right: str, end_left: str, end_right: str, tolerance_deg: float = 8.0, max_error_deg: float = 35.0) -> float:
    start = midpoint(landmarks, start_left, start_right)
    end = midpoint(landmarks, end_left, end_right)
    error = horizontal_error_deg(start, end)
    return linear_score_from_error(error, tolerance=tolerance_deg, max_error=max_error_deg)


def score_midline_vertical(landmarks: list[Any], start_left: str, start_right: str, end_left: str, end_right: str, tolerance_deg: float = 7.0, max_error_deg: float = 25.0) -> float:
    start = midpoint(landmarks, start_left, start_right)
    end = midpoint(landmarks, end_left, end_right)
    error = vertical_error_deg(start, end)
    return linear_score_from_error(error, tolerance=tolerance_deg, max_error=max_error_deg)


def score_hip_on_line(landmarks: list[Any], tolerance_ratio: float = 0.08, max_ratio: float = 0.30) -> float:
    shoulders_mid = midpoint(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER")
    hips_mid = midpoint(landmarks, "LEFT_HIP", "RIGHT_HIP")
    ankles_mid = midpoint(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE")
    ratio = point_to_line_distance(hips_mid, shoulders_mid, ankles_mid) / body_scale(landmarks)
    return linear_score_from_error(ratio, tolerance=tolerance_ratio, max_error=max_ratio)
