import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Progress } from "@/components/ui/8bit/progress";
import { DollarSign, Receipt, Users } from "lucide-react";
import { GameState } from "@/app/types";
import { GameStatsProps } from "@/app/types";
import { calculateBurnRate as importedCalculateBurnRate } from "@/lib/gameCalculations";
import { TEAM_MEMBER_MONTHLY_COSTS } from "@/data/game/costs";

export function GameStats({ gameState, prevGameState, calculateBurnRate }: GameStatsProps) {
  // Calculate components of cash flow
  const monthlyRevenue = gameState.users * gameState.mrrPerUser;
  const totalBurn = calculateBurnRate();
  const netMonthlyChange = monthlyRevenue - totalBurn;

  // Helper to calculate burn for any state
  const getBurn = (state: GameState) => importedCalculateBurnRate(state, TEAM_MEMBER_MONTHLY_COSTS);

  // Calculate previous values and diffs
  const prevMonthlyRevenue = prevGameState ? prevGameState.users * prevGameState.mrrPerUser : null;
  const prevTotalBurn = prevGameState ? getBurn(prevGameState) : null;
  const prevNetMonthlyChange = prevMonthlyRevenue !== null && prevTotalBurn !== null ? prevMonthlyRevenue - prevTotalBurn : null;

  // Helper to render diff
  const renderDiff = (current: number, prev: number | null) => {
    if (prev === null || prev === undefined) return null;
    const diff = current - prev;
    if (diff === 0) return <span className="ml-1 text-xs text-muted-foreground">(0)</span>;
    const sign = diff > 0 ? "+" : "";
    const color = diff > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    return (
      <span className={`ml-1 text-xs font-semibold ${color}`}>({sign}{diff.toLocaleString()})</span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            Cash
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${gameState.cash.toLocaleString()}
          </div>
          {renderDiff(gameState.cash, prevGameState?.cash ?? null) && (
            <div className="text-xs mt-1">{renderDiff(gameState.cash, prevGameState?.cash ?? null)}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            Burn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            -${totalBurn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
          </div>
          {renderDiff(-totalBurn, prevTotalBurn !== null ? -prevTotalBurn : null) && (
            <div className="text-xs mt-1">{renderDiff(-totalBurn, prevTotalBurn !== null ? -prevTotalBurn : null)}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            MRR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {renderDiff(monthlyRevenue, prevMonthlyRevenue) && (
            <div className="text-xs mt-1">{renderDiff(monthlyRevenue, prevMonthlyRevenue)}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {gameState.users.toLocaleString()}
          </div>
          {renderDiff(gameState.users, prevGameState?.users ?? null) && (
            <div className="text-xs mt-1">{renderDiff(gameState.users, prevGameState?.users ?? null)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 