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
    if (pattern[currentIndex] !== colorIndex) {
      // Wrong input - game over
      setFeedback("Wrong pattern! Game over.");
      endGame();
      return;
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
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 1000);
  };

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
