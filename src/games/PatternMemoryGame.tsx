import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

interface PatternMemoryProps {
  onFinish: (score: number, time: number) => void;
}

// Define colors for the pattern with more appealing colors
const PATTERN_COLORS = [
  { name: "Red", hex: "#ef4444", hover: "#dc2626" },
  { name: "Blue", hex: "#3b82f6", hover: "#2563eb" },
  { name: "Green", hex: "#22c55e", hover: "#16a34a" },
  { name: "Yellow", hex: "#eab308", hover: "#ca8a04" },
];

// Daily challenge pattern (a special sequence that's the same for everyone)
const DAILY_PATTERN = [0, 2, 1, 3, 0, 1, 2, 3];

const reactionTimeBenchmarks = {
  worldClass: 220,
  excellent: 260,
  good: 300,
  average: 350,
  slow: 400,
  verySlow: 500
};

const PatternMemoryGame: React.FC<PatternMemoryProps> = ({ onFinish }) => {
  const location = useLocation();
  const isDailyChallenge = new URLSearchParams(location.search).get('mode') === 'daily';
  
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [startTime] = useState<number>(Date.now());
  const [feedback, setFeedback] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [tapDetails, setTapDetails] = useState<{time: number, correct: boolean}[]>([]);
  const [penalties, setPenalties] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Start the game
  useEffect(() => {
    startLevel();
  }, []);

  // Generate pattern for current level
  const startLevel = () => {
    let newPattern: number[];
    
    if (isDailyChallenge) {
      // For daily challenge, use a fixed pattern
      newPattern = DAILY_PATTERN;
    } else {
      // For regular game, generate random pattern
      newPattern = [...pattern];
      newPattern.push(Math.floor(Math.random() * PATTERN_COLORS.length));
    }
    
    setPattern(newPattern);
    setUserPattern([]);
    setFeedback("Watch carefully...");
    
    // Show the pattern to the user
    showPattern(newPattern);
  };

  // Display pattern to user
  const showPattern = (patternToShow: number[]) => {
    setIsShowingPattern(true);
    
    // Sequentially highlight each button in the pattern
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < patternToShow.length) {
        setActiveButton(patternToShow[i]);
        
        // Turn off the highlight after a short delay
        setTimeout(() => {
          setActiveButton(null);
        }, 600);
        
        i++;
      } else {
        clearInterval(intervalId);
        setIsShowingPattern(false);
        setFeedback("Your turn! Repeat the pattern");
      }
    }, 1000);
  };

  // Handle user interaction (click or touch)
  const handleInteraction = (colorIndex: number) => {
    if (isShowingPattern || !gameActive) return;
    
    // Briefly highlight the pressed button
    setActiveButton(colorIndex);
    setTimeout(() => setActiveButton(null), 300);
    
    // Add to user's pattern attempt
    const newUserPattern = [...userPattern, colorIndex];
    setUserPattern(newUserPattern);
    
    // Check if this input matches the pattern so far
    const currentIndex = newUserPattern.length - 1;
    const now = Date.now();
    if (pattern[currentIndex] !== colorIndex) {
      // Wrong input - game over
      setFeedback("Wrong pattern! Game over.");
      setPenalties(p => p + 1);
      setTapDetails(prev => [...prev, { time: 0, correct: false }]);
      endGame();
      return;
    }
    
    // Reaction time for each correct tap
    if (currentIndex === 0) {
      setReactionTimes(prev => [...prev, now - startTime]);
      setTapDetails(prev => [...prev, { time: now - startTime, correct: true }]);
    } else {
      setReactionTimes(prev => [...prev, now - (startTime + reactionTimes.reduce((a, b) => a + b, 0))]);
      setTapDetails(prev => [...prev, { time: now - (startTime + reactionTimes.reduce((a, b) => a + b, 0)), correct: true }]);
    }
    
    // Check if the user completed the pattern
    if (newUserPattern.length === pattern.length) {
      if (isDailyChallenge) {
        // For daily challenge, end game after completing the pattern
        setScore(8); // Fixed score for daily challenge
        setFeedback("Congratulations! Daily challenge completed!");
        endGame();
      } else {
        // For regular game, continue to next level
        setScore(prev => prev + level);
        setLevel(prev => prev + 1);
        setFeedback("Correct! Next level...");
        
        // Short delay before next level
        setTimeout(() => {
          startLevel();
        }, 1500);
      }
    }
  };

  const endGame = () => {
    setGameActive(false);
    setTimeout(() => {
      setShowResults(true);
    }, 1000);
  };

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
    const totalTime = reactionTimes.reduce((a, b) => a + b, 0) + penalties * 300;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Repeat the pattern as quickly and accurately as possible. The faster you react, the higher your score! Wrong taps will end the game.
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Pattern Memory Results</div>
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
              onClick={() => navigator.share && navigator.share({ title: 'Pattern Memory Results', text: `Score: ${score}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="mb-8 text-center">
        <div className="text-2xl font-bold mb-2 text-luxury-gold">
          {isDailyChallenge ? "Daily Challenge" : `Level ${level}`}
        </div>
        <div className="text-lg mb-2">
          {feedback}
        </div>
        <div className="text-sm text-luxury-white/70">
          Score: {score}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
        {PATTERN_COLORS.map((color, index) => (
          <button
            key={index}
            className="relative aspect-square rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 touch-manipulation"
            style={{
              backgroundColor: activeButton === index ? color.hex : "rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              boxShadow: activeButton === index 
                ? `0 0 20px ${color.hex}40` 
                : "0 4px 6px rgba(0, 0, 0, 0.1)",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              minHeight: isMobile ? "120px" : "auto"
            }}
            onClick={() => handleInteraction(index)}
            onTouchStart={() => handleInteraction(index)}
            disabled={isShowingPattern || !gameActive}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-20"
              style={{ color: color.hex }}
            >
              <span className="text-5xl">■</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatternMemoryGame;
