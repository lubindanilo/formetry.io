from typing import Any

from app.geometry import angle_from_names
from app.scoring.aggregation import linear_score_from_target


def score_joint_extension(landmarks: list[Any], a_name: str, b_name: str, c_name: str, target_deg: float = 180.0, tolerance_deg: float = 10.0, max_error_deg: float = 55.0) -> float:
    value = angle_from_names(landmarks, a_name, b_name, c_name)
    return linear_score_from_target(value, target=target_deg, tolerance=tolerance_deg, max_error=max_error_deg)


def score_elbow_lockout(landmarks: list[Any], side: str) -> float:
    return score_joint_extension(landmarks, f"{side}_SHOULDER", f"{side}_ELBOW", f"{side}_WRIST")


def score_knee_lockout(landmarks: list[Any], side: str) -> float:
    return score_joint_extension(landmarks, f"{side}_HIP", f"{side}_KNEE", f"{side}_ANKLE")


def score_hip_extension(landmarks: list[Any], side: str) -> float:
    return score_joint_extension(landmarks, f"{side}_SHOULDER", f"{side}_HIP", f"{side}_KNEE", target_deg=180.0, tolerance_deg=12.0, max_error_deg=60.0)
