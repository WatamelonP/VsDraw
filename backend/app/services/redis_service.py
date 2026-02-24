import redis.asyncio as redis
import json
from typing import Optional, Any, Dict
from ..core.config import settings

class RedisService:
    def __init__(self):
        # Build Redis URL
        if settings.REDIS_PASSWORD:
            self.redis_url = f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
        else:
            self.redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
        self.client: Optional[redis.Redis] = None  # Add type hint
    
    async def connect(self) -> None:
        """Connect to Redis"""
        self.client = await redis.from_url(
            self.redis_url,
            decode_responses=True
        )
        # Use type ignore for methods the type checker doesn't recognize
        await self.client.ping()  # type: ignore
        print("✅ Connected to Redis")
    
    async def disconnect(self) -> None:
        """Close Redis connection"""
        if self.client:
            await self.client.close()  # type: ignore
            print("❌ Disconnected from Redis")
    
    # Room management
    async def create_room(self, room_id: str, room_data: dict) -> bool:
        """Create a new game room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"room:{room_id}"
        await self.client.hset(key, mapping=room_data)  # type: ignore
        await self.client.expire(key, 3600)  # type: ignore
        return True
    
    async def get_room(self, room_id: str) -> Optional[dict]:
        """Get room data"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"room:{room_id}"
        data = await self.client.hgetall(key)  # type: ignore
        return data if data else None
    
    # Game state per room
    async def set_game_state(self, room_id: str, state: dict) -> None:
        """Set game state for a room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"game:{room_id}"
        await self.client.hset(key, mapping=state)  # type: ignore
    
    async def get_game_state(self, room_id: str) -> dict:
        """Get game state for a room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"game:{room_id}"
        return await self.client.hgetall(key)  # type: ignore
    
    # Target management
    async def set_current_target(self, room_id: str, target: str) -> None:
        """Set current target for a room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"target:{room_id}"
        await self.client.set(key, target)  # type: ignore
        await self.client.expire(key, 300)  # type: ignore
    
    async def get_current_target(self, room_id: str) -> Optional[str]:
        """Get current target for a room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"target:{room_id}"
        return await self.client.get(key)  # type: ignore
    
    # Player management
    async def add_player(self, room_id: str, player_id: str, player_data: dict) -> None:
        """Add a player to a room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"room:{room_id}:players"
        await self.client.hset(key, player_id, json.dumps(player_data))  # type: ignore
    
    async def remove_player(self, room_id: str, player_id: str) -> None:
        """Remove a player from a room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"room:{room_id}:players"
        await self.client.hdel(key, player_id)  # type: ignore
    
    async def get_players(self, room_id: str) -> dict:
        """Get all players in a room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"room:{room_id}:players"
        players = await self.client.hgetall(key)  # type: ignore
        return {pid: json.loads(data) for pid, data in players.items()}
    
    # Score tracking
    async def update_score(self, room_id: str, player_id: str, score: int) -> None:
        """Update player score"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"scores:{room_id}"
        await self.client.hincrby(key, player_id, score)  # type: ignore
    
    async def get_scores(self, room_id: str) -> dict:
        """Get all scores for a room"""
        if not self.client:
            raise Exception("Redis not connected")
        key = f"scores:{room_id}"
        return await self.client.hgetall(key)  # type: ignore

# Create singleton
redis_service = RedisService()