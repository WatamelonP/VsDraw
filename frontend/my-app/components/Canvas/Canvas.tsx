'use client';
import React from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  startStroke,  // Note: it's startStroke, not startDrawing
  addPoint,
  endStroke,    // Note: it's endStroke, not finishStroke
  cancelStroke,
  undo,
  redo,
  clearDrawing  // Note: it's clearDrawing, not clearAll
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
  const isDrawingRedux = useAppSelector((state) => state.drawing.isDrawing);
  
  // Local state for UI
  const [tool, setTool] = React.useState<string>('pen');
  const [currentPenColor, setCurrentPenColor] = React.useState(penColor);
  const [currentPenWidth, setCurrentPenWidth] = React.useState<number>(5);
  const [currentEraserWidth, setCurrentEraserWidth] = React.useState<number>(20);

  // Ref for mouse tracking
  const isDrawingRef = React.useRef(false);
  const [stageSize, setStageSize] = React.useState({ width: 0, height: 0 });
  const stageRef = React.useRef<any>(null);

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

    // Start a new stroke in Redux
    dispatch(startStroke({ 
      tool,
      color: tool === 'eraser' ? '#ffffff' : currentPenColor,
      strokeWidth: tool === 'eraser' ? currentEraserWidth : currentPenWidth
    }));
    
    // Add the first point
    dispatch(addPoint({ x: pos.x, y: pos.y }));
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawingRef.current) return;
    
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    // Add point to current stroke in Redux
    dispatch(addPoint({ x: point.x, y: point.y }));
    
    // Force redraw for smooth rendering
    stage?.batchDraw();
  };

  const handleMouseUp = () => {
    if (isDrawingRef.current) {
      // End the stroke in Redux
      dispatch(endStroke());
    }
    isDrawingRef.current = false;
  };

  const handleMouseLeave = () => {
    if (isDrawingRef.current) {
      // Cancel if mouse leaves while drawing
      dispatch(cancelStroke());
    }
    isDrawingRef.current = false;
  };

  // For undo/redo to pass to ToolSelector
  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  const handleClear = () => {
    dispatch(clearDrawing());
  };

  // Calculate if undo/redo is available
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
          {/* Render completed strokes from Redux */}
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
          
          {/* Render current stroke being drawn */}
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