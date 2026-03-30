'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import Konva from 'konva';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  startStroke,
  addPoint,
  endStroke,
  cancelStroke,
  undo,
  redo,
  clearDrawing,
  hardClearDrawing
} from '@/store/slices/drawingSlice';
import { setClasses, setGameStatus } from '@/store/slices/gameSlice';
import ToolSelector from '../PredictCanvas/ToolSelector';
import Prediction from '../PredictCanvas/Predictions';
import ScoreBoard from './ScoreBoard';
import Lobby from './Lobby';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { Play } from 'lucide-react';

const MultiplayerCanvas: React.FC = () => {
  const dispatch = useAppDispatch();
  const roomId = useAppSelector((state) => state.room.currentRoomId);
  const gameStatus = useAppSelector((state) => state.game.status);
  const currentTarget = useAppSelector((state) => state.game.currentTarget);
  const classes = useAppSelector((state) => state.game.classes);
  const difficulty = useAppSelector((state) => state.game.difficulty);
  
  // Use a stable userId (mocked as user-XXXX for now, should come from auth/session)
  const userIdRef = useRef("user-" + Math.random().toString(36).substr(2, 5));
  const userId = userIdRef.current;
  
  const { sendMessage } = useMultiplayer(roomId, userId);

  // Redux state
  const strokes = useAppSelector((state) => state.drawing.strokes);
  const currentStroke = useAppSelector((state) => state.drawing.currentStroke);
  
  // Local state
  const [tool, setTool] = useState<string>('pen');
  const [currentPenColor, setCurrentPenColor] = useState('#ffffff');
  const [currentPenWidth, setCurrentPenWidth] = useState<number>(5);
  const [currentEraserWidth, setCurrentEraserWidth] = useState<number>(20);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const stageRef = React.useRef<Konva.Stage | null>(null);
  const isScoringRef = useRef(false);

  useEffect(() => {
    const onResize = () =>
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMouseDown = (e: any) => {
    if (gameStatus !== 'playing') return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const strokeData = { 
      tool,
      color: tool === 'eraser' ? '#1a1a1a' : currentPenColor,
      strokeWidth: tool === 'eraser' ? currentEraserWidth : currentPenWidth,
      userId
    };

    dispatch(startStroke(strokeData));
    dispatch(addPoint({ x: pos.x, y: pos.y }));
  };

  const handleMouseMove = (e: any) => {
    if (!currentStroke) return;
    
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    dispatch(addPoint({ x: point.x, y: point.y }));
  };

  const handleMouseUp = () => {
    if (currentStroke) {
      // Strokes are entirely local now, no need to broadcast
      dispatch(endStroke());
    }
  };

  const handlePredictionComplete = useCallback((result: { className: string; confidence: number }) => {
    if (result.className === currentTarget && !isScoringRef.current) {
      isScoringRef.current = true;
      sendMessage('SCORE_UPDATE', { user_id: userId, increment: 1 });
      sendMessage('NEXT_TARGET', {});
      dispatch(hardClearDrawing());
      
      // Unlock after a 2-second delay to allow target state to propagate and prevent duplicate scoring
      setTimeout(() => {
        isScoringRef.current = false;
      }, 2000);
    }
  }, [currentTarget, userId, sendMessage, dispatch]);

  const handleStartGame = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drawing/target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10, repetitions: false, exclude_classes: [] }),
      });
      const data = await response.json();
      
      // Broadcast game start to everyone
      sendMessage('GAME_STATUS_UPDATE', { status: 'playing' });
      sendMessage('CLASSES_UPDATE', { classes: data.classes });
      
      dispatch(setGameStatus('playing'));
      dispatch(setClasses(data.classes));
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ToolSelector 
        tool={tool} 
        onChange={setTool} 
        onColorChange={setCurrentPenColor} 
        onWidthChange={setCurrentPenWidth} 
        currentWidth={currentPenWidth} 
        onEraserWidthChange={setCurrentEraserWidth} 
        currentEraserWidth={currentEraserWidth}
        onUndo={() => dispatch(undo())}
        onRedo={() => dispatch(redo())}
        canUndo={false} 
        canRedo={false}
      />
      
      <ScoreBoard />

      {gameStatus === 'playing' ? (
        <>
          <Prediction 
            strokes={strokes}
            stageSize={stageSize}
            target={currentTarget ?? ''}
            classes={classes}
            difficulty={difficulty}
            onPredictionComplete={handlePredictionComplete}
          />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-bold z-50">
            Room: <span className="text-primary">{roomId || 'None'}</span>
          </div>

          <Stage
            width={stageSize.width || 800}
            height={stageSize.height || 600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            ref={stageRef}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={stageSize.width || 800}
                height={stageSize.height || 600}
                fill="#1a1a1a"
              />
              {strokes.map((stroke) => (
                <Line
                  key={stroke.id}
                  points={stroke.points}
                  stroke={stroke.color}
                  strokeWidth={stroke.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
              
              {currentStroke && (
                <Line
                  points={currentStroke.points}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </Layer>
          </Stage>
        </>
      ) : (
        <Lobby onStartGame={handleStartGame} />
      )}
    </div>
  );
};

export default MultiplayerCanvas;
