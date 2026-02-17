from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch



origins = [
    "http://localhost:3000",
    # Add your production frontend URL here
]

app = FastAPI(
    title="FASTAPI Personal Project",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # allows all origins, 
    allow_credentials=True, # allows cookies to be sent
    allow_methods=["*"], # allows all methods
    allow_headers=["*"], # allows all headers
)

@app.get("/")
def root():
            return { "message": "hamburger" }

@app.post("/predict")
async def predict(request: dict):
    # Simulated prediction response
    return {
        "class_name": "hamburger",
        "confidence": 0.95
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)