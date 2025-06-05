import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import Layout from "@/components/layout/Layout";
import GameContainer from "@/components/games/GameContainer";
import GameResult from "@/components/games/GameResult";
import { GameType } from "@/types/game";
import ColorChangeGame from "@/games/ColorChangeGame";
import CatchBallGame from "@/games/CatchBallGame";
import FindNumberGame from "@/games/FindNumberGame";
import FindColorGame from "@/games/FindColorGame";
import ColorTextGame from "@/games/ColorTextGame";
import ColorCatchGame from "@/games/ColorCatchGame";
import ReflexTapGame from "@/games/ReflexTapGame";
import PatternMemoryGame from "@/games/PatternMemoryGame";

const STANDARD_BEST_AVERAGE_TIMINGS: Record<string, number> = {
  colorChange: 0.20,      // 0.20s world average for "Color Change"
  catchBall: 0.18,        // 0.18s for "Catch the Ball"
  findNumber: 4.00,       // 4s standard average for grid
  findColor: 3.50,        // 3.5s for colors
  colorText: 4.00,        // 4s for color text
  colorCatch: 27.00,      // 27s for color catch
  reflexTap: 5.00,        // 5s (total for whole game or for all taps)
  patternMemory: 2.50,    // 2.5s per pattern
};

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { games, getGameHighScore, saveGameResult } = useGame();
  const [showResults, setShowResults] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);
  const [penaltyScore, setPenaltyScore] = useState(0);
  const [penaltyClicks, setPenaltyClicks] = useState(0);
  const navigate = useNavigate();

  const game = games.find(g => g.id === gameId);
  
  if (!game) {
    return <div>Game not found</div>;
  }

  const handleGameStart = () => {
    setShowResults(false);
  };

  const handleGameEnd = (score: number, time: number, penaltyScoreArg?: number, penaltyClicksArg?: number) => {
    const highScore = getGameHighScore(game.id as GameType) || 0;
    const newHighScore = score > highScore;
    
    const result = {
      gameId: game.id as GameType,
      score,
      time,
      date: new Date().toISOString(),
      isHighScore: newHighScore
    };
    
    saveGameResult(result);
    
    setGameScore(score);
    setGameTime(time);
    setIsHighScore(newHighScore);
    if (penaltyScoreArg !== undefined) setPenaltyScore(penaltyScoreArg);
    if (penaltyClicksArg !== undefined) setPenaltyClicks(penaltyClicksArg);
    setShowResults(true);
  };

  const handleRestart = () => {
    setShowResults(false);
    navigate(0);
  };

  const renderGame = () => {
    switch (game.id) {
      case "colorChange":
        return <ColorChangeGame onFinish={handleGameEnd} />;
      case "catchBall":
        return <CatchBallGame onFinish={handleGameEnd} />;
      case "findNumber":
        return <FindNumberGame onFinish={handleGameEnd} />;
      case "findColor":
        return <FindColorGame onFinish={handleGameEnd} />;
      case "colorText":
        return <ColorTextGame onFinish={handleGameEnd} />;
      case "colorCatch":
        return <ColorCatchGame onFinish={handleGameEnd} />;
      case "reflexTap":
        return <ReflexTapGame onFinish={handleGameEnd} />;
      case "patternMemory":
        return <PatternMemoryGame onFinish={handleGameEnd} />;
      default:
        return <div>Game component not available</div>;
    }
  };

  const standardBestAverage = STANDARD_BEST_AVERAGE_TIMINGS[game.id] ?? undefined;

  return (
    <Layout>
      {showResults && game.id !== "catchBall" ? (
        <GameResult
          title={game.name}
          score={gameScore}
          time={gameTime}
          isHighScore={isHighScore}
          onRestart={handleRestart}
          standardBestAverage={standardBestAverage}
          penaltyScore={penaltyScore}
          penaltyClicks={penaltyClicks}
        />
      ) : (
        <GameContainer
          title={game.name}
          instructions={game.instructions}
          onGameStart={handleGameStart}
          onGameEnd={handleGameEnd}
        >
          {renderGame()}
        </GameContainer>
      )}
    </Layout>
  );
};

export default GamePage;
