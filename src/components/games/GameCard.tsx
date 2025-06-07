import React from "react";
import { Link } from "react-router-dom";
import { Game } from "@/types/game";
import { Clock, Award } from "lucide-react";

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <Link to={`/game/${game.id}`} className="block w-full">
      <div className="game-card group aspect-square w-full min-h-[220px] max-h-[260px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-luxury-white/20 bg-luxury-black text-3xl transition-all group-hover:border-luxury-gold/50 group-hover:text-luxury-gold">
          {game.icon}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{game.name}</h3>
          <p className="mt-1 text-sm text-luxury-white/70">{game.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
