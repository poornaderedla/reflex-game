
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

  // Initialize the game
  useEffect(() => {
    // Set a random target color
    const randomColorIndex = Math.floor(Math.random() * COLORS.length);
    setTargetColor(COLORS[randomColorIndex].name);
    
    // Start generating circles
    const intervalId = setInterval(() => {
      if (gameActive && containerRef.current) {
        addNewCircle();
      }
    }, 1000);

    // Start the countdown timer
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          clearInterval(timerId);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(timerId);
    };
  }, [gameActive]);

  const addNewCircle = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set random position within container
    const x = Math.random() * (containerWidth - 60);
    const y = Math.random() * (containerHeight - 60);
    
    // Randomly choose a color
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Create new circle
    const newCircle: Circle = {
      id: circleIdRef.current++,
      x,
      y,
      color: randomColor.name,
      size: 60
    };
    
    setCircles(prev => [...prev, newCircle]);
    
    // Remove the circle after a delay
    setTimeout(() => {
      setCircles(prev => prev.filter(circle => circle.id !== newCircle.id));
    }, 2500);
  };

  const handleCircleClick = (circle: Circle) => {
    // Remove the clicked circle
    setCircles(prev => prev.filter(c => c.id !== circle.id));
    
    // Update score based on whether the correct color was clicked
    if (circle.color === targetColor) {
      setScore(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 1));
    }
  };

  const endGame = () => {
    setGameActive(false);
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
        className="flex-1 relative border border-luxury-white/10 rounded-lg bg-luxury-black overflow-hidden touch-none"
      >
        {circles.map(circle => {
          const colorHex = COLORS.find(c => c.name === circle.color)?.hex || "#ffffff";
          
          return (
            <button
              key={circle.id}
              className="absolute rounded-full transition-opacity"
              style={{
                left: `${circle.x}px`,
                top: `${circle.y}px`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                backgroundColor: colorHex,
                opacity: 0.7,
                border: "2px solid rgba(255,255,255,0.3)"
              }}
              onClick={() => handleCircleClick(circle)}
              disabled={!gameActive}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColorCatchGame;
