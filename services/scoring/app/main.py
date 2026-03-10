from fastapi import FastAPI, HTTPException

from app.pipeline import score_technique
from app.registries import FIGURE_REGISTRY
from app.schemas import (
    PoseClassifyRequest,
    PoseClassifyResponse,
    TechniqueScoreRequest,
    TechniqueScoreResponse,
)

app = FastAPI(
    title="AI Form Coach - Scoring Service",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/pose/classify", response_model=PoseClassifyResponse)
def pose_classify(request: PoseClassifyRequest) -> PoseClassifyResponse:
    try:
        landmarks = request.landmarks
        if len(landmarks) < 33:
            raise HTTPException(
                status_code=400,
                detail="Expected 33 MediaPipe landmarks",
            )
        best_figure = None
        best_confidence = -1.0
        all_scores: dict[str, float] = {}
        for figure_key in FIGURE_REGISTRY:
            try:
                result = score_technique(figure_key, landmarks)
                conf = result.confidence.get("global", 0.0)
                all_scores[figure_key] = conf
                if conf > best_confidence:
                    best_confidence = conf
                    best_figure = figure_key
            except (ValueError, Exception):
                all_scores[figure_key] = 0.0
        if best_figure is None:
            best_figure = "planche"
            best_confidence = 0.0
        # Frontend expects "l_sit" not "lsit"
        pose_for_api = "l_sit" if best_figure == "lsit" else best_figure
        return PoseClassifyResponse(
            pose=pose_for_api,
            confidence=round(best_confidence, 4),
            scores=all_scores if request.include_debug else None,
            warnings=[],
            sample_id=None,
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/score-technique", response_model=TechniqueScoreResponse)
def score_technique_route(request: TechniqueScoreRequest) -> TechniqueScoreResponse:
    try:
        return score_technique(request.figure, request.landmarks)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Scoring error: {exc}") from exc
