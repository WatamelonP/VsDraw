import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addRemoteStroke, syncDrawing, clearDrawing } from '../store/slices/drawingSlice';
import { setClasses, setGameStatus, setTimer, updateScores, nextTarget } from '../store/slices/gameSlice';
import { updateUser, removeUserFromRoom, setRoomUsers, setGameSettings } from '../store/slices/roomSlice';

export const useMultiplayer = (roomId: string | null, userId: string | null) => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket | null>(null);
  const playerName = useAppSelector((state) => state.room.playerName);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  useEffect(() => {
    if (!roomId || !userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    let apiHost = 'localhost:8000';
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
        apiHost = apiUrl.host;
      }
    } catch (e) {
      console.warn('Could not parse API URL', e);
    }

    const nameParam = playerName ? `?name=${encodeURIComponent(playerName)}` : '';
    const socket = new WebSocket(`${protocol}//${apiHost}/api/v1/multiplayer/ws/${roomId}/${userId}${nameParam}`);

    socket.onopen = () => {
      console.log('Connected to multiplayer');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const { type, data } = message;

      switch (type) {
        case 'ROOM_SYNC':
          dispatch(setRoomUsers(data.players));
          dispatch(updateScores(data.scores));
          
          if (data.gameState.status) {
            dispatch(setGameStatus(data.gameState.status));
          }
          if (data.gameState.classes) {
            dispatch(setClasses(data.gameState.classes));
            for (let i = 0; i < (data.gameState.currentIndex || 0); i++) {
              dispatch(nextTarget());
            }
          }
          if (data.gameSettings) {
            dispatch(setGameSettings(data.gameSettings));
          }
          break;
        case 'STROKE_ADDED':
          break;
        case 'DRAWING_SYNC':
          dispatch(syncDrawing(data));
          break;
        case 'CLEAR_CANVAS':
          dispatch(clearDrawing());
          break;
        case 'GAME_STATUS_UPDATE':
          dispatch(setGameStatus(data.status));
          break;
        case 'TIMER_UPDATE':
          dispatch(setTimer(data.seconds));
          break;
        case 'SCORE_UPDATE':
          dispatch(updateScores(data.scores));
          break;
        case 'NEXT_TARGET':
          dispatch(nextTarget());
          break;
        case 'CLASSES_UPDATE':
          dispatch(setClasses(data.classes));
          break;
        case 'USER_JOINED':
          dispatch(updateUser(data));
          break;
        case 'PLAYER_READY':
          dispatch(updateUser({ id: data.user_id, isReady: data.isReady }));
          break;
        case 'GAME_SETTINGS_UPDATE':
          if (data.settings) {
            dispatch(setGameSettings(data.settings));
          }
          break;
        case 'USER_LEFT':
          dispatch(removeUserFromRoom(data.user_id));
          break;
        default:
          console.warn('Unknown event type:', type);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from multiplayer');
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [roomId, userId, playerName, dispatch]);

  return { sendMessage };
};
