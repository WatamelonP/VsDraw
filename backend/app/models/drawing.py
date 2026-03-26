from pydantic import BaseModel, model_validator
from typing import List, Optional, Self

class Point(BaseModel):
    x: float
    y: float

class Stroke(BaseModel):
    id: str
    points: List[Point]
    color: str
    strokeWidth: int
    tool: str
    userId: Optional[str] = None

class DrawingRequest(BaseModel):
    points: List[Point]
    target: str
    canvas_width: int
    canvas_height: int
    difficulty: Optional[str] = "medium"
    classes: List[str] = []

    @model_validator(mode='after')
    def validate_target_in_classes(self) -> Self:
        if self.target not in self.classes:
            raise ValueError(f"target '{self.target}' must be one of the provided classes")
        return self
    def validate_canvas_size(self) -> Self:
        if self.canvas_width == 0 or self.canvas_height == 0:
            raise ValueError("canvas_width and canvas_height must be greater than 0")
        return self

class PredictionResponse(BaseModel):
    class_name: str
    confidence: float
    top_guesses: list[dict]

    