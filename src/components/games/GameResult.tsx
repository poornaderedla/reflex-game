
import React from "react";
import { useNavigate } from "react-router-dom";
import { Award, Clock, Share2, RotateCcw, Home } from "lucide-react";
import Heading from "@/components/ui/heading";

interface GameResultProps {
  title: string;
  score: number;
  time: number;
  isHighScore: boolean;
  onRestart: () => void;
}

const GameResult: React.FC<GameResultProps> = ({
  title,
  score,
  time,
  isHighScore,
  onRestart,
}) => {
  const navigate = useNavigate();

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Reflex Elite - ${title}`,
        text: `I scored ${score} in ${(time / 1000).toFixed(2)}s on ${title}! Can you beat me?`,
        url: window.location.href,
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-sm animate-scale-in space-y-8">
        {isHighScore && (
          <div className="flex flex-col items-center justify-center">
            <div className="text-luxury-gold text-4xl mb-2">✨</div>
            <div className="text-luxury-gold font-semibold uppercase tracking-wider">
              New High Score
            </div>
          </div>
        )}

        <Heading as="h2" className="text-3xl font-bold">
          {score}
        </Heading>

        <div className="flex items-center justify-center gap-3 text-sm text-luxury-white/70">
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-luxury-gold" />
            <span>Score</span>
          </div>
          <div className="h-4 w-px bg-luxury-white/20"></div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-luxury-gold" />
            <span>{(time / 1000).toFixed(2)}s</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/")}
            className="btn-ghost flex flex-col items-center justify-center py-3"
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={onRestart}
            className="btn-outline flex flex-col items-center justify-center py-3"
          >
            <RotateCcw className="h-5 w-5 mb-1" />
            <span className="text-xs">Retry</span>
          </button>
          <button
            onClick={handleShare}
            className="btn-ghost flex flex-col items-center justify-center py-3"
          >
            <Share2 className="h-5 w-5 mb-1" />
            <span className="text-xs">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;
