"use client"

import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs

import { ModeToggle } from "@/components/theme-toggle"
import {
  GameState,
  GameEvent,
  TeamMembers,
  Assets,
  TeamMemberType,
  AssetType,
  TeamMemberMonthlyCosts,
  AssetPrices,
  RandomEvent,
  GrowthAction,
  RecurringAction,
  TeamMemberAttributes,
  TeamMember,
  EventImpact // Import EventImpact
} from "@/app/types"; // Types now use month, mrrPerUser, monthlyCost etc.

// Import new components
import { GameHeader } from "@/components/game/game-header";
import { GameStats } from "@/components/game/game-stats"; // Will receive updated GameState
import { GameOverScreen } from "@/components/game/game-over-screen"; // Will receive updated GameState
import { MainTabs } from "@/components/game/main-tabs"; // Will receive updated GameState and RecurringAction
import { Button } from "@/components/ui/button";
import { EventDialog } from '@/components/game/event-dialog'; // Will receive updated GameState
import { RANDOM_EVENTS } from "@/data/game/random-events"; // Uses updated GameState/GameEvent
import { INITIAL_STATE } from "@/data/game/initial-state"; // Uses updated GameState
import { GROWTH_ACTIONS } from "@/data/game/growth-actions"; // Uses updated GameState
import { RECURRING_ACTIONS } from "@/data/game/recurring-actions"; // Uses updated RecurringAction
import { TEAM_MEMBER_MONTHLY_COSTS, ASSET_PRICES } from "@/data/game/costs"; // Renamed import

// Import new setup components
import { StartScreen } from '@/components/game/start-screen';
import { NameInput } from '@/components/game/name-input';
import { AttributeAllocator } from '@/components/game/attribute-allocator';

// Game constants

type SetupStep = "start" | "name" | "attributes" | "complete"; // Define setup steps type

// Helper to generate random attributes - Removed

// INITIAL_STATE moved to data/game/initial-state.ts

// RANDOM_EVENTS moved to data/game/random-events.ts

// GROWTH_ACTIONS moved to data/game/growth-actions.ts

// RECURRING_ACTIONS moved to data/game/recurring-actions.ts

// Costs moved to data/game/costs.ts

export default function StartupWars() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null)
  const [currentEventImpact, setCurrentEventImpact] = useState<EventImpact | null>(null); // Uses updated EventImpact
  const [acquisitionOfferAmount, setAcquisitionOfferAmount] = useState<number | null>(null);
  const [setupStep, setSetupStep] = useState<SetupStep>("start"); // New state for setup flow
  const [playerAttributes, setPlayerAttributes] = useState<TeamMemberAttributes | null>(null); // State for player attributes during setup

  // Handler to move from Start to Name input
  const handleStartGame = () => {
    setSetupStep("name");
  };

  // Handler to save name and move to Attribute allocation
  const handleNameSubmit = (name: string) => {
    setGameState(prevState => ({ ...prevState, playerName: name }));
    setSetupStep("attributes");
  };

  // Handler to save attributes, create founder, and start the game
  const handleAttributesSubmit = (attributes: TeamMemberAttributes) => {
    const founder: TeamMember = {
      id: uuidv4(),
      type: 'founder', // Assign a specific type 'founder'
      attributes: attributes,
    };
    setGameState(prevState => ({
      ...prevState,
      team: {
        ...prevState.team,
        founder: founder,
      },
    }));
    // Recalculate initial valuation *after* founder is added
    setGameState(currentState => ({
        ...currentState,
        valuation: calculateValuation(currentState)
    }));
    setSetupStep("complete"); // Mark setup as complete
  };

  // Calculate monthly burn rate
  const calculateBurnRate = (state: GameState = gameState) => { // Allow passing state for calculation
    // Assuming these costs are per month now
    const founderBurn = state.team.founder ? 1500 : 0; // Founder monthly cost (Keep this separate or add to costs.ts? For now, separate)
    // Use TEAM_MEMBER_MONTHLY_COSTS
    const teamBurn = (
        state.team.engineers.length * TEAM_MEMBER_MONTHLY_COSTS.engineer +
        state.team.designers.length * TEAM_MEMBER_MONTHLY_COSTS.designer +
        state.team.marketers.length * TEAM_MEMBER_MONTHLY_COSTS.marketer
    );
    const assetBurn = state.assets.servers * 200; // Server monthly cost (Consider moving to costs.ts as well)
    const userBurn = state.users * 0.05; // Per-user monthly cost
    // Include recurring action monthly costs
    return founderBurn + teamBurn + assetBurn + userBurn + state.recurringActionMonthlyCost; // Use monthly cost field
  }

  // Calculate company valuation (Unaffected by timescale)
  const calculateValuation = (state: GameState = gameState) => {
    const userValue = state.users * 10
    const founderValue = state.team.founder ? 25000 : 0;
    const teamValue = (
        state.team.engineers.length * 20000 +
        state.team.designers.length * 15000 +
        state.team.marketers.length * 12000
    );
    const assetValue = (
        state.assets.servers * 8000 +
        state.assets.patents * 50000
    );
    const growthBonus = state.activeRecurringActions.length * 5000;
    return userValue + founderValue + teamValue + assetValue + growthBonus;
  }

  // Handle next month action
  const nextMonth = () => {
    if (gameState.gameOver) return

    const burnRate = calculateBurnRate(gameState)
    const monthlyRevenue = gameState.users * gameState.mrrPerUser // Use MRR per user
    let newCash = gameState.cash - burnRate + monthlyRevenue

    if (newCash <= 0) {
      setGameState({
        ...gameState,
        cash: 0,
        gameOver: true,
        events: [...gameState.events, { month: gameState.month, type: "negative", message: "OUT OF CASH! GAME OVER" }], // Use month
      })
      return
    }

    // Organic user growth calculation (Interpret factors as monthly)
    const teamGrowthFactor = gameState.team.engineers.length * 0.05 + gameState.team.marketers.length * 0.1;
    const assetGrowthFactor = gameState.assets.servers * 0.02;
    const baseGrowthRate = 1; // Base rate (no decline/growth)
    const totalGrowthRate = baseGrowthRate + teamGrowthFactor + assetGrowthFactor;
    let newUsers = Math.floor(gameState.users * totalGrowthRate) // Apply monthly growth rate

    // Growth from recurring actions
    let recurringUserGrowth = 0;
    let recurringEvents: GameEvent[] = [];
    gameState.activeRecurringActions.forEach(actionId => {
        const action = RECURRING_ACTIONS.find(a => a.id === actionId);
        if (action) {
            const monthlyEffect = action.monthlyEffect(gameState); // Use monthlyEffect
            recurringUserGrowth += monthlyEffect.userIncrease;
            recurringEvents.push({
                month: gameState.month + 1, // Use next month
                type: "info",
                message: `${action.name} added ${monthlyEffect.userIncrease.toLocaleString()} users this month.`
            });
        }
    });
    newUsers += recurringUserGrowth;

    const newValuation = calculateValuation({ ...gameState, users: newUsers });

    let updatedState: GameState = {
      ...gameState,
      month: gameState.month + 1, // Increment month
      cash: newCash,
      valuation: newValuation,
      users: newUsers,
      events: [...gameState.events, ...recurringEvents],
    }

    // Check for random event AFTER monthly updates
    if (Math.random() < 0.2) { // Keep event trigger chance (per month now)
      const randomEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]

      let eventApplicable = true;
      if (randomEvent.id === 'outage' && updatedState.assets.servers === 0) {
          eventApplicable = false;
      }
      // Add more checks if needed

      if (eventApplicable) {
        setCurrentEventImpact(null); // Clear previous impact first
        setAcquisitionOfferAmount(null); // Clear previous offer

        if (randomEvent.id === "acquisition") {
          // Handle acquisition offer
          const offerMultiplier = 2 + Math.random();
          const offerAmount = Math.floor(calculateValuation(updatedState) * offerMultiplier);
          setAcquisitionOfferAmount(offerAmount);
          setCurrentEvent(randomEvent); // Set event to trigger dialog
          // Don't apply effect or add event message yet
        } else {
          // Handle regular event
          const stateBeforeEffect = { ...updatedState }; // Capture state before
          const valuationBeforeEffect = calculateValuation(stateBeforeEffect);

          const stateAfterEffect = randomEvent.effect(updatedState); // Apply effect
          const valuationAfterEffect = calculateValuation(stateAfterEffect); // Calculate valuation AFTER effect

          // Calculate changes
          const cashChange = stateAfterEffect.cash - stateBeforeEffect.cash;
          const userChange = stateAfterEffect.users - stateBeforeEffect.users;
          const valuationChange = valuationAfterEffect - valuationBeforeEffect;
          const mrrPerUserChange = stateAfterEffect.mrrPerUser - stateBeforeEffect.mrrPerUser; // Use mrrPerUser

          // Create impact message
          let impactParts: string[] = [];
          if (cashChange !== 0) impactParts.push(`Cash: ${cashChange > 0 ? '+' : ''}${cashChange.toLocaleString()}`);
          if (userChange !== 0) impactParts.push(`Users: ${userChange > 0 ? '+' : ''}${userChange.toLocaleString()}`);
          if (mrrPerUserChange !== 0) impactParts.push(`MRR/User: ${mrrPerUserChange > 0 ? '+' : ''}${mrrPerUserChange.toFixed(2)}`); // Use MRR/User
          if (valuationChange !== 0) impactParts.push(`Valuation: ${valuationChange > 0 ? '+' : ''}${valuationChange.toLocaleString()}`);
          const impactMessage = impactParts.length > 0 ? impactParts.join(', ') : "No immediate numerical change.";


          // Set state for the dialog
          setCurrentEvent(randomEvent);
          setCurrentEventImpact({
              cashChange,
              userChange,
              valuationChange,
              mrrPerUserChange, // Use mrrPerUserChange
              message: impactMessage
          });

          // Update the main game state with the result of the event
          // Event effects already add their own message to stateAfterEffect.events
          updatedState = {
              ...stateAfterEffect,
              valuation: valuationAfterEffect // Ensure valuation is the updated one
          };

           // Event log message is added within the event effect itself now
        }
      }
    } // End of random event check block

    setGameState(updatedState) // Update state with monthly changes & event effects
  }

  // Handle hiring team members
  const hireTeamMember = (memberToHire: TeamMember) => {
    if (gameState.gameOver) return;

    if (memberToHire.type === 'founder') {
        console.error("Cannot hire a founder using this function.");
        setGameState((prevState) => ({
            ...prevState,
            events: [...prevState.events, { month: prevState.month, type: "negative", message: "Internal error: Cannot hire founder." }], // Use month
        }));
        return;
    }

    // No upfront cost deduction or check
    // const hirableType = memberToHire.type as Exclude<TeamMemberType, 'founder'>;
    // const cost = TEAM_MEMBER_MONTHLY_COSTS[hirableType]; // No longer needed for upfront cost
    const memberName = memberToHire.type.charAt(0).toUpperCase() + memberToHire.type.slice(1);

    // Remove cash check
    /*
    if (gameState.cash < cost) {
      setGameState((prevState) => ({
        ...prevState,
        events: [
          ...prevState.events,
          { month: prevState.month, type: "negative", message: `Not enough cash to hire ${memberName}!` }, // Use month
        ],
      }));
      return;
    }
    */

    setGameState((prevState) => {
      const teamArrayKey = (memberToHire.type + "s") as keyof Pick<TeamMembers, 'engineers' | 'designers' | 'marketers'>;
      const existingArray = prevState.team[teamArrayKey] as TeamMember[];
      const newTeamArray = [...existingArray, memberToHire];

      const newTeam = {
        ...prevState.team,
        [teamArrayKey]: newTeamArray,
      };

      // No cash deduction: prevState.cash - cost
      const newState = {
        ...prevState,
        // cash: prevState.cash - cost, // REMOVED
        team: newTeam,
        valuation: calculateValuation({ ...prevState, team: newTeam }), // Valuation might change slightly if it depended on cash previously, but it primarily depends on team composition
        events: [
          ...prevState.events,
          // Updated message - no cost mentioned, focus on burn rate increase
          { month: prevState.month, type: "info" as GameEvent['type'], message: `Hired ${memberName} (ID: ${memberToHire.id.substring(0, 6)}). Monthly cost will increase.` }, // Use month
        ],
      };
      // Note: Burn rate will automatically be higher next month due to calculateBurnRate using the updated team count.
      return newState;
    });
  }

  // Handle buying assets (servers, patents)
  const buyAsset = (assetType: AssetType) => {
    if (gameState.gameOver) return;
    const price = ASSET_PRICES[assetType];
    const assetName = assetType.charAt(0).toUpperCase() + assetType.slice(1)

    if (gameState.cash < price) {
      setGameState((prevState) => ({
        ...prevState,
        events: [
          ...prevState.events,
          { month: prevState.month, type: "negative", message: `Not enough cash to acquire ${assetName}!` }, // Use month
        ],
      }))
      return
    }

    setGameState((prevState) => {
       const newAssets = {
         ...prevState.assets,
         [(assetType + "s") as keyof Assets]: prevState.assets[(assetType + "s") as keyof Assets] + 1,
       };
       const newState = {
            ...prevState,
            cash: prevState.cash - price,
            assets: newAssets,
            valuation: calculateValuation({...prevState, assets: newAssets }),
            events: [
                ...prevState.events,
                { month: prevState.month, type: "info" as GameEvent['type'], message: `Acquired ${assetName} for $${price.toLocaleString()}` }, // Use month
            ],
       };
       return newState;
    })
  }

  // Handle executing a one-time Growth Action
  const executeGrowthAction = (actionId: string) => {
    if (gameState.gameOver) return;
    const action = GROWTH_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    if (gameState.cash < action.cost) {
       setGameState((prevState) => ({
        ...prevState,
        events: [
          ...prevState.events,
          { month: prevState.month, type: "negative", message: `Not enough cash for ${action.name} ($${action.cost.toLocaleString()} required)` }, // Use month
        ],
      }));
      return;
    }

    // Deduct cost and execute action
    setGameState((prevState) => {
        const stateAfterCost = { ...prevState, cash: prevState.cash - action.cost };
        const finalState = action.execute(stateAfterCost); // Action effect might add its own event with month
        // Recalculate valuation after potential user changes
        return {
            ...finalState,
            valuation: calculateValuation(finalState),
            events: [ // Add cost event *before* action result event
             ...prevState.events, // Keep original events
             { month: prevState.month, type: "info" as GameEvent['type'], message: `Spent $${action.cost.toLocaleString()} on ${action.name}.` }, // Use month
             ...finalState.events.slice(prevState.events.length) // Add only the new events from the action
            ]
        };
    });
  }

 // Handle toggling a Recurring Action
 const toggleRecurringAction = (actionId: string) => {
    if (gameState.gameOver) return;
    const action = RECURRING_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    const isActive = gameState.activeRecurringActions.includes(actionId);
    let newCash = gameState.cash;
    let setupCostEvent: GameEvent | null = null;

    if (!isActive) { // Activating
        const cost = action.setupCost ?? 0;
        if (gameState.cash < cost) {
            setGameState((prevState) => ({
                ...prevState,
                events: [
                    ...prevState.events,
                    { month: prevState.month, type: "negative", message: `Not enough cash for ${action.name} setup ($${cost.toLocaleString()} required)` }, // Use month
                ],
            }));
            return;
        }
        newCash -= cost;
        if (cost > 0) {
           setupCostEvent = { month: gameState.month, type: "info" as GameEvent['type'], message: `Paid $${cost.toLocaleString()} setup cost for ${action.name}.` }; // Use month
        }
    }

    setGameState((prevState) => {
        const newActiveActions = isActive
            ? prevState.activeRecurringActions.filter(id => id !== actionId)
            : [...prevState.activeRecurringActions, actionId];

        // Calculate new total *monthly* cost from recurring actions
        const newRecurringMonthlyCost = newActiveActions.reduce((total, id) => {
            const act = RECURRING_ACTIONS.find(a => a.id === id);
            return total + (act?.monthlyCost ?? 0); // Use monthlyCost
        }, 0);

        const toggleEvent: GameEvent = {
            month: prevState.month, // Use month
            type: "info" as GameEvent['type'],
            message: isActive ? `Stopped ${action.name}.` : `Started ${action.name}.`
        };

        const allNewEvents = [
             ...prevState.events,
             ...(setupCostEvent ? [setupCostEvent] : []), // Add setup cost event if applicable
             toggleEvent
            ];

        return {
            ...prevState,
            cash: newCash,
            activeRecurringActions: newActiveActions,
            recurringActionMonthlyCost: newRecurringMonthlyCost, // Set the new monthly cost state
            events: allNewEvents,
            valuation: calculateValuation({...prevState, activeRecurringActions: newActiveActions}),
        };
    });
 }

  // Handle acquisition offer
  const handleAcquisitionOffer = (accept: boolean) => {
    const offerAmount = acquisitionOfferAmount ?? 0;
    let finalEvents = [...gameState.events];

    if (accept) {
      finalEvents.push({
          month: gameState.month, // Use month
          type: "positive" as GameEvent['type'],
          message: `ACQUIRED! Sold for $${offerAmount.toLocaleString()} (Valuation: $${gameState.valuation.toLocaleString()})`,
      });
      setGameState((prevState) => ({
        ...prevState,
        cash: prevState.cash + offerAmount,
        gameOver: true,
        events: finalEvents,
      }));
    } else {
      finalEvents.push({
          month: gameState.month, // Use month
          type: "info" as GameEvent['type'],
          message: "Declined acquisition offer",
      });
      setGameState((prevState) => ({
        ...prevState,
        events: finalEvents,
      }));
    }

    setCurrentEvent(null);
    setAcquisitionOfferAmount(null);
    setCurrentEventImpact(null);
  }

  // Reset game
  const resetGame = () => {
    setGameState(INITIAL_STATE) // Resets to initial state which uses month, mrrPerUser etc.
    setCurrentEvent(null)
    setCurrentEventImpact(null);
    setAcquisitionOfferAmount(null);
    setSetupStep("start");
    setPlayerAttributes(null);
  }

  // Need to also clear impact when the dialog is closed via onClose
  const handleDialogClose = () => {
      setCurrentEvent(null);
      setCurrentEventImpact(null);
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Conditional Rendering based on setupStep */}
      {setupStep === "start" && (
        <StartScreen onStartGame={handleStartGame} />
      )}

      {setupStep === "name" && (
        <NameInput onSubmitName={handleNameSubmit} />
      )}

      {setupStep === "attributes" && (
        <AttributeAllocator onSubmitAttributes={handleAttributesSubmit} totalPoints={25} />
      )}

      {setupStep === "complete" && (
        // Render the main game UI only when setup is complete
        <>
          <div className="flex flex-col space-y-6">
            <GameHeader title={`🚀 ${gameState.playerName}'s Startup`} />

            <div className="absolute top-6 right-6">
              <ModeToggle />
            </div>

            {/* GameStats component now receives state with month, mrrPerUser etc. */}
            <GameStats
              gameState={gameState}
              calculateBurnRate={() => calculateBurnRate(gameState)}
            />

            {/* Next Month Button */}
            {!gameState.gameOver && (
              <div className="flex justify-end mt-4">
                <Button onClick={nextMonth} size="lg"> {/* Changed onClick to nextMonth */}
                  Next Month ({gameState.month}) {/* Changed text to Next Month */}
                </Button>
              </div>
            )}

            {/* Main Game Interface - Components receive updated gameState and recurringActions */}
            <MainTabs
              gameState={gameState}
              hiringCosts={TEAM_MEMBER_MONTHLY_COSTS}
              assetPrices={ASSET_PRICES}
              hireTeamMember={hireTeamMember}
              buyAsset={buyAsset}
              resetGame={resetGame}
              growthActions={GROWTH_ACTIONS}
              recurringActions={RECURRING_ACTIONS}
              executeGrowthAction={executeGrowthAction}
              toggleRecurringAction={toggleRecurringAction}
              calculateBurnRate={() => calculateBurnRate(gameState)}
            />

            {/* Game Over Screen - receives updated gameState */}
            {gameState.gameOver && (
              <GameOverScreen gameState={gameState} resetGame={resetGame} />
            )}

            {/* Event Dialog - receives updated gameState, eventImpact etc */}
            <EventDialog
              currentEvent={currentEvent}
              eventImpact={currentEventImpact}
              acquisitionOfferAmount={acquisitionOfferAmount}
              gameStateValuation={gameState.valuation}
              onClose={handleDialogClose}
              onAcquisitionDecision={handleAcquisitionOffer}
            />

          </div>
        </>
      )}
    </div>
  )
}
