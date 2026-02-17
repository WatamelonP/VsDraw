from fastapi import APIRouter
from .routes import drawing

router = APIRouter()

router.include_router(drawing.router)

