// Placeholder for TeamTab component
import React, { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GameState, TeamMemberType, HiringCosts, TeamMember, TeamMemberAttributes } from "@/app/types";
import { Users, UserPlus, Wrench, Palette, Megaphone } from 'lucide-react'; // Added specific icons
import { TeamMemberCard } from "../team-member-card"; // Import the new card

// Props for TeamTab
export interface TeamTabProps {
  gameState: GameState;
  hireTeamMember: (member: TeamMember) => void;
  hiringCosts: HiringCosts; // Add costs object
}

// Helper to generate random attributes within a specific range
const randomStatInRange = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Define attribute ranges for roles
const attributeRanges: Record<TeamMemberType, { [key in keyof TeamMemberAttributes]: { min: number, max: number } }> = {
    engineer: {
        coding: { min: 6, max: 9 },
        problemSolving: { min: 5, max: 8 },
        design: { min: 1, max: 4 },
        marketing: { min: 1, max: 3 },
        communication: { min: 2, max: 5 },
    },
    designer: {
        design: { min: 6, max: 9 },
        communication: { min: 4, max: 7 },
        problemSolving: { min: 3, max: 6 },
        coding: { min: 2, max: 5 },
        marketing: { min: 1, max: 4 },
    },
    marketer: {
        marketing: { min: 6, max: 9 },
        communication: { min: 5, max: 8 },
        problemSolving: { min: 2, max: 5 },
        design: { min: 1, max: 4 },
        coding: { min: 1, max: 3 },
    }
};

// Updated generateAttributes to use ranges if provided, otherwise fallback
const generateAttributes = (type: TeamMemberType): TeamMemberAttributes => {
    const ranges = attributeRanges[type];
    return {
        coding: randomStatInRange(ranges.coding.min, ranges.coding.max),
        design: randomStatInRange(ranges.design.min, ranges.design.max),
        marketing: randomStatInRange(ranges.marketing.min, ranges.marketing.max),
        communication: randomStatInRange(ranges.communication.min, ranges.communication.max),
        problemSolving: randomStatInRange(ranges.problemSolving.min, ranges.problemSolving.max),
    };
};

// Map types to icons and titles for cleaner code
const typeDetails: Record<TeamMemberType, { title: string, icon: React.ElementType }> = {
    engineer: { title: "Engineers", icon: Wrench },
    designer: { title: "Designers", icon: Palette },
    marketer: { title: "Marketers", icon: Megaphone }
};

export function TeamTab({ gameState, hireTeamMember, hiringCosts }: TeamTabProps) {
  const teamMemberTypes: TeamMemberType[] = ["engineer", "designer", "marketer"];

  // Generate candidates - useMemo helps prevent regeneration on every render
  const candidates = useMemo(() => {
    const generated: { [key in TeamMemberType]: TeamMember[] } = { engineer: [], designer: [], marketer: [] };
    teamMemberTypes.forEach(type => {
      for (let i = 0; i < 3; i++) { // Generate 3 candidates per type
        generated[type].push({
          id: uuidv4(),
          type: type,
          attributes: generateAttributes(type), // Generate attributes based on type ranges
        });
      }
    });
    return generated;
    // Dependency array includes day to refresh candidates daily.
  }, [gameState.day]);

  const currentTeamMembers = [
      ...gameState.team.engineers,
      ...gameState.team.designers,
      ...gameState.team.marketers,
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Current Team Card */}
      <Card className="flex flex-col min-h-[400px]"> {/* Added min-height for consistency */}
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2" /> Current Team</CardTitle>
           <CardDescription>Your active employees. Hover over a card to see attributes.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 overflow-y-auto">
          {currentTeamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Your team is empty. Hire some candidates!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTeamMembers.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hiring Candidates Card - Using Tabs */}
      <Card className="flex flex-col min-h-[400px]"> {/* Added min-height */}
        <CardHeader className="pb-2"> {/* Adjusted padding */}
          <CardTitle className="flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Available Candidates</CardTitle>
          <CardDescription>Potential hires available each day. Attributes vary.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pt-0"> {/* Removed top padding */} 
            <Tabs defaultValue="engineer" className="flex flex-col h-full">
                 <TabsList className="grid w-full grid-cols-3 mb-4"> {/* Tabs occupy full width */} 
                     {teamMemberTypes.map((memberType) => {
                         const details = typeDetails[memberType];
                         const Icon = details.icon;
                         const cost = hiringCosts[memberType];
                         return (
                            <TabsTrigger key={memberType} value={memberType}>
                                <Icon className="w-4 h-4 mr-1.5"/> {details.title}
                            </TabsTrigger>
                         );
                     })}
                </TabsList>

                {teamMemberTypes.map((memberType) => {
                    const cost = hiringCosts[memberType];
                    const typeCandidates = candidates[memberType];
                    const canAfford = gameState.cash >= cost;
                    const details = typeDetails[memberType];

                    return (
                        <TabsContent key={memberType} value={memberType} className="flex-grow space-y-3 mt-0 overflow-y-auto"> {/* Added flex-grow and overflow */} 
                            <div className="text-sm text-muted-foreground mb-2">Cost per hire: ${cost.toLocaleString()}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {typeCandidates.map((candidate) => (
                                    <TeamMemberCard
                                        key={candidate.id}
                                        member={candidate}
                                        isCandidate={true}
                                        onHire={hireTeamMember}
                                        cost={cost}
                                        disabled={gameState.gameOver || !canAfford}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    );
              })}
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 