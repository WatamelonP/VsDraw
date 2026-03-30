from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Body
from typing import List, Dict, Any
import json
import asyncio
from ...services.redis_service import redis_service
from ...models.multiplayer import WebhookEvent

router = APIRouter(prefix="/multiplayer", tags=["multiplayer"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_room(self, room_id: str, message: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.get("/room/{room_id}/exists")
async def check_room_exists(room_id: str):
    exists = await redis_service.room_exists(room_id)
    return {"exists": exists}

@router.websocket("/ws/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await manager.connect(room_id, websocket)
    
    # Subscribe to Redis channel for this room in a separate task
    pubsub = await redis_service.subscribe(room_id)
    
    async def listen_to_redis():
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    await websocket.send_text(message["data"])
        except Exception as e:
            print(f"Redis listen error: {e}")
        finally:
            await pubsub.unsubscribe(f"room:{room_id}:events")

    redis_task = asyncio.create_task(listen_to_redis())

    player_data = {"id": user_id, "name": f"Player {user_id[-4:]}"}
    try:
        await redis_service.add_player(room_id, user_id, player_data)
        strokes = await redis_service.get_strokes(room_id)
        players = await redis_service.get_players(room_id)
        scores = await redis_service.get_scores(room_id)
        
        game_state = await redis_service.client.hgetall(f"room:{room_id}:state")  # type: ignore
        if "classes" in game_state:
            game_state["classes"] = json.loads(game_state["classes"])
        if "currentIndex" in game_state:
            game_state["currentIndex"] = int(game_state["currentIndex"])
            
        await websocket.send_text(json.dumps({
            "type": "ROOM_SYNC",
            "data": {
                "strokes": strokes,
                "players": list(players.values()),
                "scores": scores,
                "gameState": game_state
            }
        }))
        
        # Send initial join event
        await redis_service.publish_event(room_id, "USER_JOINED", player_data)
        
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Broadcast message to Redis (which will then reach everyone via pubsub)
            event_type = message_data.get("type", "UNKNOWN")
            event_data = message_data.get("data", {})
            
            if event_type == "STROKE_ADDED":
                await redis_service.add_stroke(room_id, event_data)
            elif event_type == "CLEAR_CANVAS":
                await redis_service.clear_strokes(room_id)
            
            if event_type == "SCORE_UPDATE":
                await redis_service.update_score(
                    room_id, 
                    event_data.get("user_id"), 
                    event_data.get("increment", 0)
                )
                # Fetch updated scores to broadcast
                all_scores = await redis_service.get_scores(room_id)
                event_data["scores"] = all_scores
                
            if event_type == "GAME_STATUS_UPDATE":
                await redis_service.client.hset(f"room:{room_id}:state", "status", event_data.get("status"))  # type: ignore
            elif event_type == "CLASSES_UPDATE":
                await redis_service.client.hset(f"room:{room_id}:state", "classes", json.dumps(event_data.get("classes")))  # type: ignore
            elif event_type == "NEXT_TARGET":
                await redis_service.client.hincrby(f"room:{room_id}:state", "currentIndex", 1)  # type: ignore

            await redis_service.publish_event(room_id, event_type, event_data)
            
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        redis_task.cancel()
        await redis_service.remove_player(room_id, user_id)
        await redis_service.publish_event(room_id, "USER_LEFT", {"user_id": user_id})
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(room_id, websocket)
        redis_task.cancel()
        await redis_service.remove_player(room_id, user_id)

@router.post("/webhook/event")
async def trigger_webhook_event(event: WebhookEvent):
    # In a real app, you'd verify a secret here
    await redis_service.publish_event(event.room_id, event.event_type, event.data)
    return {"status": "event_published"}
