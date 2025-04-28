"use client"

import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs
import { useRouter } from "next/navigation";

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

// Constants
const SETTINGS_KEY = "startupWarsSettings"; // Key for localStorage settings

// Game constants

type SetupStep = "start" | "name" | "attributes" | "complete"; // Define setup steps type

// Helper to generate random attributes - Removed

// INITIAL_STATE moved to data/game/initial-state.ts

// RANDOM_EVENTS moved to data/game/random-events.ts

// GROWTH_ACTIONS moved to data/game/growth-actions.ts

// RECURRING_ACTIONS moved to data/game/recurring-actions.ts

// Costs moved to data/game/costs.ts

import { calculateValuation, calculateBurnRate } from "@/lib/gameCalculations";

export default function StartupWars() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null)
  const [currentEventImpact, setCurrentEventImpact] = useState<EventImpact | null>(null); // Uses updated EventImpact
  const [acquisitionOfferAmount, setAcquisitionOfferAmount] = useState<number | null>(null);
  const [setupStep, setSetupStep] = useState<SetupStep>("start"); // New state for setup flow
  const [playerAttributes, setPlayerAttributes] = useState<TeamMemberAttributes | null>(null); // State for player attributes during setup
  const router = useRouter();

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

  // Handle next month action
  const nextMonth = async () => {
    if (gameState.gameOver) return

    // Set loading state first
    setGameState(prevState => ({
      ...prevState,
      isAdvancingMonth: true
    }));

    try {
      // Create a delay promise for minimum loading time (2 seconds)
      const minDelay = () => new Promise(resolve => setTimeout(resolve, 2000));

      // Define triggerRandomEvent function
      const triggerRandomEvent = async (currentState: GameState): Promise<GameState> => {
        let finalState = currentState;
        let eventToShow: RandomEvent | null = null;
        let impactToShow: EventImpact | null = null;
        let offerToShow: number | null = null;

        const applyStandardEvent = (event: RandomEvent, stateToApply: GameState): GameState => {
          const stateBeforeEffect = { ...stateToApply };
          const valuationBeforeEffect = calculateValuation(stateBeforeEffect);
          const stateAfterEffect = event.effect(stateToApply);
          const valuationAfterEffect = calculateValuation(stateAfterEffect);

          const cashChange = stateAfterEffect.cash - stateBeforeEffect.cash;
          const userChange = stateAfterEffect.users - stateBeforeEffect.users;
          const valuationChange = valuationAfterEffect - valuationBeforeEffect;
          const mrrPerUserChange = stateAfterEffect.mrrPerUser - stateBeforeEffect.mrrPerUser;

          let impactParts: string[] = [];
          if (cashChange !== 0) impactParts.push(`Cash: ${cashChange > 0 ? '+' : ''}${cashChange.toLocaleString()}`);
          if (userChange !== 0) impactParts.push(`Users: ${userChange > 0 ? '+' : ''}${userChange.toLocaleString()}`);
          if (mrrPerUserChange !== 0) impactParts.push(`MRR/User: ${mrrPerUserChange > 0 ? '+' : ''}${mrrPerUserChange.toFixed(2)}`);
          if (valuationChange !== 0) impactParts.push(`Valuation: ${valuationChange > 0 ? '+' : ''}${valuationChange.toLocaleString()}`);
          const impactMessage = impactParts.length > 0 ? impactParts.join(', ') : "No immediate numerical change.";

          impactToShow = { cashChange, userChange, valuationChange, mrrPerUserChange, message: impactMessage };
          return { ...stateAfterEffect, valuation: valuationAfterEffect };
        };

        try {
          const settingsString = localStorage.getItem(SETTINGS_KEY);
          const settings = settingsString ? JSON.parse(settingsString) : { aiEventsEnabled: false };

          if (settings.aiEventsEnabled) {
            console.log("Attempting to generate AI event...");
            try {
              const response = await fetch('/api/generate-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameState: currentState }),
              });

              if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
              }

              const data = await response.json();
              if (data.error) {
                throw new Error(`API returned error: ${data.error} ${data.details || ''}`);
              }

              const aiEvent: RandomEvent = data.event;
              const aiImpact: EventImpact = data.impact;

              console.log("AI Event received:", aiEvent);

              const stateAfterAiEffect = { ...currentState };
              if (aiImpact.cashChange) stateAfterAiEffect.cash += aiImpact.cashChange;
              if (aiImpact.userChange) stateAfterAiEffect.users += aiImpact.userChange;
              if (aiImpact.mrrPerUserChange) stateAfterAiEffect.mrrPerUser += aiImpact.mrrPerUserChange;
              const valuationAfterAiEffect = calculateValuation(stateAfterAiEffect);

              stateAfterAiEffect.events = [
                ...stateAfterAiEffect.events,
                { month: stateAfterAiEffect.month, type: "info", message: `${aiEvent.title}: ${aiImpact.message}` }
              ];

              finalState = { ...stateAfterAiEffect, valuation: valuationAfterAiEffect };
              eventToShow = aiEvent;
              impactToShow = aiImpact;

            } catch (aiError) {
              console.error("Failed to generate or apply AI event, falling back:", aiError);
              const infraSensitiveEvents = ['outage'];
              const outageWeights = [1, 0.7, 0.4, 0.1]; // Level 0-3

              // Filter and weight events
              const weightedEvents = RANDOM_EVENTS.flatMap(event => {
                if (infraSensitiveEvents.includes(event.id)) {
                  // Outage: reduce chance based on infraLevel
                  const weight = outageWeights[currentState.assets.infraLevel] || 0.1;
                  // If weight is 0, event is impossible
                  if (weight <= 0) return [];
                  // Add event multiple times for weighting
                  return Array(Math.round(weight * 10)).fill(event);
                }
                // All other events normal weight
                return [event];
              });
              // Pick a random event from weightedEvents
              const randomEvent = weightedEvents[Math.floor(Math.random() * weightedEvents.length)];
              const hasTeamMembers = currentState.team.engineers.length > 0 || currentState.team.designers.length > 0 || currentState.team.marketers.length > 0;
              if (randomEvent.id !== 'acquisition' && !(randomEvent.id === 'member_quits' && !hasTeamMembers) && !(randomEvent.id === 'outage' && currentState.assets.infraLevel === 0)) {
                finalState = applyStandardEvent(randomEvent, currentState);
                eventToShow = randomEvent;
              }
            }
          } else {
            const infraSensitiveEvents = ['outage'];
            const outageWeights = [1, 0.7, 0.4, 0.1]; // Level 0-3

            // Filter and weight events
            const weightedEvents = RANDOM_EVENTS.flatMap(event => {
              if (infraSensitiveEvents.includes(event.id)) {
                // Outage: reduce chance based on infraLevel
                const weight = outageWeights[currentState.assets.infraLevel] || 0.1;
                // If weight is 0, event is impossible
                if (weight <= 0) return [];
                // Add event multiple times for weighting
                return Array(Math.round(weight * 10)).fill(event);
              }
              // All other events normal weight
              return [event];
            });
            // Pick a random event from weightedEvents
            const randomEvent = weightedEvents[Math.floor(Math.random() * weightedEvents.length)];
            let eventApplicable = true;
            if (randomEvent.id === 'member_quits') {
              const hasTeamMembers = currentState.team.engineers.length > 0 || currentState.team.designers.length > 0 || currentState.team.marketers.length > 0;
              if (!hasTeamMembers) eventApplicable = false;
            }
            if (randomEvent.id === 'outage' && currentState.assets.infraLevel === 0) {
              eventApplicable = false;
            }

            if (eventApplicable) {
              if (randomEvent.id === "acquisition") {
                const offerMultiplier = 2 + Math.random();
                offerToShow = Math.floor(calculateValuation(currentState) * offerMultiplier);
                eventToShow = randomEvent;
              } else {
                finalState = applyStandardEvent(randomEvent, currentState);
                eventToShow = randomEvent;
              }
            }
          }
        } catch (error) {
          console.error("Error processing random event:", error);
        }

        setCurrentEventImpact(impactToShow);
        setAcquisitionOfferAmount(offerToShow);
        setCurrentEvent(eventToShow);

        return finalState;
      };

      // Calculate all state updates
      const calculateStateUpdates = async () => {
        const burnRate = calculateBurnRate(gameState, TEAM_MEMBER_MONTHLY_COSTS)
        const monthlyRevenue = gameState.users * gameState.mrrPerUser
        let newCash = gameState.cash - burnRate + monthlyRevenue

        if (newCash <= 0) {
          const finalState = {
            ...gameState,
            cash: 0,
            gameOver: true,
            isAdvancingMonth: false,
            events: [...gameState.events, { month: gameState.month, type: "negative" as const, message: "OUT OF CASH! GAME OVER" }],
          };
          setGameState(finalState);
          // Store final state for /game-over route
          if (typeof window !== "undefined") {
            sessionStorage.setItem("startupWarsFinalState", JSON.stringify(finalState));
          }
          router.push("/game-over");
          return null;
        }

        const teamGrowthFactor = gameState.team.engineers.length * 0.05 + gameState.team.marketers.length * 0.1;
        const assetGrowthFactor = gameState.assets.infraLevel * 0.05;
        const baseGrowthRate = 1;
        const totalGrowthRate = baseGrowthRate + teamGrowthFactor + assetGrowthFactor;
        let newUsers = Math.floor(gameState.users * totalGrowthRate);
        // Ensure at least 5 new users per month, even if users is 0
        newUsers = Math.max(newUsers, 5);

        let recurringUserGrowth = 0;
        let recurringEvents: GameEvent[] = [];
        gameState.activeRecurringActions.forEach(actionId => {
          const action = RECURRING_ACTIONS.find(a => a.id === actionId);
          if (action) {
            const monthlyEffect = action.monthlyEffect(gameState);
            recurringUserGrowth += monthlyEffect.userIncrease;
            recurringEvents.push({
              month: gameState.month + 1,
              type: "info",
              message: `${action.name} added ${monthlyEffect.userIncrease.toLocaleString()} users this month.`
            });
          }
        });
        newUsers += recurringUserGrowth;

        const newValuation = calculateValuation({ ...gameState, users: newUsers });

        let updatedState: GameState = {
          ...gameState,
          month: gameState.month + 1,
          cash: newCash,
          valuation: newValuation,
          users: newUsers,
          events: [...gameState.events, ...recurringEvents],
        }

        // Check for random event (25% chance)
        if (Math.random() < 0.25) {
          updatedState = await triggerRandomEvent(updatedState);
        } else {
          // Clear any previous event state
          setCurrentEvent(null);
          setCurrentEventImpact(null);
          setAcquisitionOfferAmount(null);
        }

        return updatedState;
      };

      // Wait for both the minimum delay AND state calculations to complete
      const [_, updatedState] = await Promise.all([
        minDelay(),
        calculateStateUpdates()
      ]);

      // Only update the game state if we have a valid state update
      if (updatedState) {
        setGameState({
          ...updatedState,
          isAdvancingMonth: false
        });
        if (updatedState.gameOver) {
          // Store final state for /game-over route
          if (typeof window !== "undefined") {
            sessionStorage.setItem("startupWarsFinalState", JSON.stringify(updatedState));
          }
          router.push("/game-over");
        }
      }

    } catch (error) {
      console.error("Error during month advancement:", error)
      setGameState(prevState => ({
        ...prevState,
        isAdvancingMonth: false,
        events: [...prevState.events, { month: prevState.month, type: "negative", message: "Error advancing month" }]
      }))
    }
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
    if (assetType === "infra") {
      const currentLevel = gameState.assets.infraLevel;
      if (currentLevel >= 3) return; // Max level
      const price = ASSET_PRICES.infra[currentLevel];
      if (gameState.cash < price) {
        setGameState((prevState) => ({
          ...prevState,
          events: [
            ...prevState.events,
            { month: prevState.month, type: "negative", message: `Not enough cash to upgrade Infrastructure!` },
          ],
        }));
        return;
      }
      setGameState((prevState) => {
        const newLevel = prevState.assets.infraLevel + 1;
        const newAssets = {
          ...prevState.assets,
          infraLevel: newLevel,
        };
        return {
          ...prevState,
          cash: prevState.cash - price,
          assets: newAssets,
          valuation: calculateValuation({ ...prevState, assets: newAssets }),
          events: [
            ...prevState.events,
            { month: prevState.month, type: "info", message: `Upgraded Infrastructure to Level ${newLevel} for $${price.toLocaleString()}` },
          ],
        };
      });
      return;
    }
    // Patent logic unchanged
    const price = ASSET_PRICES[assetType];
    const assetName = assetType.charAt(0).toUpperCase() + assetType.slice(1);
    if (gameState.cash < price) {
      setGameState((prevState) => ({
        ...prevState,
        events: [
          ...prevState.events,
          { month: prevState.month, type: "negative", message: `Not enough cash to acquire ${assetName}!` },
        ],
      }));
      return;
    }
    setGameState((prevState) => {
      const newAssets = {
        ...prevState.assets,
        patents: prevState.assets.patents + 1,
      };
      return {
        ...prevState,
        cash: prevState.cash - price,
        assets: newAssets,
        valuation: calculateValuation({ ...prevState, assets: newAssets }),
        events: [
          ...prevState.events,
          { month: prevState.month, type: "info", message: `Acquired ${assetName} for $${price.toLocaleString()}` },
        ],
      };
    });
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
      const finalState = {
        ...gameState,
        cash: gameState.cash + offerAmount,
        gameOver: true,
        events: finalEvents,
      };
      setGameState(finalState);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("startupWarsFinalState", JSON.stringify(finalState));
      }
      router.push("/game-over");
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
    <div className="container mx-auto py-6">
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
              calculateBurnRate={() => calculateBurnRate(gameState, TEAM_MEMBER_MONTHLY_COSTS)}
            />

            {/* Next Month Button */}
            {!gameState.gameOver && (
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={nextMonth} 
                  size="lg"
                  disabled={gameState.isAdvancingMonth}
                >
                  {gameState.isAdvancingMonth ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Advancing...
                    </>
                  ) : (
                    `Next Month (${gameState.month})`
                  )}
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
              calculateBurnRate={() => calculateBurnRate(gameState, TEAM_MEMBER_MONTHLY_COSTS)}
            />

            {/* Event Dialog - receives updated gameState, eventImpact etc */}
            <EventDialog
              currentEvent={currentEvent}
              eventImpact={currentEventImpact}
              acquisitionOfferAmount={acquisitionOfferAmount}
              gameStateValuation={gameState.valuation}
              onClose={handleDialogClose}
              onAcquisitionDecision={handleAcquisitionOffer}
              isAdvancingMonth={gameState.isAdvancingMonth}
            />

          </div>
        </>
      )}
    </div>
  )
}
