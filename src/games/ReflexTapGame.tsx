import React, { useRef, useEffect, useState } from "react";

const SHAPES = [
  {
    type: "circle",
    render: (color: string, animate: boolean) => (
      <svg
        width={72}
        height={72}
        className={`drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-transform duration-100 ${animate ? "animate-tap-pop" : ""}`}
      >
        <circle cx={36} cy={36} r={28} fill={color} stroke="#fff" strokeWidth={5} />
      </svg>
    ),
  },
  {
    type: "square",
    render: (color: string, animate: boolean) => (
      <svg
        width={72}
        height={72}
        className={`drop-shadow-[0_8px_24px_rgba(0,0,0,0.21)] transition-transform duration-100 ${animate ? "animate-tap-pop" : ""}`}
      >
        <rect x={12} y={12} width={48} height={48} rx={12} fill={color} stroke="#fff" strokeWidth={5} />
      </svg>
    ),
  },
  {
    type: "triangle",
    render: (color: string, animate: boolean) => (
      <svg
        width={72}
        height={72}
        className={`drop-shadow-[0_8px_24px_rgba(0,0,0,0.17)] transition-transform duration-100 ${animate ? "animate-tap-pop" : ""}`}
      >
        <polygon points="36,12 62,60 10,60" fill={color} stroke="#fff" strokeWidth={5} />
      </svg>
    ),
  },
];

// Use accessible, distinct colors.
const SHAPE_COLORS = {
  circle: "#facc15", // Yellow
  square: "#38bdf8", // Bright sky-blue
  triangle: "#f97316", // Bright orange
};

interface ReflexTapProps {
  onFinish: (score: number, time: number) => void;
}

const ANIMATE_POP_CSS = `
@keyframes tap-pop {
  0% { transform: scale(1);}
  50% {transform: scale(1.2);}
  100% {transform: scale(1);}
}
.animate-tap-pop {
  animation: tap-pop 0.24s cubic-bezier(.8,-0.05,.86,.53);
}
@keyframes shake {
  10%, 90% { transform: translateX(-3px);}
  20%, 80% { transform: translateX(6px);}
  30%, 50%, 70% { transform: translateX(-10px);}
  40%, 60% { transform: translateX(10px);}
}
.animate-shake {
  animation: shake 0.35s cubic-bezier(.5,-0.5,.75,1.5);
}
/* Subtle background pulse to indicate game is running */
@keyframes pulse-bg {
  0%,100% {opacity: 1;}
  50% {opacity: 0.93;}
}
.bg-pulse-anim {
  animation: pulse-bg 2.4s ease-in-out infinite;
}
`;

const reactionTimeBenchmarks = {
  worldClass: 170,
  excellent: 210,
  good: 250,
  average: 300,
  slow: 350,
  verySlow: 500
};

const MAX_TAPS = 15;

const ReflexTapGame: React.FC<ReflexTapProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 120, y: 120 });
  const [targetShape, setTargetShape] = useState<"circle" | "square" | "triangle">("circle");
  const [tapsCount, setTapsCount] = useState(0);
  const [recentHit, setRecentHit] = useState<"success"|"miss"|null>(null);
  const [targetAnimate, setTargetAnimate] = useState(false);
  const [startTime] = useState(Date.now());
  const [lastAppearTime, setLastAppearTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [tapDetails, setTapDetails] = useState<{time: number, correct: boolean}[]>([]);
  const [penalties, setPenalties] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inject animation keyframes (for drop-in use)
  useEffect(() => {
    if (!document.getElementById("reflex-tap-animations")) {
      const style = document.createElement("style");
      style.id = "reflex-tap-animations";
      style.innerHTML = ANIMATE_POP_CSS;
      document.head.appendChild(style);
    }
  }, []);

  // Start or reset game
  useEffect(() => {
    if (gameActive) {
      queueNewTarget();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line
  }, [gameActive]);

  // Launch a new target after a delay
  const queueNewTarget = () => {
    setShowTarget(false);
    setTargetAnimate(false);
    if (!gameActive || !containerRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const delay = Math.floor(Math.random() * 700) + 700; // 0.7s–1.4s
    timeoutRef.current = setTimeout(() => {
      launchNewTarget();
    }, delay);
  };

  // Shows target at random position & shape
  const launchNewTarget = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const pad = 56; // Allow for shape size and touch
    const x = Math.floor(Math.random() * (w - pad * 2)) + pad;
    const y = Math.floor(Math.random() * (h - pad * 2)) + pad;
    const nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)].type as "circle"|"square"|"triangle";
    setTargetPosition({ x, y });
    setTargetShape(nextShape);
    setShowTarget(true);
    setLastAppearTime(Date.now());
    setTargetAnimate(false);
  };

  // When player taps target
  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gameActive || !showTarget) return;
    setRecentHit("success");
    setTargetAnimate(true);

    // More points for speed, with a minimum of 1 per hit (slower = fewer points)
    const ms = Math.max(80, Date.now() - lastAppearTime);
    const pts = Math.round(800 / ms) + 2;

    setScore((prev) => prev + pts);
    setReactionTimes(prev => [...prev, ms]);
    setTapDetails(prev => [...prev, { time: ms, correct: true }]);

    setTapsCount((prev) => {
      if (prev + 1 >= MAX_TAPS) {
        endGame(prev + 1);
        return prev + 1;
      }
      return prev + 1;
    });

    setTimeout(() => {
      setRecentHit(null);
      setShowTarget(false);
      queueNewTarget();
    }, 130);
  };

  // Missed tap
  const handleMiss = () => {
    if (!gameActive || !showTarget) return;
    setRecentHit("miss");
    setScore((prev) => Math.max(0, prev - 50));
    setPenalties(p => p + 1);
    setTapDetails(prev => [...prev, { time: 0, correct: false }]);
    setTapsCount((prev) => {
      if (prev + 1 >= MAX_TAPS) {
        endGame(prev + 1);
        return prev + 1;
      }
      return prev + 1;
    });
    setShowTarget(false);
    setTimeout(() => {
      setRecentHit(null);
      queueNewTarget();
    }, 250);
  };

  const endGame = (tapValue: number) => {
    setGameActive(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => {
      setShowResults(true);
    }, 420);
  };

  // Feedback classes for hit/miss
  const feedbackClass = 
    recentHit === "success"
      ? "shadow-[0_0_28px_8px_#fde68a82] bg-yellow-400/10"
      : recentHit === "miss"
      ? "animate-shake bg-red-500/25"
      : "bg-pulse-anim";

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
    const totalTime = (reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) : 0) + penalties * 300; // estimate
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Tap the shape as quickly as possible. The faster you react, the higher your score! Misses will reduce your score.
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Reflex Tap Results</div>
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
              onClick={() => navigator.share && navigator.share({ title: 'Reflex Tap Results', text: `Score: ${score}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="mb-3 mt-2 text-center w-full">
        <div className="text-lg font-bold tracking-wide">Reflex Tap</div>
        <div className="text-xs mb-1 text-luxury-white/60">Score: <span className="font-bold">{score}</span> &nbsp;|&nbsp; Taps: {tapsCount}/{MAX_TAPS}</div>
        <div className="text-xs text-luxury-gold/70 mb-2">
          {recentHit === "success" && <span className="transition">Great Reflex!</span>}
          {recentHit === "miss" && <span className="transition text-red-400">Missed!</span>}
        </div>
      </div>
      <div
        ref={containerRef}
        className={`flex-1 w-full relative rounded-xl border border-zinc-800 bg-luxury-black/90 overflow-hidden transition-all duration-200 select-none cursor-pointer ${feedbackClass}`}
        onClick={handleMiss}
        style={{ minHeight: 340 }}
      >
        {showTarget && (
          <button
            className={`z-10 absolute top-0 left-0 flex items-center justify-center bg-white/0 border-none focus:outline-none`}
            style={{
              position: "absolute",
              left: targetPosition.x,
              top: targetPosition.y,
              width: 76,
              height: 76,
              transform: "translate(-50%,-50%)",
            }}
            aria-label={`Tap the ${targetShape}`}
            onClick={handleTap}
            tabIndex={0}
          >
            {SHAPES.find(s=>s.type===targetShape)?.render(SHAPE_COLORS[targetShape], targetAnimate)}
          </button>
        )}
        {/* subtle background pulse */}
        <div className="absolute inset-0 pointer-events-none z-0" />
      </div>
      {/* Show animation CSS keyframes */}
      <style>{ANIMATE_POP_CSS}</style>
    </div>
  );
};

export default ReflexTapGame;
