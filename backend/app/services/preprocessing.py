import torch
import numpy as np
import cv2
from app.models.drawing import DrawingRequest

class PreprocessingService:
    @staticmethod
    def render_to_tensor(points, canvas_width: int, canvas_height: int) -> torch.Tensor:
        """Convert drawing points to 28x28 tensor"""
        canvas = np.zeros((256, 256))
        
        for i in range(len(points) - 1):
            p1 = points[i]
            p2 = points[i + 1]
            
            x1 = int((p1.x / canvas_width) * 255)
            y1 = int((p1.y / canvas_height) * 255)
            x2 = int((p2.x / canvas_width) * 255)
            y2 = int((p2.y / canvas_height) * 255)
            
            cv2.line(canvas, (x1, y1), (x2, y2), 255, thickness=3)
        
        low_res = cv2.resize(canvas, (28, 28), interpolation=cv2.INTER_AREA)
        low_res = low_res / 255.0
        
        tensor = torch.FloatTensor(low_res).unsqueeze(0)
        return tensor
    
    @staticmethod
    def render_to_tensor_from_request(request: DrawingRequest) -> torch.Tensor:
        """Convenience method that takes the whole request"""
        return PreprocessingService.render_to_tensor(
            request.points,
            request.canvas_width,
            request.canvas_height
        )
    
    @staticmethod
    def batch_render(drawings: list[DrawingRequest]) -> torch.Tensor:
        """Convert multiple drawings to batch tensor"""
        tensors = []
        for drawing in drawings:
            tensors.append(
                PreprocessingService.render_to_tensor_from_request(drawing)
            )
        return torch.stack(tensors)

# Create singleton instance
preprocessing_service = PreprocessingService()