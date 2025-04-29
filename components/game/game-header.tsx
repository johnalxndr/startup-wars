import React from 'react';
import { Press_Start_2P } from "next/font/google"
import { Button } from "@/components/ui/8bit/button";
import { Badge } from "@/components/ui/8bit/badge";

const pressStart = Press_Start_2P({
  weight: ["400"],
  subsets: ["latin"],
})

interface GameHeaderProps {
  title: string;
  month: number;
  onNextMonth: () => void;
  isAdvancingMonth: boolean;
  gameOver: boolean;
}

export function GameHeader({ title, month, onNextMonth, isAdvancingMonth, gameOver }: GameHeaderProps) {
  return (
    <header className="text-center mb-6 relative flex flex-col items-center gap-2">
      <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${pressStart.className} flex items-center gap-2`}>
        {title}
      </h1>
      <div className="flex items-center gap-3 mt-2">
        <Badge font="retro" variant="outline" className="px-4 py-1 text-base">
          Month <span className="font-bold">{month}</span>
        </Badge>
        {!gameOver && (
          <Button
            onClick={onNextMonth}
            disabled={isAdvancingMonth}
            variant="outline"
            font="retro"
            className="ml-2 px-6 py-2 text-base md:text-lg bg-pink-200 dark:bg-pink-700 border-pink-400 hover:bg-pink-300 dark:hover:bg-pink-600 transition-all duration-150 shadow-lg relative"
          >
            {isAdvancingMonth ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Advancing...
              </>
            ) : (
              'Next Month'
            )}
          </Button>
        )}
      </div>
    </header>
  );
}