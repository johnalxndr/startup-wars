import { v4 as uuidv4 } from 'uuid';
import { GameState, TeamMemberAttributes } from "@/app/types";

// Helper to generate random attributes
const generateAttributes = (base: Partial<TeamMemberAttributes> = {}): TeamMemberAttributes => {
  const randomStat = () => Math.floor(Math.random() * 8) + 1; // 1-8
  return {
    coding: base.coding ?? randomStat(),
    design: base.design ?? randomStat(),
    marketing: base.marketing ?? randomStat(),
  };
};

export const INITIAL_STATE: GameState = {
  month: 1,
  cash: 50000,
  valuation: 0,
  users: 100,
  mrrPerUser: 6.0,
  team: {
    engineers: [
      {
        id: uuidv4(),
        type: 'engineer',
        attributes: generateAttributes({ coding: 5 }),
      }
    ],
    designers: [],
    marketers: [],
    founder: null,
  },
  assets: {
    servers: 1,
    patents: 0,
  },
  events: [],
  gameOver: false,
  activeRecurringActions: [],
  recurringActionMonthlyCost: 0,
  playerName: null,
} 