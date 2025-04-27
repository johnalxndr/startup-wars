// Placeholder for MainTabs component
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameState, AssetType, GrowthAction, RecurringAction, GameEvent, TeamMember, HiringCosts, AssetPrices } from "@/app/types"; // Removed MarketPrices

// Import Tab Content Placeholders (we'll implement these later)
import { FinancialsTab } from './tabs/financials-tab';
import { TeamTab } from './tabs/team-tab';
import { ProductTab } from './tabs/product-tab';
// Import the refactored GameActionsCard with correct path
import { GameActionsCard } from '@/components/game/game-actions-card';
// Import the updated props type
import { MainTabsProps } from "@/app/types";

// Define Props for MainTabs (Interface now defined in app/types.ts)

export function MainTabs({ 
    gameState,
    hiringCosts,
    assetPrices,
    hireTeamMember,
    buyAsset,
    resetGame,
    growthActions,
    recurringActions,
    executeGrowthAction,
    toggleRecurringAction,
    calculateBurnRate
}: MainTabsProps) {
  return (
    <Tabs defaultValue="financials" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="product">Product</TabsTrigger>
        <TabsTrigger value="event-logs">Event Logs</TabsTrigger>
      </TabsList>
      
      <TabsContent value="financials">
        <FinancialsTab gameState={gameState} calculateBurnRate={calculateBurnRate} />
      </TabsContent>
      
      <TabsContent value="team">
         <TeamTab 
            gameState={gameState} 
            hiringCosts={hiringCosts}
            hireTeamMember={hireTeamMember}
         />
      </TabsContent>
      
      <TabsContent value="product">
        <ProductTab 
             gameState={gameState} 
             buyAsset={buyAsset} 
             growthActions={growthActions} 
             recurringActions={recurringActions} 
             executeGrowthAction={executeGrowthAction} 
             toggleRecurringAction={toggleRecurringAction} 
             assetPrices={assetPrices}
        />
      </TabsContent>

      <TabsContent value="event-logs">
        <GameActionsCard
          gameState={gameState}
          resetGame={resetGame}
        />
      </TabsContent>
    </Tabs>
  );
} 