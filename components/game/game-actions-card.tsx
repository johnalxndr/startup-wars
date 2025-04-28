import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs";
import { Button } from "@/components/ui/8bit/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GameState, GameEvent } from "@/app/types";
import { GameActionsCardProps } from "@/app/types";

export function GameActionsCard({
  gameState,
  resetGame,
}: GameActionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="events">
          <TabsList className="grid grid-cols-1 mb-4">
            <TabsTrigger value="events">Events Log</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <ScrollArea className="h-[200px]">
              {gameState.events.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No events yet. Start playing!</p>
              ) : (
                <div className="space-y-2">
                  {gameState.events
                    .slice()
                    .reverse()
                    .map((event: GameEvent, index: number) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${event.type === "positive"
                            ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                            : event.type === "negative"
                              ? "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
                              : event.type === "special"
                                ? "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100"
                                : "bg-muted"
                          }`}
                      >
                        <span className="font-medium">Month {event.month}:</span> {event.message}
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetGame}>
          {gameState.gameOver ? "New Game" : "Reset Game"}
        </Button>
      </CardFooter>
    </Card>
  );
}; 