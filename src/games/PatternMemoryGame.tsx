
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PatternMemoryProps {
  onFinish: (score: number, time: number) => void;
}

// Define colors for the pattern
const PATTERN_COLORS = [
  { name: "Red", hex: "#ff0000" },
  { name: "Blue", hex: "#0000ff" },
  { name: "Green", hex: "#00ff00" },
  { name: "Yellow", hex: "#ffff00" },
];

const PatternMemoryGame: React.FC<PatternMemoryProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [startTime] = useState<number>(Date.now());

  // Start the game
  useEffect(() => {
    startLevel();
  }, []);

  // Generate pattern for current level
  const startLevel = () => {
    const newPattern = [...pattern];
    // Add one new random button to the pattern
    newPattern.push(Math.floor(Math.random() * PATTERN_COLORS.length));
    setPattern(newPattern);
    setUserPattern([]);
    
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
        }, 500);
        
        i++;
      } else {
        clearInterval(intervalId);
        setIsShowingPattern(false);
      }
    }, 800);
  };

  // Handle user button clicks
  const handleButtonClick = (colorIndex: number) => {
    if (isShowingPattern || !gameActive) return;
    
    // Briefly highlight the pressed button
    setActiveButton(colorIndex);
    setTimeout(() => setActiveButton(null), 300);
    
    // Add to user's pattern attempt
    const newUserPattern = [...userPattern, colorIndex];
    setUserPattern(newUserPattern);
    
    // Check if this input matches the pattern so far
    const currentIndex = newUserPattern.length - 1;
    if (pattern[currentIndex] !== colorIndex) {
      // Wrong input - game over
      endGame();
      return;
    }
    
    // Check if the user completed the pattern
    if (newUserPattern.length === pattern.length) {
      // Correct pattern!
      setScore(prev => prev + level); // Score based on level
      setLevel(prev => prev + 1);
      
      // Short delay before next level
      setTimeout(() => {
        startLevel();
      }, 1000);
    }
  };

  const endGame = () => {
    setGameActive(false);
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-6 text-center">
        <div className="text-lg mb-1">
          {isShowingPattern ? "Watch the pattern..." : "Repeat the pattern"}
        </div>
        <div className="text-sm mb-4 text-luxury-white/70">
          Level: {level} | Score: {score}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {PATTERN_COLORS.map((color, index) => (
          <button
            key={index}
            className="relative h-24 rounded-lg transition-all transform active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: activeButton === index ? color.hex : "rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(255, 255, 255, 0.2)"
            }}
            onClick={() => handleButtonClick(index)}
            disabled={isShowingPattern || !gameActive}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-20"
              style={{ color: color.hex }}
            >
              <span className="text-4xl">■</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatternMemoryGame;
