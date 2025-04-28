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
  cash: 10000,
  valuation: 0,
  users: 0,
  mrrPerUser: 10,
  team: {
    engineers: [],
    designers: [],
    marketers: [],
    founder: null,
  },
  assets: {
    infraLevel: 0,
    patents: 0,
  },
  events: [],
  gameOver: false,
  activeRecurringActions: [],
  recurringActionMonthlyCost: 0,
  playerName: "",
  isAdvancingMonth: false,
} 