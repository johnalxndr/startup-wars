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
import { ProductTabProps } from "@/app/types";
import { Users, Server, Globe, Zap, Repeat, Rss } from 'lucide-react'; // Added Rss for RPU

export function ProductTab({
  gameState,
  buyAsset,
  growthActions,
  recurringActions,
  executeGrowthAction,
  toggleRecurringAction,
  getAssetPrices,
}: ProductTabProps) {
  const assetPrices = getAssetPrices();
  const infrastructureAssets: AssetType[] = ["server", "patent"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Metrics & Infrastructure Card (Left) */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Product Metrics & Infra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Users Metric */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Users className="w-5 h-5 mr-2 text-cyan-500" /> Users
             </span>
             <span className="text-lg font-semibold">{gameState.users.toLocaleString()}</span>
          </div>
          {/* RPU Metric */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Rss className="w-5 h-5 mr-2 text-lime-500" /> Revenue / User
             </span>
             <span className="text-lg font-semibold">${gameState.revenuePerUser.toFixed(2)}</span>
          </div>
          {/* Servers Metric */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Server className="w-5 h-5 mr-2 text-gray-500" /> Servers
             </span>
             <span className="text-lg font-semibold">{gameState.assets.servers}</span>
          </div>
           {/* Patents Metric */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Globe className="w-5 h-5 mr-2 text-indigo-500" /> Patents
             </span>
             <span className="text-lg font-semibold">{gameState.assets.patents}</span>
          </div>
          
          {/* Buy Infrastructure Buttons */}
          <div className="pt-4 space-y-3">
             {infrastructureAssets.map((assetType) => {
                const price = assetPrices[assetType];
                const assetName = assetType.charAt(0).toUpperCase() + assetType.slice(1);
                const canAfford = gameState.cash >= price;
                const icon = assetType === 'server' ? <Server className="w-4 h-4 mr-2" /> : <Globe className="w-4 h-4 mr-2" />;
                return (
                  <TooltipProvider key={assetType}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => buyAsset(assetType)}
                          disabled={gameState.gameOver || !canAfford}
                        >
                          <span className="flex items-center">
                            {icon} Buy {assetName}
                          </span>
                          <Badge variant={canAfford ? "secondary" : "destructive"}>${price.toLocaleString()}</Badge>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {!canAfford && <p className="text-red-600">Cannot afford!</p>}
                        <p>Acquire {assetName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
             })}
          </div>

        </CardContent>
      </Card>

      {/* Growth Actions Card (Right) */}
      <Card className="lg:col-span-2">
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
                                className="justify-between"
                                onClick={() => executeGrowthAction(action.id)}
                                disabled={gameState.gameOver || !canAfford}
                              >
                                <span className="flex items-center">
                                  <Zap className="w-4 h-4 mr-2 flex-shrink-0" />
                                  {action.name}
                                </span>
                                <Badge variant={canAfford ? "secondary" : "destructive"}>${action.cost.toLocaleString()}</Badge>
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
                              className={`flex items-center justify-between p-3 border rounded-md ${ isDisabled ? 'opacity-50 cursor-not-allowed' : '' }`}
                              // Add onClick to the div IF it's not disabled, to allow toggling by clicking the row
                              onClick={!isDisabled ? () => toggleRecurringAction(action.id) : undefined} style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                            >
                              <div className="flex items-center">
                                <Repeat className="w-4 h-4 mr-2 flex-shrink-0" />
                                <div>
                                  <span className="font-medium">{action.name}</span>
                                  <div className="flex space-x-2 mt-1">
                                    {action.setupCost && <Badge variant="outline">Setup: ${action.setupCost.toLocaleString()}</Badge>}
                                    <Badge variant="outline">Daily: ${action.dailyCost.toLocaleString()}</Badge>
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