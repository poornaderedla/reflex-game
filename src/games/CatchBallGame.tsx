import React, { useState, useEffect, useRef, useCallback } from "react";

interface CatchBallGameProps {
  onFinish: (score: number, time: number) => void;
}

const CatchBallGame: React.FC<CatchBallGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 });
  const [ballActive, setBallActive] = useState<boolean>(false);
  const [ballSize, setBallSize] = useState<number>(70);
  const [speed, setSpeed] = useState<number>(0.5);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxMisses = 5; // Game ends after 5 misses
  const animationFrameRef = useRef<number>(0);
  
  // Initialize game
  useEffect(() => {
    setGameStartTime(Date.now());
    launchBall();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Increase difficulty as score increases
  useEffect(() => {
    // Every 5 points, increase speed and decrease ball size
    if (score > 0 && score % 5 === 0) {
      setSpeed(prevSpeed => Math.min(prevSpeed + 0.2, 2));
      setBallSize(prevSize => Math.max(prevSize - 1, 50));
    }
  }, [score]);
  
  const launchBall = useCallback(() => {
    if (!containerRef.current) return;
    
    // Random x position between 10% and 90% of container width
    const randomX = Math.random() * 80 + 10;
    setBallPosition({ x: randomX, y: 0 });
    setBallActive(true);
    
    let y = 0;
    const animate = () => {
      y += speed;
      setBallPosition({ x: randomX, y });
      
      const containerHeight = containerRef.current?.clientHeight || 0;
      
      // If the ball reaches the bottom
      if (y >= 100) {
        setMisses(prev => {
          const newMisses = prev + 1;
          if (newMisses >= maxMisses) {
            // Game over
            onFinish(score, Date.now() - gameStartTime);
          } else {
            // Launch a new ball
            setTimeout(launchBall, 500);
          }
          return newMisses;
        });
        setBallActive(false);
        return;
      }
      
      if (ballActive) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [speed, score, gameStartTime, ballActive, onFinish]);
  
  const handleBallClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event bubbling
    
    if (!ballActive) return;
    
    // Cancel animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Calculate score based on speed and current position
    // Catching higher up gives more points
    const heightBonus = 100 - ballPosition.y;
    const newPoints = Math.floor(10 + (heightBonus / 10) + speed * 2);
    
    setScore(prevScore => prevScore + newPoints);
    setBallActive(false);
    
    // Launch next ball
    setTimeout(launchBall, 500);
  }, [ballActive, ballPosition.y, speed, launchBall]);

  return (
    <div 
      ref={containerRef}
      className="relative h-[calc(100vh-10rem)] w-full overflow-hidden bg-gray-900"
    >
      <div className="absolute left-0 right-0 top-0 flex justify-between p-4 text-white">
        <div className="rounded-md bg-black/50 px-3 py-1 backdrop-blur-sm">
          Score: {score}
        </div>
        <div className="rounded-md bg-black/50 px-3 py-1 backdrop-blur-sm">
          Misses: {misses}/{maxMisses}
        </div>
      </div>
      
      {ballActive && (
        <button
          className="absolute rounded-full bg-luxury-gold transition-transform hover:scale-105 focus:outline-none touch-target active:scale-95"
          style={{
            left: `${ballPosition.x}%`,
            top: `${ballPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            width: `${ballSize}px`,
            height: `${ballSize}px`,
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            padding: '20px', // Even larger hit area
            zIndex: 1000,
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.7)', // More visible glow
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
          onClick={handleBallClick}
          onTouchStart={handleBallClick}
          onTouchEnd={handleBallClick}
          aria-label="Click to catch the ball"
          role="button"
          tabIndex={0}
        />
      )}
      
      {misses >= maxMisses && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-2xl font-bold text-white">Game Over!</div>
        </div>
      )}
    </div>
  );
};

export default CatchBallGame;
