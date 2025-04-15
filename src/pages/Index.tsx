
import React from "react";
import { Link } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import Layout from "@/components/layout/Layout";
import GameCard from "@/components/games/GameCard";
import Heading from "@/components/ui/heading";
import { Trophy } from "lucide-react";

const Index: React.FC = () => {
  const { games, streak, getDailyChallenge } = useGame();
  const dailyChallenge = getDailyChallenge();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">REFLEX ELITE</h1>
          <p className="mt-2 text-sm text-luxury-white/70">
            Train your cognitive reflexes
          </p>
        </div>

        {/* Daily Challenge */}
        <div className="rounded-xl bg-luxury-gold/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Heading as="h2" className="text-lg font-medium">
              Daily Challenge
            </Heading>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-luxury-gold/20 px-3 py-1 text-xs font-medium text-luxury-gold">
                <Trophy className="h-3 w-3" />
                <span>{streak} day streak</span>
              </div>
            )}
          </div>
          
          <Link to={`/game/${dailyChallenge.id}`}>
            <div className="rounded-lg bg-luxury-black p-4 transition-all hover:border-luxury-gold/30 border border-luxury-white/10 hover:shadow-[0_0_10px_rgba(191,175,128,0.1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-luxury-gold/10 text-2xl">
                  {dailyChallenge.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{dailyChallenge.name}</h3>
                  <p className="text-sm text-luxury-white/70">
                    {dailyChallenge.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* All Games */}
        <div>
          <Heading as="h2" className="mb-4 text-lg font-medium">
            All Games
          </Heading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
