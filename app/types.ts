// Type Definitions
export interface GameEvent {
  day: number
  type: "positive" | "negative" | "info" | "special"
  message: string
}

export interface GameAssets {
  engineers: number
  designers: number
  marketers: number
  servers: number
  patents: number
}

// Represents one-time growth actions
export interface GrowthAction {
  id: string;
  name: string;
  description: string;
  cost: number;
  // Function executed when action is taken, returns the updated state
  execute: (state: GameState) => GameState;
}

// Represents actions with ongoing daily costs and effects
export interface RecurringAction {
  id: string;
  name: string;
  description: string;
  dailyCost: number;
  // Function to calculate the daily effect (e.g., user increase)
  dailyEffect: (state: GameState) => { userIncrease: number };
  // Optional one-time setup cost
  setupCost?: number;
}

export interface GameState {
  day: number
  cash: number
  valuation: number
  users: number
  revenuePerUser: number
  team: TeamMembers;
  assets: Assets;
  events: GameEvent[]
  gameOver: boolean
  // New fields
  activeRecurringActions: string[]; // IDs of active recurring actions
  recurringActionDailyCost: number; // Total daily cost from recurring actions
}

export interface RandomEvent {
  id: string
  title: string
  description: string
  effect: (state: GameState) => GameState
}

export type AssetType = "server" | "patent";

export interface TeamMembers {
  engineers: number;
  designers: number;
  marketers: number;
}

export interface Assets {
  servers: number;
  patents: number;
}

export interface HiringCosts {
  engineer: number;
  designer: number;
  marketer: number;
}

export interface AssetPrices {
  server: number;
  patent: number;
}

export type TeamMemberType = "engineer" | "designer" | "marketer";

// --- Component Prop Type Updates ---

// Removed locations, currentLocation, travelTo?
export interface MainTabsProps {
  gameState: GameState;
  getHiringCosts: () => HiringCosts;
  getAssetPrices: () => AssetPrices;
  hireTeamMember: (memberType: TeamMemberType) => void;
  buyAsset: (assetType: AssetType) => void;
  // travelTo?: (locationId: string) => void; // Keep commented or remove fully
  resetGame: () => void;
  growthActions: GrowthAction[];
  recurringActions: RecurringAction[];
  executeGrowthAction: (actionId: string) => void;
  toggleRecurringAction: (actionId: string) => void;
  calculateBurnRate: () => number;
}

// Removed currentLocation
export interface TeamTabProps {
  gameState: GameState;
  hireTeamMember: (memberType: TeamMemberType) => void;
  getHiringCosts: () => HiringCosts;
}

// Removed currentLocation
export interface ProductTabProps {
  gameState: GameState;
  buyAsset: (assetType: AssetType) => void;
  growthActions: GrowthAction[];
  recurringActions: RecurringAction[];
  executeGrowthAction: (actionId: string) => void;
  toggleRecurringAction: (actionId: string) => void;
  getAssetPrices: () => AssetPrices;
}

// Removed locations, currentLocation, travelTo
export interface GameActionsCardProps {
  gameState: GameState;
  resetGame: () => void;
  // nextDay: () => void; // Removed property
}

// Removed locations, currentLocation
export interface GameStatsProps {
  gameState: GameState;
  calculateBurnRate: () => number;
} 