import React, { useState, useEffect, useRef } from "react";

interface CatchBallGameProps {
  onFinish: (score: number, time: number) => void;
}

const BALL_SIZE = 50;
const BALL_SPEED = 2; // px per frame (reduced speed)
const BALL_COUNT = 10;
const SIDES = ["top", "bottom", "left", "right"] as const;
type Side = typeof SIDES[number];
const WORLD_STANDARD_TIME = 0.18; // seconds (180ms)

const reactionTimeBenchmarks = {
  worldClass: 150,
  excellent: 200,
  good: 250,
  average: 300,
  slow: 350,
  verySlow: 500
};

const CatchBallGame: React.FC<CatchBallGameProps> = ({ onFinish }) => {
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [ball, setBall] = useState<{
    x: number;
    y: number;
    dx: number;
    dy: number;
    moving: boolean;
    index: number;
  } | null>(null);
  const [ballIndex, setBallIndex] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastBallSpawnTime, setLastBallSpawnTime] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);
  const [penaltyScore, setPenaltyScore] = useState<number>(0);
  const [penaltyClicks, setPenaltyClicks] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  
  // Initialize first ball
  useEffect(() => {
    setGameStartTime(Date.now());
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
      spawnBall(0, width, height);
      setLastBallSpawnTime(Date.now());
    }
    // eslint-disable-next-line
  }, []);

  // Update container size on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Animate the current ball
  useEffect(() => {
    if (!ball || !ball.moving) return;
    const animate = () => {
      setBall(prev => {
        if (!prev) return null;
        let { x, y, dx, dy, moving, index } = prev;
        x += dx;
        y += dy;
        // Bounce off walls
        if (x <= 0) {
          x = 0;
          dx = Math.abs(dx);
        } else if (x >= containerSize.width - BALL_SIZE) {
          x = containerSize.width - BALL_SIZE;
          dx = -Math.abs(dx);
        }
        if (y <= 0) {
          y = 0;
          dy = Math.abs(dy);
        } else if (y >= containerSize.height - BALL_SIZE) {
          y = containerSize.height - BALL_SIZE;
          dy = -Math.abs(dy);
        }
        return { x, y, dx, dy, moving, index };
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [ball, containerSize]);

  // Spawn a new ball at a random side, moving inwards
  const spawnBall = (index: number, width: number, height: number) => {
    const side: Side = SIDES[Math.floor(Math.random() * SIDES.length)];
    let x = 0, y = 0, dx = 0, dy = 0;
    switch (side) {
      case "top":
        x = Math.random() * (width - BALL_SIZE);
        y = 0;
        dx = (Math.random() - 0.5) * BALL_SPEED * 1.5; // small random angle
        dy = BALL_SPEED;
        break;
      case "bottom":
        x = Math.random() * (width - BALL_SIZE);
        y = height - BALL_SIZE;
        dx = (Math.random() - 0.5) * BALL_SPEED * 1.5;
        dy = -BALL_SPEED;
        break;
      case "left":
        x = 0;
        y = Math.random() * (height - BALL_SIZE);
        dx = BALL_SPEED;
        dy = (Math.random() - 0.5) * BALL_SPEED * 1.5;
        break;
      case "right":
        x = width - BALL_SIZE;
        y = Math.random() * (height - BALL_SIZE);
        dx = -BALL_SPEED;
        dy = (Math.random() - 0.5) * BALL_SPEED * 1.5;
        break;
    }
    setBall({ x, y, dx, dy, moving: true, index });
    setLastBallSpawnTime(Date.now());
  };

  // Handle ball click
  const handleBallClick = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    // Record reaction time
    const now = Date.now();
    if (lastBallSpawnTime) {
      setReactionTimes((prev) => [...prev, now - lastBallSpawnTime]);
    }
    setScore(s => s + 1);
    if (ballIndex + 1 >= BALL_COUNT) {
      setGameOver(true);
      setGameEndTime(now);
      setBall(null);
    } else {
      // Spawn next ball
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setBallIndex(i => i + 1);
        spawnBall(ballIndex + 1, width, height);
      }
    }
  };

  // Handle penalty click (click outside the ball)
  const handlePenaltyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the click target is the container itself (not the ball)
    if (e.target === containerRef.current) {
      setPenaltyClicks((prev) => prev + 1);
      setPenaltyScore((prev) => prev + 50);
    }
  };

  // Calculate stats like ColorChangeGame
  const calculateStats = () => {
    if (reactionTimes.length === 0) return null;
    const sum = reactionTimes.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / reactionTimes.length);
    const best = Math.min(...reactionTimes);
    const worst = Math.max(...reactionTimes);
    const vsWorldClass = average - reactionTimeBenchmarks.worldClass;
    const percentageSlower = Math.round((vsWorldClass / reactionTimeBenchmarks.worldClass) * 100);
    let performanceRating = "";
    if (average <= reactionTimeBenchmarks.worldClass) {
      performanceRating = "World Class";
    } else if (average <= reactionTimeBenchmarks.excellent) {
      performanceRating = "Excellent";
    } else if (average <= reactionTimeBenchmarks.good) {
      performanceRating = "Good";
    } else if (average <= reactionTimeBenchmarks.average) {
      performanceRating = "Average";
    } else if (average <= reactionTimeBenchmarks.slow) {
      performanceRating = "Slow";
    } else {
      performanceRating = "Very Slow";
    }
    return {
      average,
      best,
      worst,
      vsWorldClass,
      percentageSlower,
      performanceRating,
      benchmarks: reactionTimeBenchmarks
    };
  };

  if (gameOver) {
    const totalTimeMs = gameEndTime && gameStartTime ? gameEndTime - gameStartTime : 0;
    const stats = calculateStats();
    const netScore = score - penaltyScore;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Catch Ball Results</div>
          </div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Net Score:</span>
              <span className="font-bold text-luxury-gold">{netScore}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Score:</span>
              <span>{score}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Penalty Deductions:</span>
              <span className="text-red-400">-{penaltyScore} ({penaltyClicks} wrong clicks)</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Avg. Reaction:</span>
              <span>{stats?.average ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Best:</span>
              <span>{stats?.best ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Worst:</span>
              <span>{stats?.worst ?? 0}ms</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Total Time:</span>
              <span>{(totalTimeMs / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Performance:</span>
              <span className="font-semibold text-luxury-gold">{stats?.performanceRating}</span>
            </div>
          </div>
          <button
            className="text-xs text-luxury-gold underline mb-2 focus:outline-none"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide Details" : "Show Detailed Stats"}
          </button>
          {showDetails && (
            <div className="w-full bg-luxury-black/80 rounded-lg border border-luxury-gold/30 p-3 mb-2 max-h-48 overflow-y-auto animate-fade-in">
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Reaction Times (ms):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {reactionTimes.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-luxury-gold/10 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4 mt-4 w-full">
            <button
              className="flex-1 px-4 py-2 bg-luxury-gold text-luxury-black font-semibold rounded hover:bg-yellow-400 transition"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-[calc(100vh-10rem)] w-full bg-gray-900 border-4 border-luxury-gold rounded-xl overflow-hidden"
      style={{ boxSizing: "border-box" }}
      onClick={handlePenaltyClick}
    >
      <div className="absolute left-0 right-0 top-0 flex justify-between p-4 text-white z-10">
        <div className="rounded-md bg-black/50 px-3 py-1 backdrop-blur-sm">
          Score: {score}
        </div>
        <div className="rounded-md bg-black/50 px-3 py-1 backdrop-blur-sm">
          Ball: {ballIndex + (gameOver ? 0 : 1)}/{BALL_COUNT}
        </div>
      </div>
      {ball && (
        <button
          className="absolute rounded-full bg-luxury-gold transition-transform hover:scale-105 focus:outline-none touch-target active:scale-95 shadow-lg"
          style={{
            left: ball.x,
            top: ball.y,
            width: BALL_SIZE,
            height: BALL_SIZE,
            cursor: "pointer",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            zIndex: 100,
            boxShadow: "0 0 15px rgba(255, 215, 0, 0.7)",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            border: "3px solid #fff8",
            transform: "translate(0, 0)",
          }}
          onClick={handleBallClick}
          aria-label="Click to catch the ball"
          role="button"
          tabIndex={0}
        />
      )}
    </div>
  );
};

export default CatchBallGame;
