
export type GameType = 
  | "colorChange" 
  | "catchBall" 
  | "findNumber" 
  | "findColor" 
  | "colorText" 
  | "colorCatch" 
  | "reflexTap" 
  | "patternMemory";

export interface Game {
  id: GameType;
  name: string;
  description: string;
  instructions: string;
  icon: string;
  highScore?: number;
  bestTime?: number;
}

export interface GameResult {
  gameId: GameType;
  score: number;
  time: number;
  date: string;
  isHighScore: boolean;
}

export type GameStatus = "idle" | "countdown" | "playing" | "finished";
