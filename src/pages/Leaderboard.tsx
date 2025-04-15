
import React from "react";
import { useGame } from "@/contexts/GameContext";
import Layout from "@/components/layout/Layout";
import Heading from "@/components/ui/heading";
import { Clock, Award } from "lucide-react";

const Leaderboard: React.FC = () => {
  const { gameResults } = useGame();
  
  // Group results by game
  const resultsByGame = gameResults.reduce(
    (acc, result) => {
      if (!acc[result.gameId]) {
        acc[result.gameId] = [];
      }
      acc[result.gameId].push(result);
      return acc;
    },
    {} as Record<string, typeof gameResults>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <Heading as="h1">Leaderboard</Heading>
        
        {Object.entries(resultsByGame).length === 0 ? (
          <div className="mt-8 text-center text-luxury-white/70">
            <p>No game results yet.</p>
            <p className="mt-2 text-sm">Play some games to see your scores here!</p>
          </div>
        ) : (
          Object.entries(resultsByGame).map(([gameId, results]) => {
            // Sort by score (highest first)
            const sortedResults = [...results].sort((a, b) => b.score - a.score);
            const topResults = sortedResults.slice(0, 5); // Top 5 results
            
            return (
              <div key={gameId} className="rounded-xl border border-luxury-white/10 bg-card p-4">
                <h2 className="mb-3 text-lg font-medium capitalize">
                  {gameId.replace(/([A-Z])/g, " $1").trim()}
                </h2>
                
                <div className="space-y-2">
                  {topResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-luxury-black p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-luxury-white/10 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="font-medium">{result.score}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-luxury-white/70">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{(result.time / 1000).toFixed(2)}s</span>
                        </div>
                        {result.isHighScore && (
                          <div className="flex items-center gap-1 text-luxury-gold">
                            <Award className="h-3 w-3" />
                            <span>Best</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
