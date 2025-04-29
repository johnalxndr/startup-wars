// Type Definitions
export interface GameEvent {
  month: number
  type: "positive" | "negative" | "info" | "special"
  message: string
}

export interface GameAssets {
  engineers: number
  designers: number
  marketers: number
  infraLevel: number // 1-3, replaces servers
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
  monthlyCost: number;
  // Function to calculate the monthly effect (e.g., user increase)
  monthlyEffect: (state: GameState) => { userIncrease: number };
  // Optional one-time setup cost
  setupCost?: number;
}

export interface GameState {
  month: number
  cash: number
  valuation: number
  users: number
  mrrPerUser: number
  team: TeamMembers;
  assets: Assets;
  events: GameEvent[]
  gameOver: boolean
  // New fields
  activeRecurringActions: string[]; // IDs of active recurring actions
  recurringActionMonthlyCost: number; // Total monthly cost from recurring actions
  playerName: string | null; // Added player name
  isAdvancingMonth: boolean; // Add this new field
}

export interface RandomEvent {
  id: string
  title: string
  description: string
  effect: (state: GameState) => GameState
}

export type AssetType = "infra" | "patent";

// Define attributes for team members
export interface TeamMemberAttributes {
  coding: number;
  design: number;
  marketing: number;
}

// Define an individual team member
export interface TeamMember {
  id: string; // Unique identifier for each member
  type: TeamMemberType;
  attributes: TeamMemberAttributes;
  // Could add things like salary, morale later
}

// Updated TeamMembers to hold arrays of individual members AND the founder
export interface TeamMembers {
  founder: TeamMember | null; // Added founder field
  engineers: TeamMember[];
  designers: TeamMember[];
  marketers: TeamMember[];
}

export interface Assets {
  infraLevel: number;
  patents: number;
}

// Renamed from HiringCosts
export interface TeamMemberMonthlyCosts {
  engineer: number;
  designer: number;
  marketer: number;
}

export interface AssetPrices {
  infra: number[]; // Array for each upgrade level, e.g. [5000, 15000, 30000]
  patent: number;
}

export type TeamMemberType = "engineer" | "designer" | "marketer" | "founder";

// --- Component Prop Type Updates ---

// Removed locations, currentLocation, travelTo?
export interface MainTabsProps {
  gameState: GameState;
  hiringCosts: TeamMemberMonthlyCosts;
  assetPrices: AssetPrices;
  hireTeamMember: (member: TeamMember) => void;
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
  hireTeamMember: (member: TeamMember) => void;
  hiringCosts: TeamMemberMonthlyCosts;
}

// Removed currentLocation
export interface ProductTabProps {
  gameState: GameState;
  buyAsset: (assetType: AssetType) => void;
  growthActions: GrowthAction[];
  recurringActions: RecurringAction[];
  executeGrowthAction: (actionId: string) => void;
  toggleRecurringAction: (actionId: string) => void;
  assetPrices: AssetPrices;
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
  prevGameState?: GameState | null;
  calculateBurnRate: () => number;
}

// Define the new interface here or ensure it's imported
export interface EventImpact {
  cashChange?: number;
  userChange?: number;
  valuationChange?: number;
  mrrPerUserChange?: number;
  message: string; // A concise message summarizing the impact
}

// Import new components 