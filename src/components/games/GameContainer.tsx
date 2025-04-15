
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameStatus } from "@/types/game";
import { ChevronLeft } from "lucide-react";
import Heading from "@/components/ui/heading";

interface GameContainerProps {
  title: string;
  instructions: string;
  children: React.ReactNode;
  onGameStart: () => void;
  onGameEnd: (score: number, time: number) => void;
}

const GameContainer: React.FC<GameContainerProps> = ({
  title,
  instructions,
  children,
  onGameStart,
  onGameEnd,
}) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [countdown, setCountdown] = useState<number>(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameStatus === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (gameStatus === "countdown" && countdown === 0) {
      setGameStatus("playing");
      onGameStart();
    }
  }, [gameStatus, countdown, onGameStart]);

  const handleStartGame = () => {
    setGameStatus("countdown");
    setCountdown(3);
  };

  const handleFinishGame = (score: number, time: number) => {
    setGameStatus("finished");
    onGameEnd(score, time);
  };

  const handleBackClick = () => {
    if (gameStatus === "playing") {
      if (confirm("Are you sure you want to quit this game?")) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={handleBackClick}
          className="flex h-10 w-10 items-center justify-center rounded-md text-luxury-white/70 hover:bg-luxury-white/10 hover:text-luxury-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <Heading as="h1" className="text-center text-xl">
          {title}
        </Heading>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <div className="flex flex-1 flex-col">
        {gameStatus === "idle" && (
          <div className="flex flex-1 flex-col items-center justify-center space-y-8 px-4 text-center">
            <div className="text-5xl">{title.split(" ")[0] === "The" ? title.split(" ").slice(1).join(" ") : title.split(" ")[0]}</div>
            <p className="text-luxury-white/70">{instructions}</p>
            <button
              onClick={handleStartGame}
              className="btn-primary w-full max-w-xs"
            >
              START
            </button>
          </div>
        )}

        {gameStatus === "countdown" && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-8xl font-bold text-luxury-gold animate-pulse-subtle">
              {countdown}
            </div>
          </div>
        )}

        {gameStatus === "playing" && (
          <div className="flex-1">
            {React.isValidElement(children) ? 
              React.cloneElement(children as React.ReactElement<any>, {
                onFinish: handleFinishGame,
              }) : 
              children}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;
