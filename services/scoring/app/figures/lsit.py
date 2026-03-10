from app.reliability import metric_confidence
from app.scoring_utils import (
    average,
    build_dimension,
    make_metric,
    score_elbow_lockout,
    score_joint_angle_symmetry,
    score_knee_lockout,
    score_lsit_compression,
    score_lsit_leg_height,
    score_midline_horizontal,
    score_midline_vertical,
    score_pair_height_symmetry,
)

FIGURE_NAME = "lsit"


def score_body_line(landmarks):
    left_compression = score_lsit_compression(landmarks, "LEFT")
    right_compression = score_lsit_compression(landmarks, "RIGHT")

    metrics = [
        make_metric(
            "torso_verticality",
            score_midline_vertical(landmarks, "LEFT_HIP", "RIGHT_HIP", "LEFT_SHOULDER", "RIGHT_SHOULDER"),
            metric_confidence(landmarks, "LEFT_HIP", "RIGHT_HIP", "LEFT_SHOULDER", "RIGHT_SHOULDER"),
        ),
        make_metric(
            "legs_horizontality",
            score_midline_horizontal(landmarks, "LEFT_HIP", "RIGHT_HIP", "LEFT_ANKLE", "RIGHT_ANKLE"),
            metric_confidence(landmarks, "LEFT_HIP", "RIGHT_HIP", "LEFT_ANKLE", "RIGHT_ANKLE"),
        ),
        make_metric(
            "leg_height",
            score_lsit_leg_height(landmarks),
            metric_confidence(landmarks, "LEFT_HIP", "RIGHT_HIP", "LEFT_ANKLE", "RIGHT_ANKLE"),
        ),
        make_metric(
            "compression",
            average([left_compression, right_compression]),
            metric_confidence(landmarks, "LEFT_SHOULDER", "LEFT_HIP", "LEFT_KNEE", "RIGHT_SHOULDER", "RIGHT_HIP", "RIGHT_KNEE"),
        ),
    ]
    return build_dimension(
        metrics,
        weights={
            "torso_verticality": 0.25,
            "legs_horizontality": 0.30,
            "leg_height": 0.20,
            "compression": 0.25,
        },
    )


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
    metrics = [
        make_metric("left_elbow_lockout", score_elbow_lockout(landmarks, "LEFT"), metric_confidence(landmarks, "LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST")),
        make_metric("right_elbow_lockout", score_elbow_lockout(landmarks, "RIGHT"), metric_confidence(landmarks, "RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST")),
        make_metric("left_knee_lockout", score_knee_lockout(landmarks, "LEFT"), metric_confidence(landmarks, "LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE")),
        make_metric("right_knee_lockout", score_knee_lockout(landmarks, "RIGHT"), metric_confidence(landmarks, "RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE")),
    ]
    return build_dimension(metrics)


def score_all(landmarks):
    return {
        "body_line": score_body_line(landmarks),
        "symmetry": score_symmetry(landmarks),
        "lockout_extension": score_lockout_extension(landmarks),
    }
