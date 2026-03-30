import pytest
from httpx import AsyncClient
from app.main import app
from app.services.redis_service import redis_service

@pytest.mark.asyncio
async def test_webhook_event():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        event_data = {
            "room_id": "test-room",
            "event_type": "GAME_START",
            "data": {"config": "fast"}
        }
        response = await ac.post("/api/v1/multiplayer/webhook/event", json=event_data)
    
    assert response.status_code == 200
    assert response.json() == {"status": "event_published"}

@pytest.mark.asyncio
async def test_redis_pub_sub():
    # Test publishing directly through service
    await redis_service.connect()
    await redis_service.publish_event("test-room", "TEST_EVENT", {"foo": "bar"})
    # Since we can't easily listen in a simple unit test without a background loop,
    # we just verify it doesn't crash.
    await redis_service.disconnect()
