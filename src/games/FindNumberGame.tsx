
import React, { useState, useEffect, useCallback } from "react";

interface FindNumberGameProps {
  onFinish: (score: number, time: number) => void;
}

const FindNumberGame: React.FC<FindNumberGameProps> = ({ onFinish }) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [rounds, setRounds] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(3); // Start with 3x3 grid
  
  const totalRounds = 10;

  // Initialize game
  useEffect(() => {
    setGameStartTime(Date.now());
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
  }, [gridSize, rounds]);
  
  const handleNumberClick = (clickedNumber: number) => {
    if (clickedNumber === targetNumber) {
      // Correct - calculate score based on grid size and round
      const basePoints = 100;
      const gridBonus = (gridSize - 2) * 20; // Bigger grid = more points
      const roundBonus = rounds * 5; // Later rounds = more points
      
      const newPoints = basePoints + gridBonus + roundBonus;
      setScore(prevScore => prevScore + newPoints);
      
      // Next round
      setRounds(prevRounds => prevRounds + 1);
      
      if (rounds + 1 >= totalRounds) {
        // Game completed
        onFinish(score + newPoints, Date.now() - gameStartTime);
      } else {
        startNewRound();
      }
    } else {
      // Wrong number - penalty
      setScore(prevScore => Math.max(0, prevScore - 50));
    }
  };

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
