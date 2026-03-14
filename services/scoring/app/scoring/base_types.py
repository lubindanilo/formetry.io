from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any


ScoreFn = Callable[..., float]


@dataclass(frozen=True)
class MetricDefinition:
    name: str
    scorer: ScoreFn
    confidence_points: tuple[str, ...]
    kwargs: dict[str, Any] = field(default_factory=dict)
    weight: float = 1.0
    meta: dict[str, Any] | None = None
