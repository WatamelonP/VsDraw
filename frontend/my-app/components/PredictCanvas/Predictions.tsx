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
  topGuesses: { class_name: string; confidence: number }[];
} | null>(null);
  const [isPredicting, setIsPredicting] = React.useState(false);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  const predictDrawing = async () => {
    if (!target || classes.length === 0) return; // guard: no game state yet
    if (stageSize.width === 0 || stageSize.height === 0) return;
    const allPoints: { x: number; y: number }[] = [];
    strokes
    .filter((stroke: any) => stroke.tool !== 'eraser')
    .forEach((stroke: any) => {
      for (let i = 0; i < stroke.points.length; i += 2) {
        allPoints.push({ x: stroke.points[i], y: stroke.points[i + 1] });
      }
    });

  if (allPoints.length === 0) return;


    setIsPredicting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drawing/predict`, {
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
     setPrediction({
  className: result.class_name,
  confidence: result.confidence,
  topGuesses: result.top_guesses,
});
      
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
  <div className="fixed top-4 right-4 bg-card border border-border p-4 rounded-xl shadow-lg min-w-48">
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
      I think it's...
    </p>
    {isPredicting ? (
      <p className="text-muted-foreground text-sm animate-pulse">Analyzing...</p>
    ) : prediction && (
      <>
        <div className="flex flex-col gap-2">
          {prediction.topGuesses.map((guess, i) => (
            <div key={guess.class_name} className="flex items-center justify-between gap-4">
              <span className={`capitalize text-sm ${
                guess.class_name === target
                  ? 'text-primary font-bold'
                  : 'text-foreground'
              }`}>
                {i + 1}. {guess.class_name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {(guess.confidence * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
        <div className="h-px bg-border my-3" />
        <p className="text-xs text-muted-foreground">
          Target: <span className="text-primary font-bold capitalize">{target}</span>
        </p>
      </>
    )}
  </div>
);
};

export default Prediction;