from app.scoring.base_types import MetricDefinition
from app.scoring.metrics.extension_metrics import score_hip_extension, score_knee_lockout
from app.scoring.metrics.line_metrics import score_hip_on_line, score_midline_horizontal
from app.scoring.metrics.symmetry_metrics import score_joint_angle_symmetry, score_pair_height_symmetry

FIGURE_NAME = "elbow_lever"

BODY_LINE_METRICS = [
    MetricDefinition("shoulder_ankle_horizontality", score_midline_horizontal, ("LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ANKLE", "RIGHT_ANKLE"), {"start_left": "LEFT_SHOULDER", "start_right": "RIGHT_SHOULDER", "end_left": "LEFT_ANKLE", "end_right": "RIGHT_ANKLE", "tolerance_deg": 10.0, "max_error_deg": 30.0}, 0.50),
    MetricDefinition("hip_on_line", score_hip_on_line, ("LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_HIP", "RIGHT_HIP", "LEFT_ANKLE", "RIGHT_ANKLE"), {"tolerance_ratio": 0.10, "max_ratio": 0.30}, 0.50),
]

SYMMETRY_METRICS = [
    MetricDefinition("hip_height_symmetry", score_pair_height_symmetry, ("LEFT_HIP", "RIGHT_HIP"), {"left_name": "LEFT_HIP", "right_name": "RIGHT_HIP", "tolerance_ratio": 0.08, "max_ratio": 0.30}, 0.35),
    MetricDefinition("knee_height_symmetry", score_pair_height_symmetry, ("LEFT_KNEE", "RIGHT_KNEE"), {"left_name": "LEFT_KNEE", "right_name": "RIGHT_KNEE", "tolerance_ratio": 0.08, "max_ratio": 0.30}, 0.25),
    MetricDefinition("ankle_height_symmetry", score_pair_height_symmetry, ("LEFT_ANKLE", "RIGHT_ANKLE"), {"left_name": "LEFT_ANKLE", "right_name": "RIGHT_ANKLE", "tolerance_ratio": 0.08, "max_ratio": 0.30}, 0.15),
    MetricDefinition("knee_angle_symmetry", score_joint_angle_symmetry, ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE", "RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"), {"left_triplet": ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"), "right_triplet": ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"), "tolerance_deg": 8.0, "max_error_deg": 35.0}, 0.25),
]

LOCKOUT_EXTENSION_METRICS = [
    MetricDefinition("left_knee_lockout", score_knee_lockout, ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"), {"side": "LEFT"}, 0.20),
    MetricDefinition("right_knee_lockout", score_knee_lockout, ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"), {"side": "RIGHT"}, 0.20),
    MetricDefinition("left_hip_extension", score_hip_extension, ("LEFT_SHOULDER", "LEFT_HIP", "LEFT_KNEE"), {"side": "LEFT"}, 0.30),
    MetricDefinition("right_hip_extension", score_hip_extension, ("RIGHT_SHOULDER", "RIGHT_HIP", "RIGHT_KNEE"), {"side": "RIGHT"}, 0.30),
]
