'use client';
import React from 'react';
import { Stage, Layer, Line } from 'react-konva';
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

type CanvasProps = {
  penColor?: string;
};

const Canvas: React.FC<CanvasProps> = ({ penColor = '#ffffff' }) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const strokes = useAppSelector((state) => state.drawing.strokes);
  const currentStroke = useAppSelector((state) => state.drawing.currentStroke);
  
  // Local state
  const [tool, setTool] = React.useState<string>('pen');
  const [currentPenColor, setCurrentPenColor] = React.useState(penColor);
  const [currentPenWidth, setCurrentPenWidth] = React.useState<number>(5);
  const [currentEraserWidth, setCurrentEraserWidth] = React.useState<number>(20);
  
  // 🔴 ADD THIS - Prediction state
  const [prediction, setPrediction] = React.useState<{
    className: string;
    confidence: number;
  } | null>(null);
  const [isPredicting, setIsPredicting] = React.useState(false);

  // Refs
  const isDrawingRef = React.useRef<boolean>(false);
  const [stageSize, setStageSize] = React.useState({ width: 0, height: 0 });
  const stageRef = React.useRef<Konva.Stage | null>(null);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () =>
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 🔴 ADD THIS - Auto-predict when strokes change
  React.useEffect(() => {
    // Don't predict if drawing is in progress
    if (isDrawingRef.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout to predict after user stops drawing
    timeoutRef.current = window.setTimeout(() => {
      if (strokes.length > 0) {
        predictDrawing();
      }
    }, 500); // Wait 500ms after last stroke
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [strokes]);

  // 🔴 ADD THIS - Prediction function
  const predictDrawing = async () => {
    // Collect all points from completed strokes
    const allPoints: { x: number; y: number }[] = [];
    strokes.forEach(stroke => {
      for (let i = 0; i < stroke.points.length; i += 2) {
        allPoints.push({
          x: stroke.points[i],
          y: stroke.points[i + 1]
        });
      }
    });

    if (allPoints.length === 0) return;

    setIsPredicting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/drawing/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: allPoints,
          canvas_width: stageSize.width,
          canvas_height: stageSize.height
        })
      });
      
      const result = await response.json();
      setPrediction({
        className: result.class_name,
        confidence: result.confidence
      });
      
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setIsPredicting(false);
    }
  };

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

  const handleUndo = () => {
    dispatch(undo());
    // Clear prediction when drawing changes
    setPrediction(null);
  };

  const handleRedo = () => {
    dispatch(redo());
    setPrediction(null);
  };

  const handleClear = () => {
    dispatch(clearDrawing());
    setPrediction(null);
  };

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
      
  
      {(prediction || isPredicting) && (
        <div className="fixed top-4 right-4 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg">
          {isPredicting ? (
            <p className="text-gray-500">Analyzing drawing...</p>
          ) : prediction && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">Prediction:</p>
              <p className="text-2xl font-bold capitalize">{prediction.className}</p>
              <p className="text-lg">{(prediction.confidence * 100).toFixed(1)}%</p>
            </>
          )}
        </div>
      )}
      
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