from app.registries import get_figure_module
from app.schemas import Landmark, TechniqueScoreResponse
from app.scoring_utils import average, clamp_score, weighted_average


def score_technique(figure: str, landmarks: list[Landmark]) -> TechniqueScoreResponse:
    if len(landmarks) < 33:
        raise ValueError("Expected 33 MediaPipe landmarks.")

    module = get_figure_module(figure)

    body_line = module.score_body_line(landmarks)
    symmetry = module.score_symmetry(landmarks)
    lockout_extension = module.score_lockout_extension(landmarks)

    dimension_scores = {
        "body_line": body_line.score,
        "symmetry": symmetry.score,
        "lockout_extension": lockout_extension.score,
    }

    dimension_confidence = {
        "body_line": body_line.confidence,
        "symmetry": symmetry.confidence,
        "lockout_extension": lockout_extension.confidence,
    }

    global_score = weighted_average(
        values=[
            body_line.score,
            symmetry.score,
            lockout_extension.score,
        ],
        weights=[
            0.40 * body_line.confidence,
            0.30 * symmetry.confidence,
            0.30 * lockout_extension.confidence,
        ],
    )

    global_confidence = average(
        [body_line.confidence, symmetry.confidence, lockout_extension.confidence]
    )

    return TechniqueScoreResponse(
        figure=module.FIGURE_NAME,
        scores={
            **{key: clamp_score(value) for key, value in dimension_scores.items()},
            "global": clamp_score(global_score),
        },
        confidence={
            **dimension_confidence,
            "global": round(max(0.25, min(1.0, global_confidence)), 3),
        },
        dimensions={
            "body_line": body_line,
            "symmetry": symmetry,
            "lockout_extension": lockout_extension,
        },
    )
