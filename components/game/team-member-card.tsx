import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { TeamMember, TeamMemberType } from "@/app/types"
import { AttributeHoverCard } from "./attribute-hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/8bit/avatar"

interface TeamMemberCardProps {
  member: TeamMember // Represents either a current member or a candidate
  isCandidate?: boolean // Flag to show 'Hire' button for candidates
  onHire?: (member: TeamMember) => void // Action for hiring
  monthlyCost?: number // Add monthly cost prop (optional as it's only for candidates)
  disabled?: boolean // Disable hire button (e.g., game over)
  playerName?: string // Optional player name for the founder
}

// Helper for nice titles
const memberTypeTitles: Record<TeamMemberType, string> = {
    engineer: "Engineer",
    designer: "Designer",
    marketer: "Marketer",
    founder: "Founder", // Keep this for fallback/candidates if needed
};

// Helper for generating initials
const getInitials = (type: TeamMemberType, name?: string): string => {
    if (type === 'founder' && name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return type.substring(0, 2).toUpperCase();
}

export function TeamMemberCard({ member, isCandidate = false, onHire, monthlyCost, disabled = false, playerName }: TeamMemberCardProps) {
  // Use playerName for title if it's the founder, otherwise use the type title
  const title = member.type === 'founder' && playerName ? playerName : memberTypeTitles[member.type];
  const initials = getInitials(member.type, playerName); // Pass playerName to getInitials

  return (
    <AttributeHoverCard attributes={member.attributes}>
      <Card className="w-full overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              {/* Use calculated initials */}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
             {/* Use calculated title */}
             <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {/* Optionally display ID or other small info here */}
        </CardHeader>
        <CardContent className="px-3 pb-2">
          {isCandidate && onHire && (
            <div className="mt-1 flex flex-col space-y-1">
                {/* Display monthly cost if provided */} 
                {monthlyCost !== undefined && (
                    <span className="text-xs text-muted-foreground">Monthly Cost: ${monthlyCost.toLocaleString()}</span>
                )}
                <Button
                    onClick={() => onHire(member)}
                    disabled={disabled}
                    variant="outline"
                    className="mt-2"
                >
                    Hire
                </Button>
            </div>
          )}
          {!isCandidate && (
            <p className="text-xs text-muted-foreground pt-0.5">Hover for attributes</p>
          )}
        </CardContent>
      </Card>
    </AttributeHoverCard>
  )
} 