// Placeholder for ProductTab component
import React from 'react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GameState, AssetType, AssetPrices, GrowthAction, RecurringAction } from "@/app/types";
// import { ProductTabProps } from "@/app/types"; // Remove if defined below
import { Users, Server, Globe, Zap, Repeat, Rss, HardDrive } from 'lucide-react'; // Use HardDrive for Infra

// Define props for ProductTab
export interface ProductTabProps {
  gameState: GameState;
  buyAsset: (assetType: AssetType) => void;
  growthActions: GrowthAction[];
  recurringActions: RecurringAction[];
  executeGrowthAction: (actionId: string) => void;
  toggleRecurringAction: (actionId: string) => void;
  // getAssetPrices: () => AssetPrices; // Remove getter
  assetPrices: AssetPrices; // Add costs object
}

export function ProductTab({
  gameState,
  buyAsset,
  growthActions,
  recurringActions,
  executeGrowthAction,
  toggleRecurringAction,
  // getAssetPrices,
  assetPrices, // Update destructuring
}: ProductTabProps) {
  // const assetPrices = getAssetPrices(); // Remove getter call
  const infrastructureAssets: AssetType[] = ["infra", "patent"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Metrics Card (Left) */}
      <Card className="lg:col-span-1 overflow-hidden">
        <CardHeader>
          <CardTitle>Product Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Users Metric */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Users className="w-5 h-5 mr-2 text-cyan-500" /> Users
             </span>
             <span className="text-lg font-semibold">{gameState.users.toLocaleString()}</span>
          </div>
          {/* RPU Metric -> MRR/User Metric */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Rss className="w-5 h-5 mr-2 text-lime-500" /> MRR / User
             </span>
             <span className="text-lg font-semibold">${gameState.mrrPerUser.toFixed(2)}</span>
          </div>
          {/* Infra Metric */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <HardDrive className="w-5 h-5 mr-2 text-gray-500" /> Infrastructure
             </span>
             <span className="text-lg font-semibold">Level {gameState.assets.infraLevel}</span>
          </div>
          {/* Patents Metric */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Globe className="w-5 h-5 mr-2 text-indigo-500" /> Patents
             </span>
             <span className="text-lg font-semibold">{gameState.assets.patents}</span>
          </div>
        </CardContent>
      </Card>

      {/* Purchases & Upgrades Card (Middle, full width on mobile) */}
      <Card className="lg:col-span-1 overflow-hidden">
        <CardHeader>
          <CardTitle>Upgrades & Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 w-full">
            {/* Upgrade Infrastructure Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center px-4 py-3 text-base font-medium rounded-lg"
                    onClick={() => buyAsset("infra")}
                    disabled={gameState.gameOver || gameState.assets.infraLevel >= 3 || gameState.cash < assetPrices.infra[gameState.assets.infraLevel]}
                  >
                    <span className="flex items-center">
                      <HardDrive className="w-4 h-4 mr-2" /> Upgrade Infrastructure
                    </span>
                    <Badge className="ml-2 px-3 py-1 text-base font-mono" variant={gameState.cash >= assetPrices.infra[gameState.assets.infraLevel] ? "secondary" : "destructive"}>
                      {assetPrices.infra[gameState.assets.infraLevel]?.toLocaleString() || "Max"}
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {gameState.assets.infraLevel >= 3 ? <p>Max level reached</p> : <p>Upgrade to level {gameState.assets.infraLevel + 1}</p>}
                  {gameState.cash < assetPrices.infra[gameState.assets.infraLevel] && gameState.assets.infraLevel < 3 && <p className="text-red-600">Cannot afford!</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Patent Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center px-4 py-3 text-base font-medium rounded-lg"
                    onClick={() => buyAsset("patent")}
                    disabled={gameState.gameOver || gameState.cash < assetPrices.patent}
                  >
                    <span className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" /> Buy Patent
                    </span>
                    <Badge className="ml-2 px-3 py-1 text-base font-mono" variant={gameState.cash >= assetPrices.patent ? "secondary" : "destructive"}>
                      {assetPrices.patent.toLocaleString()}
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {gameState.cash < assetPrices.patent && <p className="text-red-600">Cannot afford!</p>}
                  <p>Acquire Patent</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Growth Actions Card (Right) */}
      <Card className="lg:col-span-1 overflow-hidden">
        <CardHeader>
          <CardTitle>Growth Actions</CardTitle>
        </CardHeader>
        <CardContent>
            {/* One-Time Actions */}
            <h4 className="font-semibold text-sm mb-2">One-Time Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {growthActions.map((action) => {
                const canAfford = gameState.cash >= action.cost;
                 return (
                      <TooltipProvider key={action.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                className="justify-between w-full px-4 py-3 text-base font-medium rounded-lg"
                                onClick={() => executeGrowthAction(action.id)}
                                disabled={gameState.gameOver || !canAfford}
                              >
                                <span className="flex items-center">
                                  <Zap className="w-4 h-4 mr-2 flex-shrink-0" />
                                  {action.name}
                                </span>
                                <Badge className="ml-2 px-3 py-1 text-base font-mono" variant={canAfford ? "secondary" : "destructive"}>${action.cost.toLocaleString()}</Badge>
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              {!canAfford && <p className="text-red-600">Cannot afford!</p>}
                              <p>{action.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                 );
              })}
            </div>

            {/* Recurring Actions */}
            <h4 className="font-semibold text-sm mt-6 mb-2">Recurring Actions</h4>
            <div className="space-y-3">
              {recurringActions.map((action) => {
                  const isActive = gameState.activeRecurringActions.includes(action.id);
                  const setupCost = action.setupCost ?? 0;
                  const cantAffordSetup = !isActive && setupCost > gameState.cash;
                  const isDisabled = gameState.gameOver || cantAffordSetup;

                  return (
                    <TooltipProvider key={action.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                              className={`flex items-center justify-between p-3 border rounded-md w-full ${ isDisabled ? 'opacity-50 cursor-not-allowed' : '' }`}
                              // Add onClick to the div IF it's not disabled, to allow toggling by clicking the row
                              onClick={!isDisabled ? () => toggleRecurringAction(action.id) : undefined} style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                            >
                              <div className="flex items-center">
                                <Repeat className="w-4 h-4 mr-2 flex-shrink-0" />
                                <div>
                                  <span className="font-medium">{action.name}</span>
                                  <div className="flex space-x-2 mt-1">
                                    {action.setupCost && <Badge variant="outline">Setup: ${action.setupCost.toLocaleString()}</Badge>}
                                    <Badge variant="outline">Monthly: ${action.monthlyCost.toLocaleString()}</Badge>
                                  </div>
                                </div>
                              </div>
                              <Switch
                                checked={isActive}
                                // Stop propagation to prevent the div's onClick from firing again
                                onCheckedChange={(e) => { toggleRecurringAction(action.id); }}
                                disabled={isDisabled}
                                aria-label={action.name}
                              />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {cantAffordSetup && <p className="text-red-600">Cannot afford setup: ${setupCost.toLocaleString()}</p>}
                            <p>{action.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
              })}
            </div>
        </CardContent>
      </Card>
    </div>
  );
} 