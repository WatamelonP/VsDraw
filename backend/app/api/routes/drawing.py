from fastapi import APIRouter, Depends, HTTPException
from torch import tensor

router = APIRouter(
    tags=["drawing"],
    prefix="/drawing")

@router.post("/predict")
async def predict():
        return {
        "class_name": "hamburger",
        "confidence": 0.95,
        # "tensor_shape": str(tensor.shape)  # For debugging
    }