"use client"

import { useState } from "react"

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
  RecurringAction
} from "@/app/types";

// Import new components
import { GameHeader } from "@/components/game/game-header";
import { GameStats } from "@/components/game/game-stats";
import { GameOverScreen } from "@/components/game/game-over-screen";
import { MainTabs } from "@/components/game/main-tabs";
import { Button } from "@/components/ui/button";
import { EventDialog } from '@/components/game/event-dialog';

// Game constants

const INITIAL_STATE: GameState = {
  day: 1,
  cash: 50000,
  valuation: 0,
  users: 100,
  revenuePerUser: 0.1,
  team: {
    engineers: 1,
    designers: 0,
    marketers: 0,
  },
  assets: {
    servers: 1,
    patents: 0,
  },
  events: [],
  gameOver: false,
  activeRecurringActions: [],
  recurringActionDailyCost: 0,
}

// Random events that can occur
const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: "viral",
    title: "Viral Success!",
    description: "Your app goes viral on TikTok! Users surge by 500%.",
    effect: (state: GameState) => {
      const newUsers = state.users * 5;
      return {
        ...state,
        users: newUsers,
        events: [
          ...state.events,
          { day: state.day, type: "positive", message: `App went viral! Users +${(newUsers - state.users).toLocaleString()} (+500%)` },
        ],
      };
    },
  },
  {
    id: "press",
    title: "Press Coverage",
    description: "Major tech blog writes about your startup.",
    effect: (state: GameState) => {
      const newUserGrowth = Math.floor(state.users * 0.2);
      return {
        ...state,
        users: state.users + newUserGrowth,
        events: [
          ...state.events,
          { day: state.day, type: "positive", message: `Press coverage! Users +${newUserGrowth.toLocaleString()} (+20%)` },
        ],
      };
    },
  },
  {
    id: "outage",
    title: "Server Outage!",
    description: "Your servers crashed during peak usage.",
    effect: (state: GameState) => {
      const userLoss = Math.floor(state.users * 0.3);
      return {
        ...state,
        users: Math.max(0, state.users - userLoss),
        events: [...state.events, { day: state.day, type: "negative", message: `Server outage! Lost ${userLoss.toLocaleString()} users (-30%)` }],
      };
    },
  },
  {
    id: "lawsuit",
    title: "Legal Trouble",
    description: "Ex-employee sues for IP theft.",
    effect: (state: GameState) => ({
      ...state,
      cash: Math.max(0, state.cash - 25000),
      events: [...state.events, { day: state.day, type: "negative", message: "Legal fees! -$25,000" }],
    }),
  },
  {
    id: "acquisition",
    title: "Acquisition Offer",
    description: "A larger company wants to buy you out.",
    effect: (state: GameState) => ({
      ...state,
      events: [...state.events, { day: state.day, type: "special", message: "Received acquisition offer!" }],
      // Special event that will be handled separately in the UI
    }),
  },
]

// Define Growth Actions
const GROWTH_ACTIONS: GrowthAction[] = [
  {
    id: "product_hunt",
    name: "Product Hunt Launch",
    description: "Launch on Product Hunt for a potential user boost.",
    cost: 5000,
    execute: (state: GameState) => {
      const userGrowthMultiplier = 0.5 + Math.random() * 2; // 50% to 250% growth
      const newUserGrowth = Math.floor(state.users * userGrowthMultiplier);
      return {
        ...state,
        users: state.users + newUserGrowth,
        events: [
          ...state.events,
          { day: state.day, type: "positive", message: `Product Hunt Launch! Users +${newUserGrowth.toLocaleString()} (+${Math.round(userGrowthMultiplier * 100)}%)` }
        ],
      };
    },
  },
  {
    id: "influencer_shoutout",
    name: "Influencer Shoutout",
    description: "Pay an influencer for a mention. Risky, but could pay off.",
    cost: 15000,
    execute: (state: GameState) => {
      const successChance = 0.6; // 60% chance of success
      let newUserGrowth = 0;
      let messageType: GameEvent['type'] = 'negative';
      let messageText = "Influencer Shoutout flopped! No significant user growth.";

      if (Math.random() < successChance) {
        const userGrowthMultiplier = 1 + Math.random() * 3; // 100% to 400% growth
        newUserGrowth = Math.floor(state.users * userGrowthMultiplier);
        messageType = 'positive';
        messageText = `Influencer Shoutout success! Users +${newUserGrowth.toLocaleString()} (+${Math.round(userGrowthMultiplier*100)}%)`;
      }

      return {
        ...state,
        users: state.users + newUserGrowth,
        events: [
          ...state.events,
          { day: state.day, type: messageType, message: messageText }
        ],
      };
    },
  },
];

// Define Recurring Actions
const RECURRING_ACTIONS: RecurringAction[] = [
  {
    id: "paid_ads",
    name: "Run Paid Ads",
    description: "Run targeted ads for steady user growth.",
    setupCost: 1000,
    dailyCost: 500,
    dailyEffect: (state: GameState) => {
      const baseGrowth = 50;
      const marketerBonus = state.team.marketers * 10;
      const randomFactor = 0.8 + Math.random() * 0.4; // +/- 20% variance
      return { userIncrease: Math.floor((baseGrowth + marketerBonus) * randomFactor) };
    },
  },
  {
    id: "seo_campaign",
    name: "SEO Campaign",
    description: "Invest in SEO for organic growth. Slower, but compounds.",
    setupCost: 3000,
    dailyCost: 200,
    dailyEffect: (state: GameState) => {
        // Growth depends on # days active & engineers
        const daysActive = state.events.filter(e => e.message.includes("Started SEO Campaign")).length > 0 ? state.day - state.events.find(e => e.message.includes("Started SEO Campaign"))!.day : 1;
        const baseGrowth = Math.log(daysActive + 1) * 10; // Logarithmic growth over time
        const engineerBonus = state.team.engineers * 2;
        const randomFactor = 0.9 + Math.random() * 0.2; // +/- 10% variance
      return { userIncrease: Math.floor((baseGrowth + engineerBonus) * randomFactor) };
    },
  },
];

// Market prices -> Split into Hiring Costs and Asset Prices
const getHiringCosts = (): HiringCosts => {
  // Dynamic costs could be added later
  return {
    engineer: 10000,
    designer: 8000,
    marketer: 7000,
  };
}

const getAssetPrices = (): AssetPrices => {
  // Dynamic costs could be added later
  return {
    server: 5000,
    patent: 25000,
  };
}

export default function StartupWars() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null)
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
        state.team.engineers * 1000 +
        state.team.designers * 800 +
        state.team.marketers * 700
    );
    const assetBurn = state.assets.servers * 200; // Only servers have ongoing cost here
    const userBurn = state.users * 0.5; // Add per-user cost
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
        state.team.engineers * 20000 +
        state.team.designers * 15000 +
        state.team.marketers * 12000
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
    const teamGrowthFactor = gameState.team.engineers * 0.05 + gameState.team.marketers * 0.1;
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
        if (randomEvent.id === "acquisition") {
          // Calculate and store offer amount, set event for dialog display
          const offerMultiplier = 2 + Math.random();
          const offerAmount = Math.floor(calculateValuation(updatedState) * offerMultiplier);
          setAcquisitionOfferAmount(offerAmount);
          setCurrentEvent(randomEvent); // Set event to trigger dialog
          // Don't apply effect or add event message yet
        } else {
          // Apply effect first for regular events
          const stateAfterEffect = randomEvent.effect(updatedState);
          updatedState = stateAfterEffect; // Update the state
          // Recalculate valuation after event effect
          updatedState.valuation = calculateValuation(updatedState);
          setCurrentEvent(randomEvent); // Set event to trigger dialog *after* effect applied
        }
      }
    }
    // No else block needed to hide offer card

    // Recalculate valuation at the end of the day AFTER potential event effects
    // but before setting state, unless it was an acquisition offer
    if (currentEvent?.id !== 'acquisition') {
       updatedState.valuation = calculateValuation(updatedState);
    }

    setGameState(updatedState) // Update state with daily changes (and event effect if not acquisition)
  }

  // Handle hiring team members
  const hireTeamMember = (memberType: TeamMemberType) => {
    if (gameState.gameOver) return;
    const costs = getHiringCosts();
    const cost = costs[memberType];
    const memberName = memberType.charAt(0).toUpperCase() + memberType.slice(1);

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
      const newTeam = {
        ...prevState.team,
        [(memberType + "s") as keyof TeamMembers]: prevState.team[(memberType + "s") as keyof TeamMembers] + 1,
      };
      const newState = {
        ...prevState,
        cash: prevState.cash - cost,
        team: newTeam,
        valuation: calculateValuation({ ...prevState, team: newTeam }), // Recalculate valuation
        events: [
          ...prevState.events,
          { day: prevState.day, type: "info" as GameEvent['type'], message: `Hired ${memberName} for $${cost.toLocaleString()}` },
        ],
      };
      return newState;
    });
  }

  // Handle buying assets (servers, patents)
  const buyAsset = (assetType: AssetType) => {
    if (gameState.gameOver) return;
    // const prices = getMarketPrices()
    const prices = getAssetPrices() // Use asset prices
    const price = prices[assetType]
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

    // Close dialog and clear offer amount - Now handled via onClose passed to EventDialog
    setCurrentEvent(null);
    setAcquisitionOfferAmount(null);
  }

  // Reset game
  const resetGame = () => {
    setGameState(INITIAL_STATE)
    setCurrentEvent(null)
    setAcquisitionOfferAmount(null);
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex flex-col space-y-6">
        <GameHeader title="🚀 Startup Wars" subtitle="Founder Edition" />

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
            getHiringCosts={getHiringCosts} // Pass hiring costs getter
            getAssetPrices={getAssetPrices} // Pass asset prices getter
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
          acquisitionOfferAmount={acquisitionOfferAmount}
          gameStateValuation={gameState.valuation} // Pass valuation
          onClose={() => setCurrentEvent(null)} // Pass function to close
          onAcquisitionDecision={handleAcquisitionOffer} // Pass handler
        />

      </div>
    </div>
  )
}
