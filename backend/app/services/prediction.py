
import os
from ..ml_model.model import CLASS_NAMES, loaded_model
# from ..api.routes.drawing import render_to_tensor
# import cv2
import numpy as np
import torch

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class PredictionService:
    def __init__(self):
        self.model = loaded_model.to(device)


    def predict(self, tensor: torch.Tensor, classes: list[str], target: str) -> tuple[float, list[dict[str, float]]]:
        # ML prediction
        self.model.eval()
    
        # print(f"input tensor: {tensor}")
        with torch.inference_mode():
            output = self.model(tensor.unsqueeze(0).to(device))
            # print(f"raw output shape: {output.shape}")
            # print(f"raw output: {output}")
            output = torch.softmax(output, dim=1).squeeze()
            # print(f"after softmax: {output}")

        target_index = CLASS_NAMES.index(target)
        confidence = output[target_index].item()

        top_k = torch.topk(output, 3)
        top_guesses = [
            {"class_name": CLASS_NAMES[idx], "confidence": round(output[idx].item(), 4)}
            for idx in top_k.indices.tolist()
        ]
        # print(f"target: {target}, index: {target_index}, confidence: {confidence}")
        # print(f"all target classes: {classes}")
        
        
        return confidence, top_guesses

prediction_service = PredictionService()
        
    
    # async def batch_predict(self, drawings):
    #     # For analyzing multiple drawings at once
    #     pass
    
    # async def get_confidence_scores(self, drawing_data):
    #     # Get all class probabilities for a drawing
    #     pass