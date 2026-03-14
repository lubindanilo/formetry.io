from app.pipeline import score_technique
from app.schemas import Landmark


def test_imports_and_score_shape():
    landmarks = [Landmark(x=0.5, y=0.5, visibility=1.0) for _ in range(33)]
    response = score_technique("planche", landmarks)
    assert response.figure == "planche"
    assert "global" in response.scores
    assert "body_line" in response.dimensions
