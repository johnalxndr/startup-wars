"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameOverScreen } from "@/components/game/game-over-screen";
import { GameState } from "@/app/types";

export default function GameOverPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("startupWarsFinalState");
      if (stored) {
        setGameState(JSON.parse(stored));
      } else {
        router.replace("/");
      }
    }
  }, [router]);

  const resetGame = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("startupWarsFinalState");
    }
    router.replace("/");
  };

  if (!gameState) return null;

  return (
    <div className="container mx-auto py-6 max-w-5xl flex justify-center items-center min-h-screen">
      <GameOverScreen gameState={gameState} resetGame={resetGame} />
    </div>
  );
} 