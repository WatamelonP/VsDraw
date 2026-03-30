from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "QuickDraw API"
    API_V1_STR: str = "/api/v1"
   
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://192.168.1.6:3000"]
    
    MODEL_PATH: str = "ml_model/model_epoch18.pt"
    CLASSES_PATH: str = "ml_model/classes.txt"
    
    REDIS_URL: str = "redis://localhost:6379"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()