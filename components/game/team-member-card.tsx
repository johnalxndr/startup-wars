import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TeamMember, TeamMemberType } from "@/app/types"
import { AttributeHoverCard } from "./attribute-hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMemberCardProps {
  member: TeamMember // Represents either a current member or a candidate
  isCandidate?: boolean // Flag to show 'Hire' button for candidates
  onHire?: (member: TeamMember) => void // Action for hiring
  cost?: number // Cost to display if it's a candidate
  disabled?: boolean // Disable hire button (e.g., insufficient funds)
}

// Helper for nice titles
const memberTypeTitles: Record<TeamMemberType, string> = {
    engineer: "Engineer",
    designer: "Designer",
    marketer: "Marketer",
};

// Helper for generating initials
const getInitials = (type: TeamMemberType): string => {
    return type.substring(0, 2).toUpperCase();
}

export function TeamMemberCard({ member, isCandidate = false, onHire, cost, disabled = false }: TeamMemberCardProps) {
  const title = memberTypeTitles[member.type];
  const initials = getInitials(member.type);

  return (
    <AttributeHoverCard attributes={member.attributes}>
      <Card className="w-full overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-3">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
             <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {/* Optionally display ID or other small info here */}
        </CardHeader>
        <CardContent className="px-3 pb-2">
          {isCandidate && onHire && cost !== undefined && (
            <div className="mt-1 flex flex-col space-y-1">
                <span className="text-xs text-muted-foreground">Cost: ${cost.toLocaleString()}</span>
                <Button
                    onClick={() => onHire(member)}
                    size="sm"
                    disabled={disabled}
                    className="h-7 px-2"
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