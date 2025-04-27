import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Rocket, Users } from "lucide-react";
import { GameState } from "@/app/types";
import { GameStatsProps } from "@/app/types";

export function GameStats({ gameState, calculateBurnRate }: GameStatsProps) {
  // Calculate components of cash flow
  const dailyRevenue = gameState.users * gameState.revenuePerUser;
  const totalBurn = calculateBurnRate();
  const netDailyChange = dailyRevenue - totalBurn;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Cash
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${gameState.cash.toLocaleString()}</div>
          <p className={`text-sm font-medium ${netDailyChange >= 0 ? 'text-green-600' : 'text-red-600'} dark:${netDailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netDailyChange >= 0 ? '+' : ''}${netDailyChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Rocket className="w-4 h-4 mr-1" />
            Valuation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${gameState.valuation.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Day {gameState.day}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="w-4 h-4 mr-1" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{gameState.users.toLocaleString()}</div>
          <Progress value={Math.min(100, (gameState.users / 10000) * 100)} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}; 