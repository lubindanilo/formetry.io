from app.reliability import metric_confidence
from app.scoring_utils import (
    build_dimension,
    make_metric,
    score_elbow_lockout,
    score_hip_extension,
    score_hip_on_line,
    score_joint_angle_symmetry,
    score_knee_lockout,
    score_midline_horizontal,
    score_pair_height_symmetry,
)

FIGURE_NAME = "back_lever"


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
        make_metric("shoulder_height_symmetry", score_pair_height_symmetry(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER"), metric_confidence(landmarks, "LEFT_SHOULDER", "RIGHT_SHOULDER")),
        make_metric("hip_height_symmetry", score_pair_height_symmetry(landmarks, "LEFT_HIP", "RIGHT_HIP"), metric_confidence(landmarks, "LEFT_HIP", "RIGHT_HIP")),
        make_metric("ankle_height_symmetry", score_pair_height_symmetry(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE"), metric_confidence(landmarks, "LEFT_ANKLE", "RIGHT_ANKLE")),
        make_metric(
            "elbow_angle_symmetry",
            score_joint_angle_symmetry(
                landmarks,
                ("LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"),
                ("RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST"),
            ),
            metric_confidence(landmarks, "LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST", "RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST"),
        ),
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
    metrics = [
        make_metric("left_elbow_lockout", score_elbow_lockout(landmarks, "LEFT"), metric_confidence(landmarks, "LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST")),
        make_metric("right_elbow_lockout", score_elbow_lockout(landmarks, "RIGHT"), metric_confidence(landmarks, "RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST")),
        make_metric("left_knee_lockout", score_knee_lockout(landmarks, "LEFT"), metric_confidence(landmarks, "LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE")),
        make_metric("right_knee_lockout", score_knee_lockout(landmarks, "RIGHT"), metric_confidence(landmarks, "RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE")),
        make_metric("left_hip_extension", score_hip_extension(landmarks, "LEFT"), metric_confidence(landmarks, "LEFT_SHOULDER", "LEFT_HIP", "LEFT_KNEE")),
        make_metric("right_hip_extension", score_hip_extension(landmarks, "RIGHT"), metric_confidence(landmarks, "RIGHT_SHOULDER", "RIGHT_HIP", "RIGHT_KNEE")),
    ]
    return build_dimension(metrics)


def score_all(landmarks):
    return {
        "body_line": score_body_line(landmarks),
        "symmetry": score_symmetry(landmarks),
        "lockout_extension": score_lockout_extension(landmarks),
    }
