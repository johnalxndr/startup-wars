import { GameState, RecurringAction } from "@/app/types";

// Define Recurring Actions
export const RECURRING_ACTIONS: RecurringAction[] = [
  {
    id: "paid_ads",
    name: "Run Paid Ads",
    description: "Run targeted ads for steady user growth.",
    setupCost: 1000,
    monthlyCost: 7500,
    monthlyEffect: (state: GameState) => {
      const baseGrowth = 1500;
      const marketerBonus = state.team.marketers.length * 300;
      const randomFactor = 0.8 + Math.random() * 0.4;
      return { userIncrease: Math.floor((baseGrowth + marketerBonus) * randomFactor) };
    },
  },
  {
    id: "seo_campaign",
    name: "SEO Campaign",
    description: "Invest in SEO for organic growth. Slower, but compounds.",
    setupCost: 3000,
    monthlyCost: 6000,
    monthlyEffect: (state: GameState) => {
        // Growth depends on # months active & engineers
        const startEvent = state.events.find(e => e.message.includes("Started SEO Campaign"));
        const monthsActive = startEvent ? state.month - startEvent.month + 1 : 1;
        const baseGrowth = Math.log(monthsActive + 1) * 300;
        const engineerBonus = state.team.engineers.length * 60;
        const randomFactor = 0.9 + Math.random() * 0.2;
      return { userIncrease: Math.floor((baseGrowth + engineerBonus) * randomFactor) };
    },
  },
]; 