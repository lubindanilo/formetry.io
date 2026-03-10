import math
from typing import Any

from app.pose_indices import POSE_IDX


def _get_attr(point: Any, name: str, default: float | None = None) -> float | None:
    if isinstance(point, dict):
        value = point.get(name, default)
    else:
        value = getattr(point, name, default)
    return value


def get_landmark(landmarks: list[Any], name: str) -> Any:
    return landmarks[POSE_IDX[name]]


def xy(landmarks: list[Any], name: str) -> tuple[float, float]:
    point = get_landmark(landmarks, name)
    return float(_get_attr(point, "x", 0.0) or 0.0), float(_get_attr(point, "y", 0.0) or 0.0)


def visibility(landmarks: list[Any], name: str) -> float:
    point = get_landmark(landmarks, name)
    raw = _get_attr(point, "visibility", 1.0)
    return float(1.0 if raw is None else raw)


def midpoint(landmarks: list[Any], left_name: str, right_name: str) -> tuple[float, float]:
    lx, ly = xy(landmarks, left_name)
    rx, ry = xy(landmarks, right_name)
    return (lx + rx) / 2.0, (ly + ry) / 2.0


def distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    return math.dist(a, b)


def angle_abc(a: tuple[float, float], b: tuple[float, float], c: tuple[float, float]) -> float:
    ba = (a[0] - b[0], a[1] - b[1])
    bc = (c[0] - b[0], c[1] - b[1])

    norm_ba = math.hypot(ba[0], ba[1])
    norm_bc = math.hypot(bc[0], bc[1])

    if norm_ba == 0 or norm_bc == 0:
        return 0.0

    dot = ba[0] * bc[0] + ba[1] * bc[1]
    cosine = max(-1.0, min(1.0, dot / (norm_ba * norm_bc)))
    return math.degrees(math.acos(cosine))


def angle_from_names(landmarks: list[Any], a_name: str, b_name: str, c_name: str) -> float:
    return angle_abc(xy(landmarks, a_name), xy(landmarks, b_name), xy(landmarks, c_name))


def segment_angle_deg(a: tuple[float, float], b: tuple[float, float]) -> float:
    dx = b[0] - a[0]
    dy = b[1] - a[1]
    return abs(math.degrees(math.atan2(dy, dx)))


def horizontal_error_deg(a: tuple[float, float], b: tuple[float, float]) -> float:
    angle = segment_angle_deg(a, b)
    return min(angle, abs(180.0 - angle))


def vertical_error_deg(a: tuple[float, float], b: tuple[float, float]) -> float:
    angle = segment_angle_deg(a, b)
    return abs(90.0 - angle)


def point_to_line_distance(
    point: tuple[float, float],
    line_a: tuple[float, float],
    line_b: tuple[float, float],
) -> float:
    x0, y0 = point
    x1, y1 = line_a
    x2, y2 = line_b

    denom = math.hypot(x2 - x1, y2 - y1)
    if denom == 0:
        return 0.0

    return abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / denom


def body_scale(landmarks: list[Any]) -> float:
    shoulders_mid = midpoint(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER")
    hips_mid = midpoint(landmarks, "LEFT_HIP", "RIGHT_HIP")
    return max(distance(shoulders_mid, hips_mid), 0.05)
