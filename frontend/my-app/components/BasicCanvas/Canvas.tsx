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
import Menu from '../LandingPage/Menu';

type CanvasProps = {
  penColor?: string;
};

const Canvas: React.FC<CanvasProps> = ({ penColor = '#ffffff' }) => {
  const dispatch = useAppDispatch();

  const strokes = useAppSelector((state) => state.drawing.strokes);
  const currentStroke = useAppSelector((state) => state.drawing.currentStroke);
  const canUndo = useAppSelector((state) => state.drawing.history.past.length > 0);
  const canRedo = useAppSelector((state) => state.drawing.history.future.length > 0);

  const [tool, setTool] = React.useState<string>('pen');
  const [currentPenColor, setCurrentPenColor] = React.useState(penColor);
  const [currentPenWidth, setCurrentPenWidth] = React.useState<number>(5);
  const [currentEraserWidth, setCurrentEraserWidth] = React.useState<number>(20);
  const [stageSize, setStageSize] = React.useState({ width: 0, height: 0 });

  const isDrawingRef = React.useRef<boolean>(false);
  const stageRef = React.useRef<Konva.Stage | null>(null);

  // Auto-clear stroke history when canvas is fully erased
  React.useEffect(() => {
    const hasVisibleStrokes = strokes.some((s) => s.tool !== 'eraser');
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
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    dispatch(startStroke({
      tool,
      color: tool === 'eraser' ? '#ffffff' : currentPenColor,
      strokeWidth: tool === 'eraser' ? currentEraserWidth : currentPenWidth,
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
    if (isDrawingRef.current) dispatch(endStroke());
    isDrawingRef.current = false;
  };

  const handleMouseLeave = () => {
    if (isDrawingRef.current) dispatch(cancelStroke());
    isDrawingRef.current = false;
  };

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
        onUndo={() => dispatch(undo())}
        onRedo={() => dispatch(redo())}
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

        {/* Drawing layer */}
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