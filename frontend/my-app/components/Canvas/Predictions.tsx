'use client';
import React from 'react';

type PredictionProps = {
  strokes: any[]; // Your stroke data from Redux
  stageSize: { width: number; height: number };
  onPredictionComplete?: (result: { className: string; confidence: number }) => void;
  difficulty?: 'easy' | 'medium' | 'hard'; // For different endpoints
};

const Prediction: React.FC<PredictionProps> = ({ 
  strokes, 
  stageSize, 
  onPredictionComplete,
  difficulty = 'medium' 
}) => {
  const [prediction, setPrediction] = React.useState<{
    className: string;
    confidence: number;
  } | null>(null);
  const [isPredicting, setIsPredicting] = React.useState(false);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  // Different endpoints based on difficulty
  const getEndpoint = () => {
    switch(difficulty) {
      case 'easy': return 'http://localhost:8000/api/v1/drawing/predict/easy';
      case 'hard': return 'http://localhost:8000/api/v1/drawing/predict/hard';
      default: return 'http://localhost:8000/api/v1/drawing/predict';
    }
  };

  const predictDrawing = async () => {
    // Collect all points from completed strokes
    const allPoints: { x: number; y: number }[] = [];
    strokes.forEach((stroke: any) => {
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
      const response = await fetch(getEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: allPoints,
          canvas_width: stageSize.width,
          canvas_height: stageSize.height,
          difficulty: difficulty // Send difficulty to backend
        })
      });
      
      const result = await response.json();
      
      // Update local state
      setPrediction({
        className: result.class_name,
        confidence: result.confidence
      });
      
      // Notify parent if needed
      if (onPredictionComplete) {
        onPredictionComplete({
          className: result.class_name,
          confidence: result.confidence
        });
      }
      
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  // Auto-predict when strokes change
  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (strokes.length > 0) {
      timeoutRef.current = window.setTimeout(() => {
        predictDrawing();
      }, 500);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [strokes]);

  if (!prediction && !isPredicting) return null;

  return (
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
  );
};

export default Prediction;