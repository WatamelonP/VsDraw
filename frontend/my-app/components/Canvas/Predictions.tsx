'use client';
import React from 'react';

type PredictionProps = {
  strokes: any[];
  stageSize: { width: number; height: number };
  target: string;
  classes: string[];
  onPredictionComplete?: (result: { className: string; confidence: number }) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
};

const Prediction: React.FC<PredictionProps> = ({ 
  strokes, 
  stageSize,
  target,
  classes,
  onPredictionComplete,
  difficulty = 'medium' 
}) => {
  const [prediction, setPrediction] = React.useState<{
    className: string;
    confidence: number;
  } | null>(null);
  const [isPredicting, setIsPredicting] = React.useState(false);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  const predictDrawing = async () => {
    if (!target || classes.length === 0) return; // guard: no game state yet

    const allPoints: { x: number; y: number }[] = [];
    strokes
    .filter((stroke: any) => stroke.tool !== 'eraser')
    .forEach((stroke: any) => {
      for (let i = 0; i < stroke.points.length; i += 2) {
        allPoints.push({ x: stroke.points[i], y: stroke.points[i + 1] });
      }
    });

  if (allPoints.length === 0) return;

    strokes.forEach((stroke: any) => {
      for (let i = 0; i < stroke.points.length; i += 2) {
        allPoints.push({ x: stroke.points[i], y: stroke.points[i + 1] });
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
          canvas_height: stageSize.height,
          difficulty,
          target,
          classes
        })
      });
      
      const result = await response.json();
      setPrediction({ className: result.class_name, confidence: result.confidence });
      
      if (onPredictionComplete) {
        onPredictionComplete({ className: result.class_name, confidence: result.confidence });
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  React.useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (strokes.length > 0) {
      timeoutRef.current = window.setTimeout(predictDrawing, 500);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [strokes, target]); // target in deps so it re-evaluates on next round

  if (!prediction && !isPredicting) return null;

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg">
      {isPredicting ? (
        <p className="text-gray-500">Analyzing drawing...</p>
      ) : prediction && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drawing: <span className="font-semibold capitalize">{target}</span>
          </p>
          <p className="text-lg">{(prediction.confidence * 100).toFixed(1)}% confidence</p>
        </>
      )}
    </div>
  );
};

export default Prediction;