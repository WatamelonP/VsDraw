from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "QuickDraw API"
    API_V1_STR: str = "/api/v1"
   
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    MODEL_PATH: str = "ml_model/model_epoch18.pt"
    CLASSES_PATH: str = "ml_model/classes.txt"
    
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"

settings = Settings()