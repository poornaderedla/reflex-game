
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

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { games, getGameHighScore, saveGameResult } = useGame();
  const [showResults, setShowResults] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);
  const navigate = useNavigate();

  // Find the game data
  const game = games.find(g => g.id === gameId);
  
  if (!game) {
    return <div>Game not found</div>;
  }

  const handleGameStart = () => {
    // Game started logic
    setShowResults(false);
  };

  const handleGameEnd = (score: number, time: number) => {
    // Check if it's a high score
    const highScore = getGameHighScore(game.id as GameType) || 0;
    const newHighScore = score > highScore;
    
    // Save result
    const result = {
      gameId: game.id as GameType,
      score,
      time,
      date: new Date().toISOString(),
      isHighScore: newHighScore
    };
    
    saveGameResult(result);
    
    // Update state to show results
    setGameScore(score);
    setGameTime(time);
    setIsHighScore(newHighScore);
    setShowResults(true);
  };

  const handleRestart = () => {
    setShowResults(false);
    navigate(0); // Refresh the page to restart the game
  };

  // Select the correct game component based on the game ID
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

  return (
    <Layout>
      {showResults ? (
        <GameResult
          title={game.name}
          score={gameScore}
          time={gameTime}
          isHighScore={isHighScore}
          onRestart={handleRestart}
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
