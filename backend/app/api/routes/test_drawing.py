# app/api/routes/test_drawing.py
import sys
from pathlib import Path


backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_dir))


from app.api.routes.drawing import router
from app.models.drawing import DrawingRequest
from app.api.routes.drawing import set_target
#from app.api.routes.drawing import predict_drawing



print("Test successful")