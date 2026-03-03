# services/scoring/app/pose_rules.py
from __future__ import annotations

from dataclasses import dataclass
from math import atan2, degrees, sqrt
from typing import Dict, List, Tuple, Optional


# MediaPipe Pose landmark indices (subset we use a lot)
NOSE = 0
L_SHOULDER, R_SHOULDER = 11, 12
L_ELBOW, R_ELBOW = 13, 14
L_WRIST, R_WRIST = 15, 16
L_HIP, R_HIP = 23, 24
L_KNEE, R_KNEE = 25, 26
L_ANKLE, R_ANKLE = 27, 28
L_FOOT, R_FOOT = 31, 32


POSES = [
    "Full Planche",
    "L-Sit",
    "Front Lever",
    "Human Flag",
    "Handstand",
    "Elbow lever",
    "Back Lever",
]


@dataclass(frozen=True)
class P:
    x: float
    y: float
    z: float
    v: float  # visibility/confidence


def clamp01(x: float) -> float:
    return 0.0 if x < 0.0 else 1.0 if x > 1.0 else x


def in_range(value: float, lo: float, hi: float, soft_margin: float) -> float:
    """
    Soft membership of value in [lo, hi].
    - returns 1.0 when lo <= value <= hi
    - decays linearly to 0.0 when leaving [lo-soft_margin, hi+soft_margin]
    """
    if soft_margin <= 0:
        return 1.0 if lo <= value <= hi else 0.0

    if value < lo:
        if value <= lo - soft_margin:
            return 0.0
        return clamp01((value - (lo - soft_margin)) / soft_margin)
    if value > hi:
        if value >= hi + soft_margin:
            return 0.0
        return clamp01(((hi + soft_margin) - value) / soft_margin)
    return 1.0


def safe_mean(a: float, b: float) -> float:
    return (a + b) / 2.0


def get_point(lms: List[P], idx: int) -> P:
    return lms[idx]


def midpoint(a: P, b: P) -> P:
    return P(safe_mean(a.x, b.x), safe_mean(a.y, b.y), safe_mean(a.z, b.z), safe_mean(a.v, b.v))


def dist2d(a: P, b: P) -> float:
    dx, dy = a.x - b.x, a.y - b.y
    return sqrt(dx * dx + dy * dy)


def angle_abc(a: P, b: P, c: P) -> float:
    """Angle at point b, in degrees, using 2D (x,y)."""
    bax, bay = a.x - b.x, a.y - b.y
    bcx, bcy = c.x - b.x, c.y - b.y

    dot = bax * bcx + bay * bcy
    na = sqrt(bax * bax + bay * bay)
    nc = sqrt(bcx * bcx + bcy * bcy)
    if na < 1e-6 or nc < 1e-6:
        return 0.0

    cosang = max(-1.0, min(1.0, dot / (na * nc)))
    # arccos without importing; use atan2 trick:
    # angle = atan2(|u x v|, u·v)
    cross = bax * bcy - bay * bcx
    ang = degrees(atan2(abs(cross), dot))
    return ang


def line_angle_deg(a: P, b: P) -> float:
    """Angle of segment a->b relative to +x axis, degrees in [-180,180]."""
    dx, dy = b.x - a.x, b.y - a.y
    return degrees(atan2(dy, dx))


def tilt_from_angle(angle_deg: float) -> float:
    """
    Convert a raw line angle (in degrees, relative to +x) into a "tilt from horizontal"
    in [0, 90], where:
      - 0   => perfectly horizontal
      - 90  => perfectly vertical
    """
    t = abs(angle_deg)
    if t > 180:
        t = 360 - t
    if t > 90:
        t = 180 - t
    return t


def closeness_to(target: float, value: float, tol: float) -> float:
    """1 when value==target, goes to 0 when |value-target|>=tol."""
    if tol <= 0:
        return 0.0
    return clamp01(1.0 - abs(value - target) / tol)


def vis_ok(points: List[P], min_v: float = 0.5) -> bool:
    return all(p.v >= min_v for p in points)


def body_scale(lms: List[P]) -> float:
    # robust-ish scale: shoulder width or hip width (fallback to 1 if weird)
    ls, rs = get_point(lms, L_SHOULDER), get_point(lms, R_SHOULDER)
    lh, rh = get_point(lms, L_HIP), get_point(lms, R_HIP)
    s = dist2d(ls, rs)
    h = dist2d(lh, rh)
    scale = max(s, h, 1e-3)
    return scale


def compute_features(lms: List[P]) -> Dict[str, float]:
    # Core joints (left/right)
    ls, rs = get_point(lms, L_SHOULDER), get_point(lms, R_SHOULDER)
    lh, rh = get_point(lms, L_HIP), get_point(lms, R_HIP)
    la, ra = get_point(lms, L_ANKLE), get_point(lms, R_ANKLE)
    lw, rw = get_point(lms, L_WRIST), get_point(lms, R_WRIST)
    le, re = get_point(lms, L_ELBOW), get_point(lms, R_ELBOW)
    lk, rk = get_point(lms, L_KNEE), get_point(lms, R_KNEE)
    nose = get_point(lms, NOSE)

    # Midpoints
    sh_mid = midpoint(ls, rs)
    hip_mid = midpoint(lh, rh)
    ank_mid = midpoint(la, ra)
    w_mid = midpoint(lw, rw)

    scale = body_scale(lms)

    # --- Local joint angles (2D, at the middle joint) ---
    elbow_l = angle_abc(ls, le, lw)
    elbow_r = angle_abc(rs, re, rw)

    knee_l = angle_abc(lh, lk, la)
    knee_r = angle_abc(rh, rk, ra)

    shoulder_l_ang = angle_abc(le, ls, lh)
    shoulder_r_ang = angle_abc(re, rs, rh)

    hip_l_ang = angle_abc(ls, lh, lk)
    hip_r_ang = angle_abc(rs, rh, rk)

    neck_ang = angle_abc(hip_mid, sh_mid, nose)

    # --- Global segment orientations (angles then tilts from horizontal) ---
    body_ang = line_angle_deg(sh_mid, ank_mid)   # horizontal ~ 0/180, vertical ~ +/-90
    torso_ang = line_angle_deg(sh_mid, hip_mid)
    legs_ang = line_angle_deg(hip_mid, ank_mid)
    arms_ang = line_angle_deg(sh_mid, w_mid)

    body_tilt = tilt_from_angle(body_ang)
    torso_tilt = tilt_from_angle(torso_ang)
    legs_tilt = tilt_from_angle(legs_ang)
    arms_tilt = tilt_from_angle(arms_ang)

    # --- Wrists relationship (human flag signature) ---
    wrist_dy = abs(lw.y - rw.y)
    wrist_dx = abs(lw.x - rw.x)

    # --- Relative y ordering helpers (y increases downward in image) ---
    y_wr = safe_mean(lw.y, rw.y)
    y_sh = safe_mean(ls.y, rs.y)
    y_hip = safe_mean(lh.y, rh.y)
    y_ank = safe_mean(la.y, ra.y)

    # Soft inversion scores: legs above torso vs below
    # We treat "above" as having smaller y (closer to top of image).
    def soft_rel(y_a: float, y_b: float, tol: float = 0.05) -> float:
        """
        Soft score that y_a is above y_b (y_a < y_b).
        - 1.0 when y_b - y_a >= tol
        - 0.0 when y_a >= y_b
        - linear in between.
        """
        if y_a >= y_b:
            return 0.0
        gap = y_b - y_a
        if gap >= tol:
            return 1.0
        return clamp01(gap / tol)

    score_legs_above_torso = soft_rel(y_ank, y_hip)
    score_legs_below_torso = soft_rel(y_hip, y_ank)
    score_hands_below_shoulders = soft_rel(y_sh, y_wr)
    score_hands_above_shoulders = soft_rel(y_wr, y_sh)

    # --- Distances normalized by body scale ---
    d_wrist_sh = dist2d(w_mid, sh_mid) / scale
    d_sh_hip = dist2d(sh_mid, hip_mid) / scale
    d_hip_ank = dist2d(hip_mid, ank_mid) / scale
    d_hip_wrist = dist2d(hip_mid, w_mid) / scale
    d_torso_len = dist2d(sh_mid, hip_mid) / scale
    d_legs_len = dist2d(hip_mid, ank_mid) / scale

    d_lr_shoulder = dist2d(ls, rs) / scale
    d_lr_hip = dist2d(lh, rh) / scale
    d_lr_ankle = dist2d(la, ra) / scale
    d_lr_wrist = dist2d(lw, rw) / scale

    return {
        # Core meta
        "scale": scale,
        # Local angles
        "elbow_l": elbow_l,
        "elbow_r": elbow_r,
        "knee_l": knee_l,
        "knee_r": knee_r,
        "shoulder_l_ang": shoulder_l_ang,
        "shoulder_r_ang": shoulder_r_ang,
        "hip_l_ang": hip_l_ang,
        "hip_r_ang": hip_r_ang,
        "neck_ang": neck_ang,
        # Tilts (0=horizontal, 90=vertical)
        "body_tilt": body_tilt,
        "torso_tilt": torso_tilt,
        "legs_tilt": legs_tilt,
        "arms_tilt": arms_tilt,
        # Wrist relations
        "wrist_dy": wrist_dy,
        "wrist_dx": wrist_dx,
        # Vertical helpers
        "y_wr": y_wr,
        "y_sh": y_sh,
        "y_hip": y_hip,
        "y_ank": y_ank,
        "score_legs_above_torso": score_legs_above_torso,
        "score_legs_below_torso": score_legs_below_torso,
        "score_hands_below_shoulders": score_hands_below_shoulders,
        "score_hands_above_shoulders": score_hands_above_shoulders,
        # Distances normalized
        "d_wrist_sh": d_wrist_sh,
        "d_sh_hip": d_sh_hip,
        "d_hip_ank": d_hip_ank,
        "d_hip_wrist": d_hip_wrist,
        "d_torso_len": d_torso_len,
        "d_legs_len": d_legs_len,
        "d_lr_shoulder": d_lr_shoulder,
        "d_lr_hip": d_lr_hip,
        "d_lr_ankle": d_lr_ankle,
        "d_lr_wrist": d_lr_wrist,
    }


def score_handstand(lms: List[P], f: Dict[str, float]) -> float:
    # Inversion order: legs above torso (soft score)
    inv = f["score_legs_above_torso"]

    # Straight limbs
    elbows = safe_mean(
        closeness_to(180, f["elbow_l"], 30),
        closeness_to(180, f["elbow_r"], 30),
    )
    knees = safe_mean(
        closeness_to(180, f["knee_l"], 25),
        closeness_to(180, f["knee_r"], 25),
    )

    # Body and legs vertical
    vertical_body = closeness_to(90, f["body_tilt"], 18)
    vertical_legs = closeness_to(90, f["legs_tilt"], 18)

    # Hands roughly under center of mass (hips vs wrists vs ankles)
    support_dist = in_range(f["d_hip_wrist"], lo=0.3, hi=1.3, soft_margin=0.4)

    return clamp01(
        0.30 * inv
        + 0.20 * vertical_body
        + 0.15 * vertical_legs
        + 0.20 * elbows
        + 0.10 * knees
        + 0.05 * support_dist
    )


def score_human_flag(lms: List[P], f: Dict[str, float]) -> float:
    # Signature: wrists stacked vertically (big dy, small dx) + body horizontal + arms vertical
    wrists_stacked = clamp01((f["wrist_dy"] - 0.18) / 0.25) * clamp01(
        1.0 - f["wrist_dx"] / 0.12
    )
    horizontal = closeness_to(0, f["body_tilt"], 15)
    arms_vertical = closeness_to(90, f["arms_tilt"], 20)
    knees = safe_mean(
        closeness_to(180, f["knee_l"], 25),
        closeness_to(180, f["knee_r"], 25),
    )
    elbows = safe_mean(
        closeness_to(180, f["elbow_l"], 35),
        closeness_to(180, f["elbow_r"], 35),
    )
    return clamp01(
        0.35 * wrists_stacked
        + 0.25 * horizontal
        + 0.20 * arms_vertical
        + 0.10 * knees
        + 0.10 * elbows
    )


def score_planche(lms: List[P], f: Dict[str, float]) -> float:
    # Hands lower than shoulders (soft score), body horizontal, elbows straight
    hands_below = f["score_hands_below_shoulders"]
    horizontal = closeness_to(0, f["body_tilt"], 15)
    elbows = safe_mean(
        closeness_to(180, f["elbow_l"], 25),
        closeness_to(180, f["elbow_r"], 25),
    )
    knees = safe_mean(
        closeness_to(180, f["knee_l"], 25),
        closeness_to(180, f["knee_r"], 25),
    )
    # shoulders relatively close to wrists (planche support)
    support = in_range(f["d_wrist_sh"], lo=0.3, hi=1.0, soft_margin=0.35)
    return clamp01(
        0.25 * hands_below
        + 0.30 * horizontal
        + 0.25 * elbows
        + 0.10 * knees
        + 0.10 * support
    )


def score_elbow_lever(lms: List[P], f: Dict[str, float]) -> float:
    # Elbow lever: body horizontal like planche BUT elbows bent (~70-120 deg)
    horizontal = closeness_to(0, f["body_tilt"], 18)
    elbow_bent = safe_mean(
        in_range(f["elbow_l"], lo=70, hi=120, soft_margin=20),
        in_range(f["elbow_r"], lo=70, hi=120, soft_margin=20),
    )
    knees = safe_mean(
        closeness_to(180, f["knee_l"], 35),
        closeness_to(180, f["knee_r"], 35),
    )
    hands_below = f["score_hands_below_shoulders"]
    return clamp01(
        0.35 * horizontal + 0.35 * elbow_bent + 0.15 * knees + 0.15 * hands_below
    )


def score_l_sit(lms: List[P], f: Dict[str, float]) -> float:
    # Torso vertical + legs horizontal and raised near hip level
    torso_vertical = closeness_to(90, f["torso_tilt"], 20)
    legs_horizontal = closeness_to(0, f["legs_tilt"], 18)
    legs_raised = closeness_to(
        0.0,
        abs(f["y_hip"] - f["y_ank"]),
        0.10,
    )  # same height
    elbows = safe_mean(
        closeness_to(180, f["elbow_l"], 30),
        closeness_to(180, f["elbow_r"], 30),
    )
    hands_below = f["score_hands_below_shoulders"]
    return clamp01(
        0.25 * torso_vertical
        + 0.25 * legs_horizontal
        + 0.20 * legs_raised
        + 0.20 * elbows
        + 0.10 * hands_below
    )


def score_lever_generic(lms: List[P], f: Dict[str, float]) -> float:
    # Lever: body horizontal + hands above shoulders (bar overhead) + straight limbs
    horizontal = closeness_to(0, f["body_tilt"], 15)
    hands_above = f["score_hands_above_shoulders"]
    elbows = safe_mean(
        closeness_to(180, f["elbow_l"], 30),
        closeness_to(180, f["elbow_r"], 30),
    )
    knees = safe_mean(
        closeness_to(180, f["knee_l"], 30),
        closeness_to(180, f["knee_r"], 30),
    )
    return clamp01(
        0.40 * horizontal + 0.20 * hands_above + 0.20 * elbows + 0.20 * knees
    )


def front_vs_back_hint(lms: List[P]) -> float:
    """
    Naive hint using z: MediaPipe z is roughly "depth". This is not perfect.
    Returns >0 => front lever likely, <0 => back lever likely.
    """
    ls, rs = get_point(lms, L_SHOULDER), get_point(lms, R_SHOULDER)
    lh, rh = get_point(lms, L_HIP), get_point(lms, R_HIP)
    nose = get_point(lms, NOSE)

    shoulder_z = safe_mean(ls.z, rs.z)
    hip_z = safe_mean(lh.z, rh.z)

    # if face (nose) is closer to camera than hips, lean "front"
    return (hip_z - nose.z) + 0.3 * (hip_z - shoulder_z)


def classify_pose(lms: List[P], min_visibility: float = 0.4) -> Tuple[str, float, Dict[str, float], List[str]]:
    warnings: List[str] = []
    if len(lms) != 33:
        raise ValueError(f"Expected 33 landmarks, got {len(lms)}")

    # basic visibility sanity: if too many low-vis points, warn
    low_vis = sum(1 for p in lms if p.v < min_visibility)
    if low_vis > 10:
        warnings.append(f"Low landmark visibility on {low_vis}/33 points (pose classification may be unreliable).")

    f = compute_features(lms)

    scores: Dict[str, float] = {
        "Handstand": score_handstand(lms, f),
        "Human Flag": score_human_flag(lms, f),
        "Full Planche": score_planche(lms, f),
        "Elbow lever": score_elbow_lever(lms, f),
        "L-Sit": score_l_sit(lms, f),
    }

    lever_score = score_lever_generic(lms, f)
    hint = front_vs_back_hint(lms)
    # split lever score into front/back based on hint (soft split)
    front_boost = clamp01(0.5 + 0.25 * hint)   # very tolerant
    back_boost = clamp01(0.5 - 0.25 * hint)
    scores["Front Lever"] = clamp01(lever_score * front_boost)
    scores["Back Lever"] = clamp01(lever_score * back_boost)

    # pick best
    best_pose = max(scores.items(), key=lambda kv: kv[1])[0]
    best_conf = float(scores[best_pose])

    # if very low confidence, still output best (required) but warn
    if best_conf < 0.55:
        warnings.append(f"Low confidence ({best_conf:.2f}). Consider better framing: full body, good light, camera straight.")

    return best_pose, best_conf, scores, warnings

