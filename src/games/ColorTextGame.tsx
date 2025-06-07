import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ColorTextProps {
  onFinish: (score: number, time: number) => void;
}

// Color options with name and hex values
const COLORS = [
  { name: "Red", hex: "#ff0000" },
  { name: "Blue", hex: "#0000ff" },
  { name: "Green", hex: "#00ff00" },
  { name: "Yellow", hex: "#ffff00" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#ffa500" },
];

const reactionTimeBenchmarks = {
  worldClass: 150,
  excellent: 200,
  good: 250,
  average: 300,
  slow: 350,
  verySlow: 500,
};

const ColorTextGame: React.FC<ColorTextProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [textColor, setTextColor] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [round, setRound] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastRoundTime, setLastRoundTime] = useState<number>(Date.now());
  const [penaltyScore, setPenaltyScore] = useState(0);
  const [penaltyClicks, setPenaltyClicks] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const maxRounds = 10;

  // --- FIX: Move hooks to top level ---
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showDetails && contentRef.current) {
      contentRef.current.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [showDetails]);
  // --- END FIX ---

  // Initialize the game
  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    // Select a random color for the text itself
    const textColorIndex = Math.floor(Math.random() * COLORS.length);
    const colorForText = COLORS[textColorIndex];

    // Select a random color name to display (which may be different)
    const displayTextIndex = Math.floor(Math.random() * COLORS.length);
    const colorToDisplay = COLORS[displayTextIndex];
    
    setTextColor(colorForText.hex);
    setDisplayText(colorToDisplay.name);

    // Generate 4 options (including the correct answer)
    const allColorNames = [...COLORS].map(c => c.name);
    const shuffled = allColorNames.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    
    // Make sure correct option is included
    if (!selected.includes(colorForText.name)) {
      selected[Math.floor(Math.random() * 4)] = colorForText.name;
    }
    
    setOptions(selected);
    setLastRoundTime(Date.now());
  };

  const handleOptionClick = (colorName: string) => {
    if (!gameActive) return;
    const now = Date.now();
    // Check if the chosen option is the color of the text (not what the text says)
    const correctColor = COLORS.find(c => c.hex === textColor)?.name;
    if (colorName === correctColor) {
      setScore(prev => prev + 100);
      setReactionTimes(prev => [...prev, now - lastRoundTime]);
    } else {
      setPenaltyScore(prev => prev + 50);
      setPenaltyClicks(prev => prev + 1);
    }
    // Move to next round or finish
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
      benchmarks: reactionTimeBenchmarks,
    };
  };

  if (showResults && gameEndTime) {
    const stats = calculateStats();
    const totalTime = gameEndTime - startTime;
    const netScore = score - penaltyScore;
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm w-screen h-screen overflow-y-auto flex items-center justify-center">
        <div className="relative flex flex-col w-full max-w-md min-h-[60vh] bg-luxury-black rounded-none sm:rounded-2xl shadow-2xl border-2 border-luxury-gold animate-fade-in mx-auto">
          {/* Scrollable content */}
          <div
            ref={contentRef}
            className="px-6 pt-8 pb-28 flex flex-col items-center w-full"
          >
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
              <div className="text-lg text-white mb-1">Color Text Results</div>
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
          </div>
        </div>
        {/* Fixed footer for actions (always visible) */}
        <div className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-md flex gap-4 p-4 border-t border-luxury-gold/30 bg-luxury-black z-50">
          <button
            className="flex-1 px-4 py-2 bg-luxury-gold text-luxury-black font-semibold rounded hover:bg-yellow-400 transition"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
          <button
            className="flex-1 px-4 py-2 bg-luxury-white text-luxury-black font-semibold rounded hover:bg-luxury-gold transition"
            onClick={() => navigator.share && navigator.share({ title: 'Color Text Results', text: `Score: ${score}, Net: ${netScore}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
          >
            Share
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-8 text-center">
        <div className="text-lg mb-2">What color is this text?</div>
        <div 
          className="text-4xl font-bold mb-6" 
          style={{ color: textColor }}
        >
          {displayText}
        </div>
        <div className="text-sm mb-4 text-luxury-white/70">
          Round {round + 1}/{maxRounds} | Score: {score} {penaltyClicks > 0 && <span className="text-red-400 ml-2">Penalty: -{penaltyScore}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {options.map((colorName, index) => (
          <Button
            key={index}
            onClick={() => handleOptionClick(colorName)}
            className="py-8 text-lg font-medium"
            variant="outline"
            disabled={!gameActive}
          >
            {colorName}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ColorTextGame;
