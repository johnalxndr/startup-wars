import { GameState, GrowthAction, GameEvent } from "@/app/types";

// Define Growth Actions
export const GROWTH_ACTIONS: GrowthAction[] = [
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