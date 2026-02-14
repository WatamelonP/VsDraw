'use client';
import React from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import ToolSelector from './ToolSelector';

type LineData = { tool: string; points: number[] };

const App: React.FC = () => {
  const [tool, setTool] = React.useState<string>('pen');
  const [lines, setLines] = React.useState<LineData[]>([]);
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
    setLines((prev) => [...prev, { tool, points: [pos.x, pos.y] }]);
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
      <ToolSelector tool={tool} onChange={setTool} />
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
              stroke="#ffffff"
              strokeWidth={5}
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