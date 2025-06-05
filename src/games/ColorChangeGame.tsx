import React, { useState, useEffect, useCallback } from "react";

interface ColorChangeGameProps {
  onFinish: (score: number, time: number, penaltyScore: number, penaltyClicks: number, reactionTimes: number[]) => void;
}

const ColorChangeGame: React.FC<ColorChangeGameProps> = ({ onFinish }) => {
  const [backgroundColor, setBackgroundColor] = useState<string>("bg-luxury-black");
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [rounds, setRounds] = useState<number>(0);
  const [lastChangeTime, setLastChangeTime] = useState<number>(0);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"start" | "countdown" | "playing" | "betweenRounds" | "finished">("countdown");
  const [countdownNumber, setCountdownNumber] = useState<number>(3);
  const [penaltyScore, setPenaltyScore] = useState<number>(0);
  const [penaltyClicks, setPenaltyClicks] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const totalRounds = 10;
  const minDelay = 1000;
  const maxDelay = 4000;
  const whiteScreenDuration = 1000;
  
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const reactionTimeBenchmarks = {
    worldClass: 150,
    excellent: 200,
    good: 250,
    average: 300,
    slow: 350,
    verySlow: 500
  };

  const calculateStats = useCallback(() => {
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
  }, [reactionTimes]);

  const calculateWorldStandardScore = useCallback((reactionTime: number) => {
    const worldClass = reactionTimeBenchmarks.worldClass;
    const maxPossible = 1000;
    let normalized = Math.max(0, maxPossible - reactionTime);
    
    if (reactionTime <= worldClass) {
      normalized += (worldClass - reactionTime) * 2;
    }
    
    return Math.max(0, Math.min(1000, normalized));
  }, []);

  const handleStart = () => {
    setGameState("countdown");
    setCountdownNumber(3);
  };

  useEffect(() => {
    if (gameState !== "countdown") return;
    setGameState("playing");
    setCountdownActive(true);
  }, [gameState, countdownNumber]);

  useEffect(() => {
    if (gameState === "playing" && rounds === 0) {
      setGameStartTime(Date.now());
      setScore(0);
      setRounds(0);
      setPenaltyScore(0);
      setPenaltyClicks(0);
      setReactionTimes([]);
      setCountdownActive(true);
      setShowResults(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (!countdownActive || gameState !== "playing") return;
    const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    const timer = setTimeout(() => {
      const newColor = colors[Math.floor(Math.random() * colors.length)];
      setBackgroundColor(newColor);
      setIsChanging(true);
      setLastChangeTime(Date.now());
      setCountdownActive(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [countdownActive, colors, gameState]);

  const handleTap = useCallback(() => {
    if (gameState === "betweenRounds") {
      const penalty = 20;
      setScore((prevScore) => Math.max(0, prevScore - penalty));
      setPenaltyScore((prev) => prev + penalty);
      setPenaltyClicks((prev) => prev + 1);
      return;
    }
    
    if (gameState !== "playing") return;
    
    if (!isChanging || !lastChangeTime) {
      const penalty = 10;
      setScore((prevScore) => Math.max(0, prevScore - penalty));
      setPenaltyScore((prev) => prev + penalty);
      setPenaltyClicks((prev) => prev + 1);
      return;
    }
    
    const reactionTime = Date.now() - lastChangeTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    const newPoints = calculateWorldStandardScore(reactionTime);
    setScore((prevScore) => prevScore + newPoints);
    setIsChanging(false);
    setRounds((prevRounds) => prevRounds + 1);
    
    if (rounds + 1 >= totalRounds) {
      const totalTime = Date.now() - gameStartTime;
      setGameState("finished");
      const stats = calculateStats();
      setResultsData({
        score: score + newPoints,
        totalTime,
        penaltyScore,
        penaltyClicks,
        reactionTimes,
        stats
      });
      setShowResults(true);
    } else {
      setBackgroundColor("bg-white");
      setGameState("betweenRounds");
      
      setTimeout(() => {
        const newColor = colors[Math.floor(Math.random() * colors.length)];
        setBackgroundColor(newColor);
        setIsChanging(true);
        setLastChangeTime(Date.now());
        setGameState("playing");
        setCountdownActive(false);
      }, whiteScreenDuration);
    }
  }, [isChanging, lastChangeTime, score, rounds, gameStartTime, gameState, penaltyScore, penaltyClicks, calculateWorldStandardScore, calculateStats]);

  if (gameState === "betweenRounds") {
    return (
      <div 
        className="flex h-[calc(100vh-10rem)] w-full flex-col items-center justify-center bg-white transition-colors duration-200"
        onClick={handleTap}
      >
        <div className="mt-8 text-center text-black text-lg">
          Wait for the color change...
          {penaltyClicks > 0 && (
            <div className="text-red-500 mt-2">
              Penalty: -{penaltyScore} points ({penaltyClicks} early clicks)
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showResults && resultsData) {
    const { score, penaltyScore, penaltyClicks, totalTime, reactionTimes, stats } = resultsData;
    const netScore = score - penaltyScore;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Reaction Time Test Results</div>
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
              <span className="text-red-400">-{penaltyScore} ({penaltyClicks} early clicks)</span>
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
              onClick={() => navigator.share && navigator.share({ title: 'Reaction Time Results', text: `Score: ${score}, Net: ${netScore}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isWhiteBg = backgroundColor === "bg-white";
  const borderColor = isWhiteBg ? "border-black" : "border-white";
  const borderWidth = isWhiteBg ? "border-4" : "border-8";

  return (
    <div
      className={`flex h-[calc(100vh-10rem)] w-full flex-col items-center justify-center transition-colors duration-200 ${borderWidth} ${borderColor} ${backgroundColor}`}
      onClick={handleTap}
      style={{ boxSizing: "border-box" }}
    >
      <div className="pointer-events-none select-none">
        <div className="mt-2 text-sm font-medium text-white/70">
          Round: {rounds}/{totalRounds} | Score: {score}
        </div>
        {reactionTimes.length > 0 && (
          <div className="text-sm font-medium text-white/70">
            Avg. Reaction: {calculateStats()?.average || 0}ms
          </div>
        )}
        {penaltyClicks > 0 && (
          <div className="text-sm font-medium text-white/70">
            Penalties: -{penaltyScore} ({penaltyClicks} clicks)
          </div>
        )}
        
        <div className="mt-8 text-center text-white">
          {!isChanging ? (
            <div className="text-lg">Wait for the color to change...</div>
          ) : (
            <div className="text-2xl font-bold">TAP NOW!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorChangeGame;