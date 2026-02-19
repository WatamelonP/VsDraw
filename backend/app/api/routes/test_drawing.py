# app/api/routes/test_drawing.py
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_dir))

# Now you can import
from app.api.routes.drawing import router
from app.models.drawing import DrawingRequest
from app.api.routes.drawing import set_target
from app.api.routes.drawing import predict_drawing
# Your test code here


print("Test successful")