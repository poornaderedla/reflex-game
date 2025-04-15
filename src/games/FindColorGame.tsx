
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
];

const FindColorGame: React.FC<FindColorProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [round, setRound] = useState(0);
  const maxRounds = 10;

  // Initialize the game
  useEffect(() => {
    generateNewRound();
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
  };

  const handleColorClick = (color: string) => {
    if (!gameActive) return;

    if (color === targetColor) {
      setScore(prev => prev + 1);
    }

    // Move to next round or finish
    setRound(prev => {
      const nextRound = prev + 1;
      if (nextRound >= maxRounds) {
        endGame();
        return prev;
      } else {
        generateNewRound();
        return nextRound;
      }
    });
  };

  const endGame = () => {
    setGameActive(false);
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    // Use setTimeout to ensure UI updates before finishing
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 500);
  };

  // Render the color name to match
  const getColorStyle = (colorName: string) => {
    const color = COLORS.find(c => c.name === colorName);
    return { color: color?.hex || "#fff" };
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-8 text-center">
        <div className="text-lg mb-2">Find this color:</div>
        <div 
          className="text-3xl font-bold mb-6" 
          style={getColorStyle(targetColor)}
        >
          ■■■
        </div>
        <div className="text-sm mb-4 text-luxury-white/70">
          Round {round + 1}/{maxRounds}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {options.map((color, index) => (
          <Button
            key={index}
            onClick={() => handleColorClick(color)}
            className="py-8 text-lg font-medium"
            variant="outline"
            disabled={!gameActive}
          >
            {color}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FindColorGame;
