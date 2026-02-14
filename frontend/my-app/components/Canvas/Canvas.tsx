'use client';
import React from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import ToolSelector from './ToolSelector';
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

type LineData = { tool: string; points: number[]; color?: string; strokeWidth?: number };

type CanvasProps = {
  penColor?: string;
};

const App: React.FC<CanvasProps> = ({ penColor = '#ffffff' }) => {
  const [tool, setTool] = React.useState<string>('pen');
  const [lines, setLines] = React.useState<LineData[]>([]);
  const [currentPenColor, setCurrentPenColor] = React.useState(penColor);
  const [currentPenWidth, setCurrentPenWidth] = React.useState<number>(5);
  const [currentEraserWidth, setCurrentEraserWidth] = React.useState<number>(20);
  const isDrawing = React.useRef(false);
  const [stageSize, setStageSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const onResize = () =>
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage && stage.getPointerPosition();
    if (!pos) return;
    setLines((prev) => [...prev, { tool, points: [pos.x, pos.y], color: tool === 'pen' ? currentPenColor : undefined, strokeWidth: tool === 'pen' ? currentPenWidth : tool === 'eraser' ? currentEraserWidth : undefined }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage && stage.getPointerPosition();
    if (!point) return;

    setLines((prev) => {
      if (prev.length === 0) return prev;
      const newLines = prev.slice();
      const lastIndex = newLines.length - 1;
      const lastLine = newLines[lastIndex];
      newLines[lastIndex] = {
        ...lastLine,
        points: lastLine.points.concat([point.x, point.y]),
      };
      return newLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <ToolSelector tool={tool} onChange={setTool} onColorChange={setCurrentPenColor} onWidthChange={setCurrentPenWidth} currentWidth={currentPenWidth} onEraserWidthChange={setCurrentEraserWidth} currentEraserWidth={currentEraserWidth} />
      <Stage
        width={stageSize.width || 800}
        height={stageSize.height || 600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color || '#ffffff'}
                  strokeWidth={line.strokeWidth ?? (line.tool === 'eraser' ? currentEraserWidth : currentPenWidth)}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;