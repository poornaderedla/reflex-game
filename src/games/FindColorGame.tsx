import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle } from "lucide-react";

interface FindColorProps {
  onFinish: (score: number, time: number) => void;
}

// A list of colors to choose from
const COLORS = [
  { name: "Red", hex: "#ff0000" },
  { name: "Blue", hex: "#0000ff" },
  { name: "Green", hex: "#00ff00" },
  { name: "Yellow", hex: "#ffff00" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#ffa500" },
  { name: "Cyan", hex: "#00ffff" },
  { name: "Magenta", hex: "#ff00ff" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Lime", hex: "#bfff00" },
  { name: "Teal", hex: "#008080" },
  { name: "Navy", hex: "#000080" },
  { name: "Olive", hex: "#808000" },
  { name: "Maroon", hex: "#800000" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Gray", hex: "#808080" },
  // { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
];

const reactionTimeBenchmarks = {
  worldClass: 150,
  excellent: 200,
  good: 250,
  average: 300,
  slow: 350,
  verySlow: 500
};

const FindColorGame: React.FC<FindColorProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [round, setRound] = useState(0);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastRoundTime, setLastRoundTime] = useState<number>(Date.now());
  const [penaltyScore, setPenaltyScore] = useState<number>(0);
  const [penaltyClicks, setPenaltyClicks] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);
  const maxRounds = 10;

  // Initialize the game
  useEffect(() => {
    generateNewRound();
    setLastRoundTime(Date.now());
  }, []);

  const generateNewRound = () => {
    // Select a random target color
    const targetIndex = Math.floor(Math.random() * COLORS.length);
    const target = COLORS[targetIndex].name;
    setTargetColor(target);

    // Generate 4 options (including the target)
    const allOptions = [...COLORS].map(c => c.name);
    const shuffled = allOptions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    
    // Make sure target is included
    if (!selected.includes(target)) {
      selected[Math.floor(Math.random() * 4)] = target;
    }
    
    setOptions(selected);
    setLastRoundTime(Date.now());
  };

  const handleColorClick = (color: string) => {
    if (!gameActive) return;
    const now = Date.now();
    if (color === targetColor) {
      setScore(prev => prev + 1);
      setReactionTimes(prev => [...prev, now - lastRoundTime]);
    setRound(prev => {
      const nextRound = prev + 1;
      if (nextRound >= maxRounds) {
          setGameEndTime(now);
          setShowResults(true);
          setGameActive(false);
        return prev;
      } else {
        generateNewRound();
        return nextRound;
      }
    });
    } else {
      // Wrong color - penalty
      setPenaltyClicks(prev => prev + 1);
      setPenaltyScore(prev => prev + 50);
    }
  };

  // Calculate stats
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

  if (showResults && gameEndTime) {
    const stats = calculateStats();
    const totalTime = gameEndTime - startTime;
    const netScore = score - penaltyScore;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Tap the correct color as quickly as possible. The faster you react, the higher your score!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Find Color Results</div>
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
              <span>{(totalTime / 1000).toFixed(2)}s</span>
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
            <button
              className="flex-1 px-4 py-2 bg-luxury-white text-luxury-black font-semibold rounded hover:bg-luxury-gold transition"
              onClick={() => navigator.share && navigator.share({ title: 'Find Color Results', text: `Score: ${score}, Net: ${netScore}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the color name to match
  const getColorStyle = (colorName: string) => {
    const color = COLORS.find(c => c.name === colorName);
    return { color: color?.hex || "#fff" };
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-8 text-center">
        <div className="text-xl mb-4">Find this color:</div>
        <div 
          className="text-5xl font-bold mb-8" 
          style={getColorStyle(targetColor)}
        >
          ■■■■■
        </div>
        <div className="text-sm mb-6 text-luxury-white/70">
          Round {round + 1}/{maxRounds}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {options.map((color, index) => (
          <Button
            key={index}
            onClick={() => handleColorClick(color)}
            className="py-12 text-xl font-medium transition-all hover:scale-105 active:scale-95"
            variant="outline"
            disabled={!gameActive}
            style={{
              borderWidth: '2px',
              borderColor: getColorStyle(color).color,
              color: getColorStyle(color).color,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {color}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FindColorGame;
