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
  HiringCosts,
  AssetPrices,
  RandomEvent,
  GrowthAction,
  RecurringAction,
  TeamMemberAttributes,
  TeamMember,
  EventImpact // Import EventImpact
} from "@/app/types";

// Import new components
import { GameHeader } from "@/components/game/game-header";
import { GameStats } from "@/components/game/game-stats";
import { GameOverScreen } from "@/components/game/game-over-screen";
import { MainTabs } from "@/components/game/main-tabs";
import { Button } from "@/components/ui/button";
import { EventDialog } from '@/components/game/event-dialog';
import { RANDOM_EVENTS } from "@/data/game/random-events"; // Import RANDOM_EVENTS
import { INITIAL_STATE } from "@/data/game/initial-state"; // Import INITIAL_STATE
import { GROWTH_ACTIONS } from "@/data/game/growth-actions"; // Import GROWTH_ACTIONS
import { RECURRING_ACTIONS } from "@/data/game/recurring-actions"; // Import RECURRING_ACTIONS
import { HIRING_COSTS, ASSET_PRICES } from "@/data/game/costs"; // Import costs

// Game constants

// Helper to generate random attributes
// const generateAttributes = (base: Partial<TeamMemberAttributes> = {}): TeamMemberAttributes => {
//   const randomStat = () => Math.floor(Math.random() * 8) + 1; // 1-8
//   return {
//     coding: base.coding ?? randomStat(),
//     design: base.design ?? randomStat(),
//     marketing: base.marketing ?? randomStat(),
//     communication: base.communication ?? randomStat(),
//     problemSolving: base.problemSolving ?? randomStat(),
//   };
// };

// const INITIAL_STATE: GameState = {
//   day: 1,
//   cash: 50000,
//   valuation: 0,
//   users: 100,
//   revenuePerUser: 0.2,
//   team: {
//     engineers: [
//       {
//         id: uuidv4(),
//         type: 'engineer',
//         attributes: generateAttributes({ coding: 5, problemSolving: 4 }),
//       }
//     ],
//     designers: [],
//     marketers: [],
//   },
//   assets: {
//     servers: 1,
//     patents: 0,
//   },
//   events: [],
//   gameOver: false,
//   activeRecurringActions: [],
//   recurringActionDailyCost: 0,
// }

// Random events that can occur
// const RANDOM_EVENTS: RandomEvent[] = [...]
// [Entire RANDOM_EVENTS array definition removed]

// Define Growth Actions
// const GROWTH_ACTIONS: GrowthAction[] = [...]
// [Entire GROWTH_ACTIONS array definition removed]

// Define Recurring Actions
// const RECURRING_ACTIONS: RecurringAction[] = [...]
// [Entire RECURRING_ACTIONS array definition removed]

// Market prices -> Split into Hiring Costs and Asset Prices
// const getHiringCosts = (): HiringCosts => {
//   // Dynamic costs could be added later
//   return {
//     engineer: 10000,
//     designer: 8000,
//     marketer: 7000,
//   };
// }
//
// const getAssetPrices = (): AssetPrices => {
//   // Dynamic costs could be added later
//   return {
//     server: 5000,
//     patent: 25000,
//   };
// }

export default function StartupWars() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null)
  const [currentEventImpact, setCurrentEventImpact] = useState<EventImpact | null>(null); // New state for impact
  const [acquisitionOfferAmount, setAcquisitionOfferAmount] = useState<number | null>(null);

  // Calculate daily burn rate (Updated)
  const calculateBurnRate = (state: GameState = gameState) => { // Allow passing state for calculation
    // const assetBurn = (
    //   state.assets.engineers * 1000 +
    //   state.assets.designers * 800 +
    //   state.assets.marketers * 700 +
    //   state.assets.servers * 200
    // );
    const teamBurn = (
        state.team.engineers.length * 1000 +
        state.team.designers.length * 800 +
        state.team.marketers.length * 700
    );
    const assetBurn = state.assets.servers * 200; // Only servers have ongoing cost here
    const userBurn = state.users * 0.05; // Decreased from 0.5 // Add per-user cost
    // Include recurring action costs
    // return assetBurn + userBurn + state.recurringActionDailyCost;
    return teamBurn + assetBurn + userBurn + state.recurringActionDailyCost;
  }

  // Calculate company valuation
  const calculateValuation = (state: GameState = gameState) => {
    const userValue = state.users * 10
    // const assetValue =
    //   state.assets.engineers * 20000 +
    //   state.assets.designers * 15000 +
    //   state.assets.marketers * 12000 +
    //   state.assets.servers * 8000 +
    //   state.assets.patents * 50000
    const teamValue = (
        state.team.engineers.length * 20000 +
        state.team.designers.length * 15000 +
        state.team.marketers.length * 12000
    );
    const assetValue = (
        state.assets.servers * 8000 +
        state.assets.patents * 50000
    );

    // Small bonus for active growth strategies
    const growthBonus = state.activeRecurringActions.length * 5000;

    // return userValue + assetValue + growthBonus;
    return userValue + teamValue + assetValue + growthBonus;
  }

  // Handle next day action (Updated for Dialog)
  const nextDay = () => {
    if (gameState.gameOver) return

    const burnRate = calculateBurnRate(gameState)
    const dailyRevenue = gameState.users * gameState.revenuePerUser
    let newCash = gameState.cash - burnRate + dailyRevenue

    if (newCash <= 0) {
      setGameState({
        ...gameState,
        cash: 0,
        gameOver: true,
        events: [...gameState.events, { day: gameState.day, type: "negative", message: "OUT OF CASH! GAME OVER" }],
      })
      return
    }

    // const assetGrowthRate =
    //   1 + gameState.assets.engineers * 0.05 + gameState.assets.marketers * 0.1 + gameState.assets.servers * 0.02
    const teamGrowthFactor = gameState.team.engineers.length * 0.05 + gameState.team.marketers.length * 0.1;
    const assetGrowthFactor = gameState.assets.servers * 0.02;
    const baseGrowthRate = 1;
    const totalGrowthRate = baseGrowthRate + teamGrowthFactor + assetGrowthFactor;

    // let newUsers = Math.floor(gameState.users * assetGrowthRate)
    let newUsers = Math.floor(gameState.users * totalGrowthRate)

    let recurringUserGrowth = 0;
    let recurringEvents: GameEvent[] = [];
    gameState.activeRecurringActions.forEach(actionId => {
        const action = RECURRING_ACTIONS.find(a => a.id === actionId);
        if (action) {
            const dailyEffect = action.dailyEffect(gameState);
            recurringUserGrowth += dailyEffect.userIncrease;
            recurringEvents.push({
                day: gameState.day + 1,
                type: "info",
                message: `${action.name} added ${dailyEffect.userIncrease.toLocaleString()} users.`
            });
        }
    });
    newUsers += recurringUserGrowth;

    const newValuation = calculateValuation({ ...gameState, users: newUsers });

    let updatedState: GameState = {
      ...gameState,
      day: gameState.day + 1,
      cash: newCash,
      valuation: newValuation,
      users: newUsers,
      events: [...gameState.events, ...recurringEvents],
    }

    // Check for random event AFTER daily updates
    if (Math.random() < 0.2) { // Keep event trigger chance
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
          const revenuePerUserChange = stateAfterEffect.revenuePerUser - stateBeforeEffect.revenuePerUser;

          // Create impact message
          let impactParts: string[] = [];
          if (cashChange !== 0) impactParts.push(`Cash: ${cashChange > 0 ? '+' : ''}${cashChange.toLocaleString()}`);
          if (userChange !== 0) impactParts.push(`Users: ${userChange > 0 ? '+' : ''}${userChange.toLocaleString()}`);
          if (revenuePerUserChange !== 0) impactParts.push(`Rev/User: ${revenuePerUserChange > 0 ? '+' : ''}${revenuePerUserChange.toFixed(2)}`);
          if (valuationChange !== 0) impactParts.push(`Valuation: ${valuationChange > 0 ? '+' : ''}${valuationChange.toLocaleString()}`);
          const impactMessage = impactParts.length > 0 ? impactParts.join(', ') : "No immediate numerical change.";


          // Set state for the dialog
          setCurrentEvent(randomEvent);
          setCurrentEventImpact({
              cashChange,
              userChange,
              valuationChange,
              revenuePerUserChange,
              message: impactMessage
          });

          // Update the main game state with the result of the event
          updatedState = {
              ...stateAfterEffect,
              valuation: valuationAfterEffect // Ensure valuation is the updated one
          };

           // Add the standard event log message (using the event's description for context)
           updatedState.events = [
               ...updatedState.events,
               { day: updatedState.day, type: "info" as GameEvent['type'], message: randomEvent.description }
           ];
        }
      }
    } // End of random event check block

    // Recalculation of valuation outside the event block is removed as it's handled within now.

    setGameState(updatedState) // Update state with daily changes & event effects
  }

  // Handle hiring team members (Updated to accept specific member)
  const hireTeamMember = (memberToHire: TeamMember) => {
    if (gameState.gameOver) return;
    // const costs = getHiringCosts();
    const cost = HIRING_COSTS[memberToHire.type]; // Use imported costs
    const memberName = memberToHire.type.charAt(0).toUpperCase() + memberToHire.type.slice(1);

    if (gameState.cash < cost) {
      setGameState((prevState) => ({
        ...prevState,
        events: [
          ...prevState.events,
          { day: prevState.day, type: "negative", message: `Not enough cash to hire ${memberName}!` },
        ],
      }));
      return;
    }

    setGameState((prevState) => {
      // Add the specific member to the correct array
      const teamArrayKey = (memberToHire.type + "s") as keyof TeamMembers;
      const newTeamArray = [...prevState.team[teamArrayKey], memberToHire];

      const newTeam = {
        ...prevState.team,
        [teamArrayKey]: newTeamArray,
      };

      const newState = {
        ...prevState,
        cash: prevState.cash - cost,
        team: newTeam,
        valuation: calculateValuation({ ...prevState, team: newTeam }), // Recalculate valuation
        events: [
          ...prevState.events,
          { day: prevState.day, type: "info" as GameEvent['type'], message: `Hired ${memberName} (ID: ${memberToHire.id.substring(0, 6)}) for $${cost.toLocaleString()}` }, // Added ID substring for clarity
        ],
      };
      return newState;
    });
  }

  // Handle buying assets (servers, patents)
  const buyAsset = (assetType: AssetType) => {
    if (gameState.gameOver) return;
    // const prices = getAssetPrices()
    const price = ASSET_PRICES[assetType]; // Use imported prices
    const assetName = assetType.charAt(0).toUpperCase() + assetType.slice(1)

    if (gameState.cash < price) {
      setGameState((prevState) => ({
        ...prevState,
        events: [
          ...prevState.events,
          { day: prevState.day, type: "negative", message: `Not enough cash to acquire ${assetName}!` },
        ],
      }))
      return
    }

    setGameState((prevState) => {
       const newAssets = {
         ...prevState.assets,
         // [(assetType + "s") as keyof GameAssets]: prevState.assets[(assetType + "s") as keyof GameAssets] + 1,
         [(assetType + "s") as keyof Assets]: prevState.assets[(assetType + "s") as keyof Assets] + 1,
       };
       const newState = {
            ...prevState,
            cash: prevState.cash - price,
            assets: newAssets,
            // Recalculate valuation immediately after asset change
            // valuation: calculateValuation({...prevState, assets: newAssets}),
            valuation: calculateValuation({...prevState, assets: newAssets }), // Use updated state
            events: [
                ...prevState.events,
                { day: prevState.day, type: "info" as GameEvent['type'], message: `Acquired ${assetName} for $${price.toLocaleString()}` },
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
          { day: prevState.day, type: "negative", message: `Not enough cash for ${action.name} ($${action.cost.toLocaleString()} required)` },
        ],
      }));
      return;
    }

    // Deduct cost and execute action
    setGameState((prevState) => {
        const stateAfterCost = { ...prevState, cash: prevState.cash - action.cost };
        const finalState = action.execute(stateAfterCost);
        // Recalculate valuation after potential user changes
        return {
            ...finalState,
            valuation: calculateValuation(finalState),
            events: [ // Add cost event *before* action result event
             ...prevState.events, // Keep original events
             { day: prevState.day, type: "info" as GameEvent['type'], message: `Spent $${action.cost.toLocaleString()} on ${action.name}.` },
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
                    { day: prevState.day, type: "negative", message: `Not enough cash for ${action.name} setup ($${cost.toLocaleString()} required)` },
                ],
            }));
            return;
        }
        newCash -= cost;
        if (cost > 0) {
           setupCostEvent = { day: gameState.day, type: "info" as GameEvent['type'], message: `Paid $${cost.toLocaleString()} setup cost for ${action.name}.` };
        }
    }

    setGameState((prevState) => {
        const newActiveActions = isActive
            ? prevState.activeRecurringActions.filter(id => id !== actionId)
            : [...prevState.activeRecurringActions, actionId];

        const newRecurringCost = newActiveActions.reduce((total, id) => {
            const act = RECURRING_ACTIONS.find(a => a.id === id);
            return total + (act?.dailyCost ?? 0);
        }, 0);

        const toggleEvent: GameEvent = {
            day: prevState.day,
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
            recurringActionDailyCost: newRecurringCost,
            events: allNewEvents,
            // Recalculate valuation (might change slightly if we add bonus later)
            valuation: calculateValuation({...prevState, activeRecurringActions: newActiveActions}),
        };
    });
 }

  // Handle acquisition offer (Now called by EventDialog)
  const handleAcquisitionOffer = (accept: boolean) => {
    const offerAmount = acquisitionOfferAmount ?? 0;
    let finalEvents = [...gameState.events];

    if (accept) {
      finalEvents.push({
          day: gameState.day,
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
          day: gameState.day,
          type: "info" as GameEvent['type'],
          message: "Declined acquisition offer",
      });
      setGameState((prevState) => ({
        ...prevState,
        events: finalEvents,
      }));
    }

    // Close dialog and clear offer/event state
    setCurrentEvent(null);
    setAcquisitionOfferAmount(null);
    setCurrentEventImpact(null); // Clear impact state here too
  }

  // Reset game
  const resetGame = () => {
    setGameState(INITIAL_STATE)
    setCurrentEvent(null)
    setCurrentEventImpact(null); // Clear impact on reset too
    setAcquisitionOfferAmount(null);
  }

  // Need to also clear impact when the dialog is closed via onClose
  const handleDialogClose = () => {
      setCurrentEvent(null);
      setCurrentEventImpact(null);
      // Note: acquisitionOfferAmount is cleared in handleAcquisitionOffer if decision made
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex flex-col space-y-6">
        <GameHeader title="🚀 Startup Wars"/>

        <div className="absolute top-6 right-6">
           <ModeToggle />
        </div>

        <GameStats
          gameState={gameState}
          calculateBurnRate={() => calculateBurnRate(gameState)}
        />

        {/* Next Day Button - Moved outside tabs */}
        {!gameState.gameOver && (
            <div className="flex justify-end mt-4">
                <Button onClick={nextDay} size="lg">
                    Next Day ({gameState.day})
                </Button>
            </div>
        )}

        {/* Main Game Interface */}
        <MainTabs
            gameState={gameState}
            // getHiringCosts={getHiringCosts} // Pass hiring costs getter - REMOVE
            // getAssetPrices={getAssetPrices} // Pass asset prices getter - REMOVE
            hiringCosts={HIRING_COSTS} // Pass imported costs directly
            assetPrices={ASSET_PRICES} // Pass imported prices directly
            hireTeamMember={hireTeamMember} // Pass hiring function
            buyAsset={buyAsset} // Pass updated asset buying function
            resetGame={resetGame}
            growthActions={GROWTH_ACTIONS}
            recurringActions={RECURRING_ACTIONS}
            executeGrowthAction={executeGrowthAction}
            toggleRecurringAction={toggleRecurringAction}
            calculateBurnRate={() => calculateBurnRate(gameState)}
         />

        {/* Game Over Screen */}
        {gameState.gameOver && (
          <GameOverScreen gameState={gameState} resetGame={resetGame} />
        )}

        {/* Event Dialog - Replaced inline Dialog */}
        <EventDialog
          currentEvent={currentEvent}
          eventImpact={currentEventImpact} // Pass impact state
          acquisitionOfferAmount={acquisitionOfferAmount}
          gameStateValuation={gameState.valuation} // Pass valuation
          onClose={handleDialogClose} // Pass the consolidated close handler
          onAcquisitionDecision={handleAcquisitionOffer} // Pass handler
        />

      </div>
    </div>
  )
}
