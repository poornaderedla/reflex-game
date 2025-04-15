
import React, { useState, useEffect } from "react";
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

const ColorTextGame: React.FC<ColorTextProps> = ({ onFinish }) => {
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [textColor, setTextColor] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [round, setRound] = useState(0);
  const maxRounds = 10;

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
  };

  const handleOptionClick = (colorName: string) => {
    if (!gameActive) return;

    // Check if the chosen option is the color of the text (not what the text says)
    const correctColor = COLORS.find(c => c.hex === textColor)?.name;
    
    if (colorName === correctColor) {
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
    
    setTimeout(() => {
      onFinish(score, timeTaken);
    }, 500);
  };

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
          Round {round + 1}/{maxRounds}
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
