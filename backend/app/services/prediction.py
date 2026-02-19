from ..ml_model.inference import infer, CLASS_NAMES
# from ..api.routes.drawing import render_to_tensor
import cv2
import numpy as np
import torch


class PredictionService:
    async def predict(self, drawing_data):
        # ML prediction
        pass
    
    async def batch_predict(self, drawings):
        # For analyzing multiple drawings at once
        pass
    
    async def get_confidence_scores(self, drawing_data):
        # Get all class probabilities for a drawing
        pass