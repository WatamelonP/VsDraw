from fastapi import APIRouter, HTTPException
import torch
import numpy as np
import cv2
from app.models.drawing import DrawingRequest, PredictionResponse
from app.ml_model.inference import infer, CLASS_NAMES
from app.services.randomizer import randomizer_service, RandomizerService
from app.services.preprocessing import preprocessing_service
from app.models.randomizer import RandomizerResponse, RandomizerRequest
import os
from typing import List, Optional

router = APIRouter(prefix="/drawing", tags=["drawing"])

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
classes_file = os.path.join(BACKEND_DIR, 'data', 'classes.txt')
print(f"Looking for classes at: {classes_file}")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")



@router.post("/target", response_model=RandomizerResponse)
async def set_target(request: RandomizerRequest):
    
    random_classes = randomizer_service.get_random_classes(request)
    return RandomizerResponse(
        classes=random_classes,
        count=request.count,
        # category=request.category,
        repetitions=request.repetitions,
        exclude_classes=request.exclude_classes
    )
   

@router.post("/predict", response_model=PredictionResponse)
async def predict(request: DrawingRequest):
    current_target = randomizer_service.get_class()  # Use it
    # ... prediction logic that uses current_target
    return PredictionResponse(
        class_name=current_target,
        confidence=0.95
    )



# def render_to_tensor(request: DrawingRequest) -> torch.Tensor:
   
    # canvas = np.zeros((256, 256))
    
    
    # for i in range(len(request.points) - 1):
    #     p1 = request.points[i]
    #     p2 = request.points[i + 1]
        
    #     x1 = int((p1.x / request.canvas_width) * 255)
    #     y1 = int((p1.y / request.canvas_height) * 255)
    #     x2 = int((p2.x / request.canvas_width) * 255)
    #     y2 = int((p2.y / request.canvas_height) * 255)
        
    #     cv2.line(canvas, (x1, y1), (x2, y2), 255, thickness=3)
    
   
    # low_res = cv2.resize(canvas, (28, 28), interpolation=cv2.INTER_AREA)
    # low_res = low_res / 255.0
    
    # tensor = torch.FloatTensor(low_res).unsqueeze(0)
    # return tensor

# @router.post("/predict", response_model=PredictionResponse)
# async def predict(request: DrawingRequest):
#     try:
#         image_tensor = render_to_tensor(request)
#         predicted_class, confidence = infer(image_tensor)
        
#         return PredictionResponse(
#             class_name=CLASS_NAMES[predicted_class],
#             confidence=float(confidence)
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return {"status": "healthy"}