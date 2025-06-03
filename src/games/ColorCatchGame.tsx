import React, { useState, useEffect, useRef } from "react";

const COLORS = [
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Purple", hex: "#a78bfa" },
  { name: "Orange", hex: "#f97316" },
];

interface Circle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface ColorCatchProps {
  onFinish: (score: number, time: number) => void;
}

const ColorCatchGame: React.FC<ColorCatchProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState("");
  const [circles, setCircles] = useState<Circle[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState(30);
  const [tapFeedback, setTapFeedback] = useState<"good" | "bad" | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleIdRef = useRef(0);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const circleTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Randomly choose a target color
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)].name);

    if (gameActive) {
      gameIntervalRef.current = setInterval(() => {
        if (gameActive && containerRef.current) {
          addNewCircle();
        }
      }, 1000);
    }

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
      circleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      circleTimeoutsRef.current.clear();
      window.removeEventListener('resize', checkMobile);
    };
  }, [gameActive]);

  const addNewCircle = () => {
    if (!containerRef.current || !gameActive) return;

    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const size = isMobile ? 80 : 66; // Larger size for mobile
    const margin = size / 2;

    const x = margin + Math.random() * (w - size);
    const y = margin + Math.random() * (h - size);

    const random = COLORS[Math.floor(Math.random() * COLORS.length)];

    const circleId = circleIdRef.current++;
    const newCircle: Circle = {
      id: circleId,
      x,
      y,
      color: random.name,
      size,
    };
    setCircles(prev => [...prev, newCircle]);

    // Remove after 2.3s
    const timeout = setTimeout(() => {
      if (gameActive) {
        setCircles(prev => prev.filter(circle => circle.id !== circleId));
        circleTimeoutsRef.current.delete(circleId);
      }
    }, 2300);

    circleTimeoutsRef.current.set(circleId, timeout);
  };

  const handleCircleInteraction = (
    circleId: number,
    circleColor: string,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!gameActive) return;
    const timeout = circleTimeoutsRef.current.get(circleId);
    if (timeout) {
      clearTimeout(timeout);
      circleTimeoutsRef.current.delete(circleId);
    }
    setCircles(prev => prev.filter(c => c.id !== circleId));

    // Score and feedback
    if (circleColor === targetColor) {
      setScore(prev => prev + 1);
      setTapFeedback("good");
    } else {
      setScore(prev => Math.max(0, prev - 1));
      setTapFeedback("bad");
    }
    setTimeout(() => setTapFeedback(null), 200);
  };

  const endGame = () => {
    setGameActive(false);
    setShowGameOver(true);
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    circleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    circleTimeoutsRef.current.clear();
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 2000);
  };

  // Get color hex for accessibility text and feedback
  const targetColorObj = COLORS.find(c => c.name === targetColor);
  const borderPulse =
    tapFeedback === "good"
      ? "ring-4 ring-luxury-gold/70"
      : tapFeedback === "bad"
      ? "ring-4 ring-red-400"
      : "";

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        <div className="text-lg font-semibold mb-1 animate-fade-in">
          Catch only the
        </div>
        <div
          className="text-3xl font-bold mb-2 rounded-lg inline-block px-6 py-1 shadow-lg"
          style={{
            color: targetColorObj?.hex || "#fff",
            background: "#fff1",
            border: `2px solid ${targetColorObj?.hex || "#fff"}`,
          }}
        >
          {targetColor}
        </div>
        <div className="text-sm text-luxury-white/70 mb-2">
          Time: {timeLeft}s &nbsp;|&nbsp; Score: {score}
        </div>
      </div>
      <div
        ref={containerRef}
        className={`flex-1 relative border border-luxury-white/10 rounded-lg bg-luxury-black overflow-hidden transition-all ${borderPulse}`}
        style={{ minHeight: isMobile ? '70vh' : 300 }}
      >
        {circles.map(circle => {
          const colorObj = COLORS.find(c => c.name === circle.color);
          return (
            <button
              key={circle.id}
              className="absolute rounded-full shadow-lg focus:outline-none border-4 border-white/70 flex items-center justify-center hover:scale-110 transition-all duration-150 touch-manipulation"
              style={{
                left: `${circle.x}px`,
                top: `${circle.y}px`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                backgroundColor: colorObj?.hex || "#fff",
                color: "#111",
                fontWeight: 600,
                fontSize: isMobile ? "1.2rem" : "1.1rem",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 2px 14px rgba(0,0,0,0.12)",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
              tabIndex={0}
              aria-label={circle.color}
              onClick={e => handleCircleInteraction(circle.id, circle.color, e)}
              onTouchStart={e => handleCircleInteraction(circle.id, circle.color, e)}
              disabled={!gameActive}
            >
              <span
                className="rounded text-xs"
                style={{
                  background: "#fff5",
                  padding: "0.2em 0.7em",
                  color: "#1a202c",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: "1px solid #fff6",
                }}
              >
                {circle.color}
              </span>
            </button>
          );
        })}

        {showGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-4xl font-bold text-luxury-gold mb-4 animate-bounce">
              Game Over!
            </div>
            <div className="text-2xl text-white mb-2">
              Final Score: {score}
            </div>
            <div className="text-sm text-luxury-white/70">
              Time: {30 - timeLeft} seconds
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorCatchGame;
