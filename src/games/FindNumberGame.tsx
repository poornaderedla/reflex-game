import React, { useState, useEffect, useCallback } from "react";

interface FindNumberGameProps {
  onFinish: (score: number, time: number) => void;
}

const reactionTimeBenchmarks = {
  worldClass: 150,
  excellent: 200,
  good: 250,
  average: 300,
  slow: 350,
  verySlow: 500
};

const FindNumberGame: React.FC<FindNumberGameProps> = ({ onFinish }) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [rounds, setRounds] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(3); // Start with 3x3 grid
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastRoundTime, setLastRoundTime] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);

  const totalRounds = 10;

  // Initialize game
  useEffect(() => {
    setGameStartTime(Date.now());
    setLastRoundTime(Date.now());
    startNewRound();
  }, []);
  
  // Increase difficulty as game progresses
  useEffect(() => {
    if (rounds >= 3) setGridSize(4); // 4x4 grid after round 3
    if (rounds >= 6) setGridSize(5); // 5x5 grid after round 6
  }, [rounds]);
  
  const startNewRound = useCallback(() => {
    // Create array of unique numbers
    const count = gridSize * gridSize;
    const maxNum = rounds < 5 ? 20 : 50; // Higher numbers after round 5
    const newNumbers: number[] = [];
    
    while (newNumbers.length < count) {
      const num = Math.floor(Math.random() * maxNum) + 1;
      if (!newNumbers.includes(num)) {
        newNumbers.push(num);
      }
    }
    
    // Randomly select one as the target
    const targetIndex = Math.floor(Math.random() * count);
    
    setNumbers(newNumbers);
    setTargetNumber(newNumbers[targetIndex]);
    setLastRoundTime(Date.now());
  }, [gridSize, rounds]);
  
  const handleNumberClick = (clickedNumber: number) => {
    const now = Date.now();
    if (clickedNumber === targetNumber) {
      // Correct - calculate score based on grid size and round
      const basePoints = 100;
      const gridBonus = (gridSize - 2) * 20; // Bigger grid = more points
      const roundBonus = rounds * 5; // Later rounds = more points
      
      const newPoints = basePoints + gridBonus + roundBonus;
      setScore(prevScore => prevScore + newPoints);
      // Record reaction time
      setReactionTimes(prev => [...prev, now - lastRoundTime]);
      // Next round
      setRounds(prevRounds => prevRounds + 1);
      
      if (rounds + 1 >= totalRounds) {
        // Game completed
        setGameEndTime(now);
        setShowResults(true);
      } else {
        startNewRound();
      }
    } else {
      // Wrong number - penalty
      setScore(prevScore => Math.max(0, prevScore - 50));
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
    const totalTime = gameEndTime - gameStartTime;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-luxury-black rounded-2xl shadow-2xl border-2 border-luxury-gold p-6 flex flex-col items-center animate-fade-in">
          {/* Best Results & Tips Section */}
          <div className="w-full mb-4 p-3 rounded-lg bg-luxury-gold/10 border border-luxury-gold/40 text-center">
            <div className="text-base font-semibold text-luxury-gold mb-1">How to Get the Best Results</div>
            <div className="text-sm text-luxury-white/80 mb-1">
              Tap the correct number as quickly as possible. The faster you react, the higher your score!
            </div>
            <div className="text-sm text-luxury-gold">
              <span className="font-bold">World Class:</span> {reactionTimeBenchmarks.worldClass}ms average reaction
            </div>
          </div>
          {/* End Best Results & Tips Section */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-luxury-gold mb-2">Game Over!</div>
            <div className="text-lg text-white mb-1">Find Number Results</div>
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
              onClick={() => navigator.share && navigator.share({ title: 'Find Number Results', text: `Score: ${score}, Avg: ${stats?.average ?? 0}ms`, url: window.location.href })}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] w-full flex-col items-center justify-start">
      <div className="mb-8 mt-4 text-center">
        <div className="text-xl font-medium">Find the number</div>
        <div className="mt-2 text-4xl font-bold text-luxury-gold">{targetNumber}</div>
        <div className="mt-2 text-sm text-luxury-white/70">
          Round: {rounds + 1}/{totalRounds} | Score: {score}
        </div>
      </div>
      
      <div 
        className="grid gap-2 p-4 w-full max-w-sm"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {numbers.map((number, index) => (
          <button
            key={index}
            className="flex h-14 w-full items-center justify-center rounded-md border border-luxury-white/10 bg-luxury-black text-lg font-medium transition-all hover:border-luxury-gold/30 active:bg-luxury-gold/20 touch-target"
            onClick={() => handleNumberClick(number)}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FindNumberGame;
