from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
from .api.main import router
from .core.config import settings
from .services.redis_service import redis_service

app = FastAPI(
    title=settings.PROJECT_NAME,
)
app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.on_event("startup")
async def startup():
    await redis_service.connect()


@app.on_event("shutdown")
async def shutdown():
    await redis_service.disconnect()

app.include_router(router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)