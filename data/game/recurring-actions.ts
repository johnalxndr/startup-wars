import { GameState, RecurringAction } from "@/app/types";

// Define Recurring Actions
export const RECURRING_ACTIONS: RecurringAction[] = [
  {
    id: "paid_ads",
    name: "Run Paid Ads",
    description: "Run targeted ads for steady user growth.",
    setupCost: 1000,
    dailyCost: 250,
    dailyEffect: (state: GameState) => {
      const baseGrowth = 50;
      const marketerBonus = state.team.marketers.length * 10;
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
        const engineerBonus = state.team.engineers.length * 2;
        const randomFactor = 0.9 + Math.random() * 0.2; // +/- 10% variance
      return { userIncrease: Math.floor((baseGrowth + engineerBonus) * randomFactor) };
    },
  },
]; 