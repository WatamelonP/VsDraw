from fastapi import APIRouter
from .routes import drawing, multiplayer

router = APIRouter()

router.include_router(drawing.router)
router.include_router(multiplayer.router)

