from app.scoring.base_types import MetricDefinition
from app.scoring.metrics.compression_metrics import score_lsit_leg_height
from app.scoring.metrics.extension_metrics import score_elbow_lockout, score_knee_lockout
from app.scoring.metrics.line_metrics import score_midline_horizontal, score_midline_vertical
from app.scoring.metrics.symmetry_metrics import score_joint_angle_symmetry, score_pair_height_symmetry

FIGURE_NAME = "lsit"

BODY_LINE_METRICS = [
    MetricDefinition("torso_verticality", score_midline_vertical, ("LEFT_HIP", "RIGHT_HIP", "LEFT_SHOULDER", "RIGHT_SHOULDER"), {"start_left": "LEFT_HIP", "start_right": "RIGHT_HIP", "end_left": "LEFT_SHOULDER", "end_right": "RIGHT_SHOULDER", "tolerance_deg": 6.0, "max_error_deg": 20.0}, 0.20),
    MetricDefinition("legs_horizontality", score_midline_horizontal, ("LEFT_HIP", "RIGHT_HIP", "LEFT_ANKLE", "RIGHT_ANKLE"), {"start_left": "LEFT_HIP", "start_right": "RIGHT_HIP", "end_left": "LEFT_ANKLE", "end_right": "RIGHT_ANKLE", "tolerance_deg": 6.0, "max_error_deg": 20.0}, 0.25),
    MetricDefinition("leg_height", score_lsit_leg_height, ("LEFT_HIP", "RIGHT_HIP", "LEFT_ANKLE", "RIGHT_ANKLE"), {"tolerance_ratio": 0.06, "max_ratio": 0.28}, 0.25),
]

SYMMETRY_METRICS = [
    MetricDefinition("hip_height_symmetry", score_pair_height_symmetry, ("LEFT_HIP", "RIGHT_HIP"), {"left_name": "LEFT_HIP", "right_name": "RIGHT_HIP", "tolerance_ratio": 0.05, "max_ratio": 0.24}, 0.20),
    MetricDefinition("knee_height_symmetry", score_pair_height_symmetry, ("LEFT_KNEE", "RIGHT_KNEE"), {"left_name": "LEFT_KNEE", "right_name": "RIGHT_KNEE", "tolerance_ratio": 0.05, "max_ratio": 0.24}, 0.25),
    MetricDefinition("ankle_height_symmetry", score_pair_height_symmetry, ("LEFT_ANKLE", "RIGHT_ANKLE"), {"left_name": "LEFT_ANKLE", "right_name": "RIGHT_ANKLE", "tolerance_ratio": 0.05, "max_ratio": 0.24}, 0.20),
    MetricDefinition("knee_angle_symmetry", score_joint_angle_symmetry, ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE", "RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"), {"left_triplet": ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"), "right_triplet": ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"), "tolerance_deg": 8.0, "max_error_deg": 35.0}, 0.35),
]

LOCKOUT_EXTENSION_METRICS = [
    MetricDefinition("left_elbow_lockout", score_elbow_lockout, ("LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"), {"side": "LEFT"}, 0.30),
    MetricDefinition("right_elbow_lockout", score_elbow_lockout, ("RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST"), {"side": "RIGHT"}, 0.30),
    MetricDefinition("left_knee_lockout", score_knee_lockout, ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"), {"side": "LEFT"}, 0.20),
    MetricDefinition("right_knee_lockout", score_knee_lockout, ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"), {"side": "RIGHT"}, 0.20),
]
