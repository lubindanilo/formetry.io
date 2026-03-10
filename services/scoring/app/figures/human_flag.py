from app.geometry import xy
from app.reliability import metric_confidence
from app.scoring_utils import (
    build_dimension,
    make_metric,
    score_elbow_lockout,
    score_hip_on_line,
    score_joint_angle_symmetry,
    score_knee_lockout,
    score_midline_horizontal,
    score_pair_height_symmetry,
)

FIGURE_NAME = "human_flag"


def _bottom_arm_side(landmarks) -> str:
    _, left_y = xy(landmarks, "LEFT_WRIST")
    _, right_y = xy(landmarks, "RIGHT_WRIST")
    return "LEFT" if left_y > right_y else "RIGHT"


def score_body_line(landmarks):
    metrics = [
        make_metric(
            "shoulder_ankle_horizontality",
            score_midline_horizontal(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ANKLE", "RIGHT_ANKLE"),
            metric_confidence(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ANKLE", "RIGHT_ANKLE"),
        ),
        make_metric(
            "hip_on_line",
            score_hip_on_line(landmarks),
            metric_confidence(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_HIP", "RIGHT_HIP", "LEFT_ANKLE", "RIGHT_ANKLE"),
        ),
    ]
    return build_dimension(metrics, weights={"shoulder_ankle_horizontality": 0.55, "hip_on_line": 0.45})


def score_symmetry(landmarks):
    metrics = [
        make_metric("hip_height_symmetry", score_pair_height_symmetry(landmarks, "LEFT_HIP", "RIGHT_HIP"), metric_confidence(landmarks, "LEFT_HIP", "RIGHT_HIP")),
        make_metric("knee_height_symmetry", score_pair_height_symmetry(landmarks, "LEFT_KNEE", "RIGHT_KNEE"), metric_confidence(landmarks, "LEFT_KNEE", "RIGHT_KNEE")),
        make_metric("ankle_height_symmetry", score_pair_height_symmetry(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE"), metric_confidence(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE")),
        make_metric(
            "knee_angle_symmetry",
            score_joint_angle_symmetry(
                landmarks,
                ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"),
                ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"),
            ),
            metric_confidence(landmarks, "LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE", "RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"),
        ),
    ]
    return build_dimension(metrics)


def score_lockout_extension(landmarks):
    bottom_side = _bottom_arm_side(landmarks)
    metrics = [
        make_metric(
            "bottom_arm_lockout",
            score_elbow_lockout(landmarks, bottom_side),
            metric_confidence(landmarks, f"{bottom_side}_SHOULDER", f"{bottom_side}_ELBOW", f"{bottom_side}_WRIST"),
            meta={"bottom_arm_side": bottom_side},
        ),
        make_metric("left_knee_lockout", score_knee_lockout(landmarks, "LEFT"), metric_confidence(landmarks, "LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE")),
        make_metric("right_knee_lockout", score_knee_lockout(landmarks, "RIGHT"), metric_confidence(landmarks, "RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE")),
    ]
    return build_dimension(
        metrics,
        weights={
            "bottom_arm_lockout": 0.45,
            "left_knee_lockout": 0.275,
            "right_knee_lockout": 0.275,
        },
    )


def score_all(landmarks):
    return {
        "body_line": score_body_line(landmarks),
        "symmetry": score_symmetry(landmarks),
        "lockout_extension": score_lockout_extension(landmarks),
    }
