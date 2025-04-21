
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
    setScore((prev) => Math.max(0, prev - 7));
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
    const timeTaken = Date.now() - startTime;
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 420);
  };

  // Feedback classes for hit/miss
  const feedbackClass = 
    recentHit === "success"
      ? "shadow-[0_0_28px_8px_#fde68a82] bg-yellow-400/10"
      : recentHit === "miss"
      ? "animate-shake bg-red-500/25"
      : "bg-pulse-anim";

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
