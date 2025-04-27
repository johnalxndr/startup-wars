import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RandomEvent, EventImpact } from '@/app/types'; // Assuming RandomEvent type is exported from types

interface EventDialogProps {
  currentEvent: RandomEvent | null;
  acquisitionOfferAmount: number | null;
  gameStateValuation: number;
  onClose: () => void;
  onAcquisitionDecision: (accept: boolean) => void;
  eventImpact: EventImpact | null; // Correct the type to accept null and the full interface
}

export function EventDialog({
  currentEvent,
  acquisitionOfferAmount,
  gameStateValuation,
  onClose,
  onAcquisitionDecision,
  eventImpact,
}: EventDialogProps) {
  const isOpen = !!currentEvent;
  const isAcquisition = currentEvent?.id === 'acquisition';

  const handleOpenChange = (open: boolean) => {
    // Only call onClose if the dialog is being closed AND it's not an acquisition event
    // Acquisition events are closed via the decision buttons
    if (!open && !isAcquisition) {
      onClose();
    }
  };

  const handleInteractOutside = (e: Event) => {
     // Prevent closing acquisition dialog by clicking outside
    if (isAcquisition) {
      e.preventDefault();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={handleInteractOutside}
        // Optional: Hide default close button for acquisition offer
        // className={isAcquisition ? 'data-[state=open]:sm:close-button-hidden' : ''} // Needs custom CSS or utility
      >
        {currentEvent && (
          <>
            <DialogHeader>
              <DialogTitle>{currentEvent.title}</DialogTitle>
              <DialogDescription>
                {isAcquisition
                  ? `A major company wants to buy you out! They are offering $${(acquisitionOfferAmount ?? 0).toLocaleString()}. Your current valuation is $${gameStateValuation.toLocaleString()}.`
                  : currentEvent.description}
              </DialogDescription>
              {/* Display impact message AFTER description if it exists and not an acquisition */}
              {!isAcquisition && eventImpact && (
                <div className="mt-2 text-sm font-semibold text-muted-foreground">
                   Impact: {eventImpact.message}
                </div>
              )}
            </DialogHeader>
            <DialogFooter>
              {isAcquisition ? (
                <>
                  <Button variant="destructive" onClick={() => onAcquisitionDecision(false)}>Decline</Button>
                  <Button onClick={() => onAcquisitionDecision(true)}>Accept Offer</Button>
                </>
              ) : (
                <Button onClick={onClose}>OK</Button> // Use onClose for the OK button
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 