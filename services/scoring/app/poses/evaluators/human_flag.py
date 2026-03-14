from app.geometry import xy
from app.scoring.engine import evaluate_dimension
from app.poses.specs.human_flag_spec import BODY_LINE_METRICS, FIGURE_NAME, SYMMETRY_METRICS, build_lockout_metrics


def _bottom_arm_side(landmarks) -> str:
    _, left_y = xy(landmarks, "LEFT_WRIST")
    _, right_y = xy(landmarks, "RIGHT_WRIST")
    return "LEFT" if left_y > right_y else "RIGHT"


def score_body_line(landmarks):
    return evaluate_dimension(landmarks, BODY_LINE_METRICS)


def score_symmetry(landmarks):
    return evaluate_dimension(landmarks, SYMMETRY_METRICS)


def score_lockout_extension(landmarks):
    return evaluate_dimension(landmarks, build_lockout_metrics(_bottom_arm_side(landmarks)))


def score_all(landmarks):
    return {
        "body_line": score_body_line(landmarks),
        "symmetry": score_symmetry(landmarks),
        "lockout_extension": score_lockout_extension(landmarks),
    }
