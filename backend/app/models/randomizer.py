from pydantic import BaseModel, Field, field_validator, model_validator
from typing_extensions import Self
from typing import List, Optional


class RandomizerRequest(BaseModel):
    count: int = Field(default=1, ge=1, le=20)
    # category: Optional[str] = None
    repetitions: bool = False
    exclude_classes: List[str] = Field(default_factory=list)

class RandomizerResponse(BaseModel):
    classes: List[str]
    count: int
    # category: Optional[str] = None
    repetitions: bool
    exclude_classes: List[str]
    
    @model_validator(mode='after')
    def validate_count_matches(self):
        if len(self.classes) != self.count:
            raise ValueError(f"Expected {self.count} classes but got {len(self.classes)}")
        return self