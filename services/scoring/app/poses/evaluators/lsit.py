from app.scoring.aggregation import average, build_dimension, make_metric
from app.scoring.confidence import resolve_metric_confidence
from app.scoring.engine import evaluate_dimension
from app.scoring.metrics.compression_metrics import score_lsit_compression
from app.poses.specs.lsit_spec import BODY_LINE_METRICS, FIGURE_NAME, LOCKOUT_EXTENSION_METRICS, SYMMETRY_METRICS


def score_body_line(landmarks):
    base_dimension = evaluate_dimension(landmarks, BODY_LINE_METRICS)
    left_compression = score_lsit_compression(landmarks, "LEFT", target_deg=90.0, tolerance_deg=10.0, max_error_deg=55.0)
    right_compression = score_lsit_compression(landmarks, "RIGHT", target_deg=90.0, tolerance_deg=10.0, max_error_deg=55.0)
    compression_confidence = resolve_metric_confidence(landmarks, ("LEFT_SHOULDER", "LEFT_HIP", "LEFT_KNEE", "RIGHT_SHOULDER", "RIGHT_HIP", "RIGHT_KNEE"))
    compression_metric = make_metric("compression", average([left_compression, right_compression]), compression_confidence)
    metrics = [*base_dimension.metrics, compression_metric]
    return build_dimension(metrics, weights={"torso_verticality": 0.20, "legs_horizontality": 0.25, "leg_height": 0.25, "compression": 0.30})


def score_symmetry(landmarks):
    return evaluate_dimension(landmarks, SYMMETRY_METRICS)


def score_lockout_extension(landmarks):
    return evaluate_dimension(landmarks, LOCKOUT_EXTENSION_METRICS)


def score_all(landmarks):
    return {
        "body_line": score_body_line(landmarks),
        "symmetry": score_symmetry(landmarks),
        "lockout_extension": score_lockout_extension(landmarks),
    }
