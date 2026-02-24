import torch
import numpy as np
import cv2
from app.models.drawing import DrawingRequest

class PreprocessingService:
    @staticmethod
    def render_to_tensor(points, canvas_width: int, canvas_height: int) -> torch.Tensor:
        canvas = np.zeros((256, 256))
        
        for i in range(len(points) - 1):
            p1 = points[i]
            p2 = points[i + 1]
            
            x1 = int((p1.x / canvas_width) * 255)
            y1 = int((p1.y / canvas_height) * 255)
            x2 = int((p2.x / canvas_width) * 255)
            y2 = int((p2.y / canvas_height) * 255)
            
            cv2.line(canvas, (x1, y1), (x2, y2), 255, thickness=3)
        
        # crop to bounding box of the drawing
        coords = cv2.findNonZero(canvas)
        if coords is not None:
            x, y, w, h = cv2.boundingRect(coords)
            padding = 10
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(255 - x, w + padding * 2)
            h = min(255 - y, h + padding * 2)
            canvas = canvas[y:y+h, x:x+w]
        
        low_res = cv2.resize(canvas, (28, 28), interpolation=cv2.INTER_AREA)
        # low_res = low_res / 255.0 // this sht got me stuck for a hours -_- kept on giving me 0 confidence. was added by copilot during an earlier refactor, but removed now that i know the issue
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