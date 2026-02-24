# app/services/session.py
from typing import Optional

class SessionService:
    def __init__(self):
        self._current_classes: list[str] = []
        self._current_target: Optional[str] = None

    def set_classes(self, classes: list[str]):
        self._current_classes = classes
        self._current_target = classes[0] if classes else None

    def get_classes(self) -> list[str]:
        return self._current_classes

    def get_current_target(self) -> Optional[str]:
        return self._current_target

    def is_valid_target(self, class_name: str) -> bool:
        return class_name in self._current_classes

session_service = SessionService()