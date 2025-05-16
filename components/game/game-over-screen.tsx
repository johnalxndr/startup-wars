import React from 'react';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameState } from "@/app/types"; // Moved types to a separate file

interface GameOverScreenProps {
  gameState: GameState;
  resetGame: () => void;
}

export function GameOverScreen({ gameState, resetGame }: GameOverScreenProps) {
  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Game Over!</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-xl mb-4">
          {gameState.cash > 0
            ? "You successfully exited your startup!"
            : "Your startup ran out of cash and failed."}
        </p>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Final Valuation:</span> ${gameState.valuation.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Cash:</span> ${gameState.cash.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Users:</span> {gameState.users.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Months Survived:</span> {gameState.month}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button onClick={resetGame}>Start New Game</Button>
      </CardFooter>
    </Card>
  );
}; 