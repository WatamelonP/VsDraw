from pydantic import BaseModel
from typing import Dict, Any, Optional

class WebhookEvent(BaseModel):
    room_id: str
    event_type: str
    data: Dict[str, Any]
    secret: Optional[str] = None
