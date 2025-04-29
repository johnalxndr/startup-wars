"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/8bit/dialog"
import { Button } from "@/components/ui/8bit/button"
import { Badge } from "@/components/ui/8bit/badge"
import type { RandomEvent, EventImpact } from "@/app/types"
import { Loader2 } from "lucide-react"

interface EventDialogProps {
  currentEvent: RandomEvent | null
  acquisitionOfferAmount: number | null
  gameStateValuation: number
  onClose: () => void
  onAcquisitionDecision: (accept: boolean) => void
  eventImpact: EventImpact | null
  isAdvancingMonth: boolean
}

export function EventDialog({
  currentEvent,
  acquisitionOfferAmount,
  gameStateValuation,
  onClose,
  onAcquisitionDecision,
  eventImpact,
  isAdvancingMonth,
}: EventDialogProps) {
  const isOpen = !!currentEvent || isAdvancingMonth
  const isAcquisition = currentEvent?.id === "acquisition"

  const handleOpenChange = (open: boolean) => {
    // Only call onClose if the dialog is being closed AND it's not an acquisition event AND we're not advancing month
    if (!open && !isAcquisition && !isAdvancingMonth) {
      onClose()
    }
  }

  const handleInteractOutside = (e: Event) => {
    // Prevent closing dialog by clicking outside during acquisition or month advancement
    if (isAcquisition || isAdvancingMonth) {
      e.preventDefault()
    }
  }

  // Determine event type based on impact
  const getEventType = () => {
    if (!eventImpact) return "info"

    // Check if there are any negative impacts
    const hasNegativeImpact =
      (eventImpact.cashChange && eventImpact.cashChange < 0) ||
      (eventImpact.userChange && eventImpact.userChange < 0) ||
      (eventImpact.valuationChange && eventImpact.valuationChange < 0) ||
      (eventImpact.mrrPerUserChange && eventImpact.mrrPerUserChange < 0)

    // Check if there are any positive impacts
    const hasPositiveImpact =
      (eventImpact.cashChange && eventImpact.cashChange > 0) ||
      (eventImpact.userChange && eventImpact.userChange > 0) ||
      (eventImpact.valuationChange && eventImpact.valuationChange > 0) ||
      (eventImpact.mrrPerUserChange && eventImpact.mrrPerUserChange > 0)

    if (hasNegativeImpact && !hasPositiveImpact) return "negative"
    if (hasPositiveImpact && !hasNegativeImpact) return "positive"
    if (hasPositiveImpact && hasNegativeImpact) return "mixed"
    return "info"
  }

  // Get badge color based on event type
  const getBadgeVariant = () => {
    const eventType = getEventType()
    switch (eventType) {
      case "positive":
        return "success"
      case "negative":
        return "destructive"
      case "mixed":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        {isAdvancingMonth && !currentEvent ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Advancing Month...</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-10">
              {/* Lucide Loader Spinner */}
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <div className="text-lg font-semibold text-center text-indigo-700 animate-pulse">
                Simulating startup chaos…
              </div>
              <div className="mt-2 text-sm text-muted-foreground text-center">
                Crunching the numbers, rolling the dice, and preparing your next month!
              </div>
            </div>
          </>
        ) : currentEvent && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">{currentEvent.title}</DialogTitle>
                {!isAcquisition && eventImpact && (
                  <Badge variant={getBadgeVariant() as any}>
                    {getEventType() === "positive"
                      ? "Positive"
                      : getEventType() === "negative"
                        ? "Negative"
                        : getEventType() === "mixed"
                          ? "Mixed"
                          : "Info"}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-base mt-2">
                {isAcquisition
                  ? `A major company wants to buy you out! They are offering $${(acquisitionOfferAmount ?? 0).toLocaleString()}. Your current valuation is $${gameStateValuation.toLocaleString()}.`
                  : currentEvent.description}
              </DialogDescription>
            </DialogHeader>

            {/* Impact details section */}
            {!isAcquisition && eventImpact && (
              <div className="my-4 space-y-2 border rounded-md p-3 bg-muted/30">
                <h4 className="font-semibold text-sm">Event Impact:</h4>
                <p className="text-sm">{eventImpact.message}</p>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {eventImpact.cashChange !== undefined && eventImpact.cashChange !== 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Cash: </span>
                      <span className={eventImpact.cashChange >= 0 ? "text-green-600" : "text-red-600"}>
                        {eventImpact.cashChange >= 0 ? "+" : ""}
                        ${eventImpact.cashChange.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {eventImpact.userChange !== undefined && eventImpact.userChange !== 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Users: </span>
                      <span className={eventImpact.userChange >= 0 ? "text-green-600" : "text-red-600"}>
                        {eventImpact.userChange >= 0 ? "+" : ""}
                        {eventImpact.userChange.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {eventImpact.valuationChange !== undefined && eventImpact.valuationChange !== 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Valuation: </span>
                      <span className={eventImpact.valuationChange >= 0 ? "text-green-600" : "text-red-600"}>
                        {eventImpact.valuationChange >= 0 ? "+" : ""}
                        ${eventImpact.valuationChange.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {eventImpact.mrrPerUserChange !== undefined && eventImpact.mrrPerUserChange !== 0 && (
                    <div className="text-sm">
                      <span className="font-medium">MRR/User: </span>
                      <span className={eventImpact.mrrPerUserChange >= 0 ? "text-green-600" : "text-red-600"}>
                        {eventImpact.mrrPerUserChange >= 0 ? "+" : ""}
                        ${eventImpact.mrrPerUserChange.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="mt-2">
              {isAcquisition ? (
                <>
                  <Button variant="destructive" onClick={() => onAcquisitionDecision(false)}>
                    Decline
                  </Button>
                  <Button onClick={() => onAcquisitionDecision(true)}>Accept Offer</Button>
                </>
              ) : (
                <Button onClick={onClose}>Continue</Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 