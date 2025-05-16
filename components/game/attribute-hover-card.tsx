import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Progress } from "@/components/ui/progress"
import { TeamMemberAttributes } from "@/app/types"

interface AttributeHoverCardProps {
  attributes: TeamMemberAttributes
  children: React.ReactNode // To wrap the trigger element
}

const attributeLabels: Record<keyof TeamMemberAttributes, string> = {
  coding: "Coding",
  design: "Design",
  marketing: "Marketing",
};

export function AttributeHoverCard({ attributes, children }: AttributeHoverCardProps) {
  // Max possible value for progress bar (adjust if needed)
  const MAX_ATTRIBUTE_VALUE = 10;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-60 space-y-3 p-4">
        <h4 className="text-sm font-semibold mb-2">Attributes</h4>
        {Object.entries(attributes)
          .map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 items-center gap-2">
            <span className="text-xs font-medium col-span-1">
              {attributeLabels[key as keyof TeamMemberAttributes]}
            </span>
            <Progress
              value={(value / MAX_ATTRIBUTE_VALUE) * 100}
              className="w-full col-span-2 h-2"
              aria-label={`${attributeLabels[key as keyof TeamMemberAttributes]} level ${value}`}
            />
            {/* Optional: Show numeric value */}
            {/* <span className="text-xs text-muted-foreground text-right">{value}</span> */}
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  )
} 