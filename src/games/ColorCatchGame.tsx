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

const reactionTimeBenchmarks = {
  worldClass: 200,
  excellent: 250,
  good: 300,
  average: 350,
  slow: 400,
  verySlow: 500
};

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
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastTapTime, setLastTapTime] = useState<number>(Date.now());
  const [penalties, setPenalties] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [tapDetails, setTapDetails] = useState<{time: number, correct: boolean}[]>([]);
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

    setLastTapTime(Date.now());

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

    const now = Date.now();
    if (circleColor === targetColor) {
      setScore(prev => prev + 100);
      setTapFeedback("good");
      setReactionTimes(prev => [...prev, now - lastTapTime]);
      setTapDetails(prev => [...prev, { time: now - lastTapTime, correct: true }]);
      setLastTapTime(now);
    } else {
      setScore(prev => Math.max(0, prev - 50));
      setPenalties(p => p + 1);
      setTapFeedback("bad");
      setTapDetails(prev => [...prev, { time: 0, correct: false }]);
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
    setTimeout(() => {
      setShowResults(true);
    }, 800);
  };

  // Get color hex for accessibility text and feedback
  const targetColorObj = COLORS.find(c => c.name === targetColor);
  const borderPulse =
    tapFeedback === "good"
      ? "ring-4 ring-luxury-gold/70"
      : tapFeedback === "bad"
      ? "ring-4 ring-red-400"
      : "";

  // Results calculation
  const calculateStats = () => {
    const validTimes = reactionTimes.filter(t => t > 0);
    if (validTimes.length === 0) return null;
    const sum = validTimes.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / validTimes.length);
    const best = Math.min(...validTimes);
    const worst = Math.max(...validTimes);
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

  if (showResults) {
    const stats = calculateStats();
    const totalTime = 30 * 1000;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Tap only the correct color as quickly as possible. The faster you react, the higher your score! Wrong taps will reduce your score.
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Color Catch Results</div>
          </div>
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-lg">
              <span className="text-luxury-white/80">Final Score:</span>
              <span className="font-bold text-luxury-gold">{score}</span>
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
              <span>{(totalTime / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-luxury-white/60">Penalties:</span>
              <span className="text-red-400 font-semibold">{penalties}</span>
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
              <div className="text-sm text-luxury-gold mb-1 font-semibold">Taps (ms):</div>
              <div className="flex flex-wrap gap-2 text-xs text-luxury-white/80">
                {tapDetails.map((d, i) => (
                  <span key={i} className={`px-2 py-1 rounded ${d.correct ? 'bg-luxury-gold/10' : 'bg-red-400/20 text-red-300'}`}>{d.correct ? d.time : 'Penalty'}</span>
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
            <button
              className="flex-1 px-4 py-2 bg-luxury-white text-luxury-black font-semibold rounded hover:bg-luxury-gold transition"
              onClick={() => navigator.share && navigator.share({ title: 'Color Catch Results', text: `Score: ${score}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      </div>
    </div>
  );
};

export default ColorCatchGame;
