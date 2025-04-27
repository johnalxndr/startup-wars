// Placeholder for TeamTab component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GameState, TeamMemberType, HiringCosts } from "@/app/types";
import { TeamTabProps } from "@/app/types";
import { Users, UserPlus } from 'lucide-react';

export function TeamTab({ gameState, hireTeamMember, getHiringCosts }: TeamTabProps) {
  const hiringCosts = getHiringCosts();
  const teamMemberTypes: TeamMemberType[] = ["engineer", "designer", "marketer"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Current Team Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Users className="w-5 h-5 mr-2 text-blue-500" /> Engineers
             </span>
             <span className="text-lg font-semibold">{gameState.team.engineers}</span>
          </div>
           <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Users className="w-5 h-5 mr-2 text-purple-500" /> Designers
             </span>
             <span className="text-lg font-semibold">{gameState.team.designers}</span>
          </div>
           <div className="flex items-center justify-between p-3 border rounded-lg">
             <span className="flex items-center font-medium">
               <Users className="w-5 h-5 mr-2 text-orange-500" /> Marketers
             </span>
             <span className="text-lg font-semibold">{gameState.team.marketers}</span>
          </div>
        </CardContent>
      </Card>

      {/* Hiring Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Hiring Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMemberTypes.map((memberType) => {
            const price = hiringCosts[memberType];
            const memberName = memberType.charAt(0).toUpperCase() + memberType.slice(1);
            const canAfford = gameState.cash >= price;
            return (
              <TooltipProvider key={memberType}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => hireTeamMember(memberType)}
                      disabled={gameState.gameOver || !canAfford}
                    >
                      <span className="flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Hire {memberName}
                      </span>
                      <Badge variant={canAfford ? "secondary" : "destructive"}>${price.toLocaleString()}</Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     {!canAfford && <p className="text-red-600">Cannot afford!</p>}
                     <p>Hire {memberName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
} 