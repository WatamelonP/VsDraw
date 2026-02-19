from pydantic import BaseModel
from typing import List, Optional

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
    canvas_width: int
    canvas_height: int
    difficulty: Optional[str] = "medium" 

class PredictionResponse(BaseModel):
    class_name: str
    confidence: float