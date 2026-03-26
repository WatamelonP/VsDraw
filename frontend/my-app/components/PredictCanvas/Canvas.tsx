'use client';
import React from 'react';
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
  clearDrawing
} from '@/store/slices/drawingSlice';
import ToolSelector from './ToolSelector';
import Prediction from './Predictions'; // Import Prediction component

type CanvasProps = {
  penColor?: string;
  difficulty?: 'easy' | 'medium' | 'hard'; // Pass difficulty down
};

const Canvas: React.FC<CanvasProps> = ({ 
  penColor = '#ffffff',
  difficulty = 'medium' 
}) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const strokes = useAppSelector((state) => state.drawing.strokes);
  const currentStroke = useAppSelector((state) => state.drawing.currentStroke);
  
  // Local state
  const [tool, setTool] = React.useState<string>('pen');
  const [currentPenColor, setCurrentPenColor] = React.useState(penColor);
  const [currentPenWidth, setCurrentPenWidth] = React.useState<number>(5);
  const [currentEraserWidth, setCurrentEraserWidth] = React.useState<number>(20);
  
  // Refs
  const isDrawingRef = React.useRef<boolean>(false);
  const [stageSize, setStageSize] = React.useState({ width: 0, height: 0 });
  const stageRef = React.useRef<Konva.Stage | null>(null);


  const currentTarget = useAppSelector((state) => state.game.currentTarget);
  const classes = useAppSelector((state) => state.game.classes);

  React.useEffect(() => {
  // if user has erased everything, clear stroke history too
  const hasVisibleStrokes = strokes.some(s => s.tool !== 'eraser');
  if (!hasVisibleStrokes && strokes.length > 0) {
    dispatch(clearDrawing());
  }
}, [strokes]);

  React.useEffect(() => {
    const onResize = () =>
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMouseDown = (e: any) => {
    isDrawingRef.current = true;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    dispatch(startStroke({ 
      tool,
      color: tool === 'eraser' ? '#ffffff' : currentPenColor,
      strokeWidth: tool === 'eraser' ? currentEraserWidth : currentPenWidth
    }));
    dispatch(addPoint({ x: pos.x, y: pos.y }));
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawingRef.current) return;
    
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    dispatch(addPoint({ x: point.x, y: point.y }));
    stage?.batchDraw();
  };

  const handleMouseUp = () => {
    if (isDrawingRef.current) {
      dispatch(endStroke());
    }
    isDrawingRef.current = false;
  };

  const handleMouseLeave = () => {
    if (isDrawingRef.current) {
      dispatch(cancelStroke());
    }
    isDrawingRef.current = false;
  };

  const handleUndo = () => dispatch(undo());
  const handleRedo = () => dispatch(redo());
  const handleClear = () => dispatch(clearDrawing());

  const canUndo = useAppSelector((state) => state.drawing.history.past.length > 0);
  const canRedo = useAppSelector((state) => state.drawing.history.future.length > 0);

  return (
    <div>
      <ToolSelector 
        tool={tool} 
        onChange={setTool} 
        onColorChange={setCurrentPenColor} 
        onWidthChange={setCurrentPenWidth} 
        currentWidth={currentPenWidth} 
        onEraserWidthChange={setCurrentEraserWidth} 
        currentEraserWidth={currentEraserWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      {/* Prediction Component - completely separate! */}
      <Prediction 
        strokes={strokes}
        stageSize={stageSize}
        target={currentTarget ?? ''}
        classes={classes}
        difficulty={difficulty}
      />
      
      <Stage
        width={stageSize.width || 800}
        height={stageSize.height || 600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        ref={stageRef}
      >
         <Layer listening={false}>
    <Rect
      x={0}
      y={0}
      width={stageSize.width || 800}
      height={stageSize.height || 600}
    />
  </Layer>

        <Layer>
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
          
          {currentStroke && currentStroke.points.length > 0 && (
            <Line
              points={currentStroke.points}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                currentStroke.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;