
import React, { useState, useEffect, useRef } from "react";

interface ColorCatchProps {
  onFinish: (score: number, time: number) => void;
}

// Color options
const COLORS = [
  { name: "Red", hex: "#ff0000" },
  { name: "Blue", hex: "#0000ff" },
  { name: "Green", hex: "#00ff00" },
  { name: "Yellow", hex: "#ffff00" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#ffa500" },
];

interface Circle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const ColorCatchGame: React.FC<ColorCatchProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState("");
  const [circles, setCircles] = useState<Circle[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState(30); // 30 second game
  const containerRef = useRef<HTMLDivElement>(null);
  const circleIdRef = useRef(0);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const circleTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Initialize the game
  useEffect(() => {
    // Set a random target color
    const randomColorIndex = Math.floor(Math.random() * COLORS.length);
    setTargetColor(COLORS[randomColorIndex].name);
    
    // Start generating circles
    if (gameActive) {
      gameIntervalRef.current = setInterval(() => {
        if (gameActive && containerRef.current) {
          addNewCircle();
        }
      }, 1000);
    }

    // Start the countdown timer
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      // Clear all circle timeouts
      circleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      circleTimeoutsRef.current.clear();
    };
  }, [gameActive]);

  const addNewCircle = () => {
    if (!containerRef.current || !gameActive) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set random position within container (accounting for circle size)
    const size = 60;
    const margin = size / 2; // Ensure circles stay fully within container
    
    const x = margin + Math.random() * (containerWidth - size);
    const y = margin + Math.random() * (containerHeight - size);
    
    // Randomly choose a color
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const circleId = circleIdRef.current++;
    
    // Create new circle
    const newCircle: Circle = {
      id: circleId,
      x,
      y,
      color: randomColor.name,
      size
    };
    
    setCircles(prev => [...prev, newCircle]);
    
    // Remove the circle after a delay
    const timeout = setTimeout(() => {
      if (gameActive) {
        setCircles(prev => prev.filter(circle => circle.id !== circleId));
        circleTimeoutsRef.current.delete(circleId);
      }
    }, 2500);
    
    circleTimeoutsRef.current.set(circleId, timeout);
  };

  const handleCircleClick = (circleId: number, circleColor: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!gameActive) return;
    
    // Remove the clicked circle and its timeout
    const timeout = circleTimeoutsRef.current.get(circleId);
    if (timeout) {
      clearTimeout(timeout);
      circleTimeoutsRef.current.delete(circleId);
    }
    
    setCircles(prev => prev.filter(c => c.id !== circleId));
    
    // Update score based on whether the correct color was clicked
    if (circleColor === targetColor) {
      setScore(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 1));
    }
  };

  const endGame = () => {
    setGameActive(false);
    
    // Clear all intervals and timeouts
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    circleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    circleTimeoutsRef.current.clear();
    
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 500);
  };

  // Find the hex code for the target color
  const targetColorHex = COLORS.find(c => c.name === targetColor)?.hex || "#ffffff";

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <div className="text-lg mb-2">Tap only the </div>
        <div className="text-2xl font-bold mb-4" style={{ color: targetColorHex }}>
          {targetColor}
        </div>
        <div className="text-sm mb-2 text-luxury-white/70">
          Time: {timeLeft}s | Score: {score}
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="flex-1 relative border border-luxury-white/10 rounded-lg bg-luxury-black overflow-hidden"
      >
        {circles.map(circle => {
          const colorHex = COLORS.find(c => c.name === circle.color)?.hex || "#ffffff";
          
          return (
            <button
              key={circle.id}
              className="absolute rounded-full transition-opacity hover:opacity-90 active:opacity-100 focus:outline-none"
              style={{
                left: `${circle.x}px`,
                top: `${circle.y}px`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                backgroundColor: colorHex,
                opacity: 0.7,
                border: "2px solid rgba(255,255,255,0.3)",
                transform: "translate(-50%, -50%)"
              }}
              onClick={(e) => handleCircleClick(circle.id, circle.color, e)}
              disabled={!gameActive}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColorCatchGame;
