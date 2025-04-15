
import React, { useState, useEffect } from "react";
import { Square, Circle, Triangle } from "lucide-react";

interface ReflexTapProps {
  onFinish: (score: number, time: number) => void;
}

const ReflexTapGame: React.FC<ReflexTapProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [targetShape, setTargetShape] = useState<"circle" | "square" | "triangle">("circle");
  const [startTime] = useState<number>(Date.now());
  const [lastAppearTime, setLastAppearTime] = useState<number>(0);
  const [tapsCount, setTapsCount] = useState(0);
  const maxTaps = 15;

  // Initialize the game
  useEffect(() => {
    setTimeout(showNewTarget, 1000);
  }, []);

  const showNewTarget = () => {
    if (!gameActive) return;
    
    // Hide target first
    setShowTarget(false);
    
    // Random delay before showing next target (between 1 and 3 seconds)
    const delay = Math.floor(Math.random() * 2000) + 1000;
    
    setTimeout(() => {
      if (!gameActive) return;
      
      // Random position
      setTargetPosition({
        x: Math.floor(Math.random() * 80), // percentage of container width
        y: Math.floor(Math.random() * 80)  // percentage of container height
      });
      
      // Random shape
      const shapes: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];
      setTargetShape(shapes[Math.floor(Math.random() * shapes.length)]);
      
      // Show target and record time
      setShowTarget(true);
      setLastAppearTime(Date.now());
    }, delay);
  };

  const handleTargetTap = () => {
    if (!gameActive || !showTarget) return;
    
    // Calculate reaction time
    const reactionTime = Date.now() - lastAppearTime;
    
    // Score is inversely proportional to reaction time, capped at 1000ms
    const newPoints = Math.max(1, Math.floor(1000 / Math.max(reactionTime, 100)));
    setScore(prev => prev + newPoints);
    
    // Increase tap count
    setTapsCount(prev => {
      const next = prev + 1;
      if (next >= maxTaps) {
        endGame();
        return next;
      }
      return next;
    });
    
    // Show next target
    showNewTarget();
  };

  const handleMiss = () => {
    if (!gameActive || !showTarget) return;
    
    // Penalty for missing
    setScore(prev => Math.max(0, prev - 5));
    
    // Still count this tap
    setTapsCount(prev => {
      const next = prev + 1;
      if (next >= maxTaps) {
        endGame();
        return next;
      }
      return next;
    });
    
    // Show next target
    showNewTarget();
  };

  const endGame = () => {
    setGameActive(false);
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 500);
  };

  const renderShape = () => {
    const size = 48;
    const className = "text-luxury-gold";
    
    switch (targetShape) {
      case "circle":
        return <Circle size={size} className={className} />;
      case "square":
        return <Square size={size} className={className} />;
      case "triangle":
        return <Triangle size={size} className={className} />;
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="text-center mb-4">
        <div className="text-lg mb-1">Tap the shapes as fast as you can!</div>
        <div className="text-sm mb-4 text-luxury-white/70">
          Taps: {tapsCount}/{maxTaps} | Score: {score}
        </div>
      </div>
      
      <div 
        className="flex-1 w-full relative border border-luxury-white/10 rounded-lg bg-luxury-black overflow-hidden"
        onClick={handleMiss}
      >
        {showTarget && (
          <button
            className="absolute p-4 rounded-full hover:bg-luxury-white/10 focus:outline-none touch-none"
            style={{
              left: `${targetPosition.x}%`,
              top: `${targetPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleTargetTap();
            }}
          >
            {renderShape()}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReflexTapGame;
