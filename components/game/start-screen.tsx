import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface StartScreenProps {
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🚀 Startup Wars</CardTitle>
          <CardDescription>Build your empire from the ground up.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-6">Ready to start your journey?</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={onStartGame} size="lg">Start New Game</Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 