import React, { useState, useEffect, useCallback } from "react";

interface ColorChangeGameProps {
  onFinish: (score: number, time: number) => void;
}

const ColorChangeGame: React.FC<ColorChangeGameProps> = ({ onFinish }) => {
  const [backgroundColor, setBackgroundColor] = useState<string>("bg-luxury-black");
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [rounds, setRounds] = useState<number>(0);
  const [lastChangeTime, setLastChangeTime] = useState<number>(0);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);

  const totalRounds = 10;
  const minDelay = 1000; // Min delay before color change in ms
  const maxDelay = 4000; // Max delay before color change in ms
  
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const handleTap = useCallback(() => {
    if (!isChanging || !lastChangeTime) {
      // Early tap or no change yet - penalty
      setScore(Math.max(0, score - 10));
      return;
    }
    
    const reactionTime = Date.now() - lastChangeTime;
    
    // Calculate score based on reaction time
    // Faster reactions = higher score
    const newPoints = Math.max(0, Math.floor(1000 - reactionTime / 2));
    setScore(prevScore => prevScore + newPoints);
    
    // Reset for next round
    setIsChanging(false);
    setRounds(prevRounds => prevRounds + 1);
    
    if (rounds + 1 >= totalRounds) {
      // Game completed
      const totalTime = Date.now() - gameStartTime;
      onFinish(score + newPoints, totalTime);
    } else {
      // Schedule next color change
      setCountdownActive(true);
    }
  }, [isChanging, lastChangeTime, score, rounds, gameStartTime, onFinish]);

  // Initialize game
  useEffect(() => {
    setGameStartTime(Date.now());
    setCountdownActive(true);
  }, []);

  // Handle color change scheduling
  useEffect(() => {
    if (!countdownActive) return;
    
    const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    const timer = setTimeout(() => {
      // Change the background color
      const newColor = colors[Math.floor(Math.random() * colors.length)];
      setBackgroundColor(newColor);
      setIsChanging(true);
      setLastChangeTime(Date.now());
      setCountdownActive(false);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [countdownActive, colors]);
  
  return (
    <div 
      className={`flex h-[calc(100vh-10rem)] w-full flex-col items-center justify-center transition-colors duration-200 ${backgroundColor}`}
      onClick={handleTap}
    >
      <div className="pointer-events-none select-none">
        <div className="mt-2 text-sm font-medium text-white/70">
          {rounds}/{totalRounds}
        </div>
        
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
