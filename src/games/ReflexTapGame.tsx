
import React, { useState, useEffect, useRef } from "react";

const SHAPES = [
  {
    type: "circle",
    render: (color: string) => (
      <svg width={60} height={60}>
        <circle cx={30} cy={30} r={24} fill={color} stroke="#fff" strokeWidth={4} />
      </svg>
    ),
  },
  {
    type: "square",
    render: (color: string) => (
      <svg width={60} height={60}>
        <rect x={10} y={10} width={40} height={40} fill={color} stroke="#fff" strokeWidth={4} rx={8} />
      </svg>
    ),
  },
  {
    type: "triangle",
    render: (color: string) => (
      <svg width={60} height={60}>
        <polygon points="30,8 52,52 8,52" fill={color} stroke="#fff" strokeWidth={4} />
      </svg>
    ),
  },
];

const SHAPE_COLORS = {
  circle: "#facc15", // Yellow
  square: "#38bdf8", // Sky
  triangle: "#f87171", // Red
};

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
  const [recentTap, setRecentTap] = useState<"success" | "miss" | null>(null);
  const maxTaps = 15;
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameActive) {
      showNewTarget();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line
  }, [gameActive]);

  const showNewTarget = () => {
    if (!gameActive || !gameContainerRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTarget(false);

    // Random delay 800-1700ms for snappier, more dynamic play
    const delay = Math.floor(Math.random() * 900) + 800;
    timeoutRef.current = setTimeout(() => {
      if (!gameActive || !gameContainerRef.current) return;
      const container = gameContainerRef.current;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const pad = 40; // safe padding
      const x = Math.floor(Math.random() * (w - pad * 2)) + pad;
      const y = Math.floor(Math.random() * (h - pad * 2)) + pad;
      const nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)].type as
        | "circle"
        | "square"
        | "triangle";
      setTargetPosition({ x, y });
      setTargetShape(nextShape);
      setShowTarget(true);
      setLastAppearTime(Date.now());
    }, delay);
  };

  const handleTargetTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gameActive || !showTarget) return;
    setRecentTap("success");
    const rt = Date.now() - lastAppearTime;
    const newPoints = Math.max(1, Math.floor(900 / Math.max(rt, 90)));
    setScore((prev) => prev + newPoints);
    setTapsCount((prev) => {
      const next = prev + 1;
      if (next >= maxTaps) {
        endGame();
        return next;
      }
      return next;
    });
    setShowTarget(false);
    setTimeout(() => {
      setRecentTap(null);
      showNewTarget();
    }, 90);
  };

  const handleMiss = () => {
    if (!gameActive || !showTarget) return;
    setRecentTap("miss");
    setScore((prev) => Math.max(0, prev - 6));
    setTapsCount((prev) => {
      const next = prev + 1;
      if (next >= maxTaps) {
        endGame();
        return next;
      }
      return next;
    });
    setShowTarget(false);
    setTimeout(() => {
      setRecentTap(null);
      showNewTarget();
    }, 120);
  };

  const endGame = () => {
    setGameActive(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 400);
  };

  // Animated feedback effect
  const feedbackColor =
    recentTap === "success"
      ? "bg-luxury-gold/30"
      : recentTap === "miss"
      ? "bg-red-500/20"
      : "";

  return (
    <div className="flex flex-col items-center h-full">
      <div className={`text-center mb-4 transition-all animate-fade-in`}>
        <div className="text-lg font-semibold mb-1">Tap the shape – quick reflexes!</div>
        <div className="text-sm mb-4 text-luxury-white/70">
          Taps: {tapsCount}/{maxTaps} &nbsp;|&nbsp; Score: {score}
        </div>
      </div>
      <div
        ref={gameContainerRef}
        className={`flex-1 w-full relative border border-luxury-white/10 rounded-lg bg-luxury-black overflow-hidden transition-all duration-300 ${feedbackColor}`}
        onClick={handleMiss}
      >
        {showTarget && (
          <button
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center focus:outline-none transition-transform hover:scale-105 shadow-lg"
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`,
              width: "68px",
              height: "68px",
              borderRadius: 14,
              padding: 0,
              background: "#222B",
              border: "3px solid #fff8",
              boxShadow: "0 0 16px #ccc6, 0 2px 32px #000a",
            }}
            aria-label={`Tap the ${targetShape}`}
            onClick={handleTargetTap}
            tabIndex={0}
          >
            {SHAPES.find(s => s.type === targetShape)?.render(SHAPE_COLORS[targetShape])}
          </button>
        )}
        {/* Optional: subtle pulse in background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-full h-full animate-pulse-subtle" />
        </div>
      </div>
    </div>
  );
};

export default ReflexTapGame;
