// Placeholder for FinancialsTab component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState } from "@/app/types";
import { DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface FinancialsTabProps {
  gameState: GameState;
  calculateBurnRate: () => number;
}

export function FinancialsTab({ gameState, calculateBurnRate }: FinancialsTabProps) {
  const burnRate = calculateBurnRate();
  const monthlyRevenue = gameState.users * gameState.mrrPerUser;
  const netMonthlyCashFlow = monthlyRevenue - burnRate;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Cash */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <DollarSign className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Cash</p>
              <p className="text-xl font-semibold">${gameState.cash.toLocaleString()}</p>
            </div>
          </div>

          {/* Valuation */}
           <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Valuation</p>
              <p className="text-xl font-semibold">${gameState.valuation.toLocaleString()}</p>
            </div>
          </div>

          {/* Burn Rate */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <TrendingDown className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Monthly Burn Rate</p>
              <p className="text-xl font-semibold">${burnRate.toLocaleString()}</p>
            </div>
          </div>

          {/* Monthly Revenue */}
           <div className="flex items-center space-x-3 p-4 border rounded-lg">
             <DollarSign className="w-6 h-6 text-yellow-500" />
             <div>
              <p className="text-sm text-muted-foreground">Est. Monthly Revenue</p>
              <p className="text-xl font-semibold">${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
             </div>
           </div>
           
           {/* Net Monthly Cash Flow */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg col-span-2">
             <DollarSign className={`w-6 h-6 ${netMonthlyCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
             <div>
              <p className="text-sm text-muted-foreground">Est. Monthly Net Cash Flow</p>
              <p className={`text-xl font-semibold ${netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netMonthlyCashFlow >= 0 ? '+' : ''}${netMonthlyCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
             </div>
           </div>

        </div>
      </CardContent>
    </Card>
  );
} 