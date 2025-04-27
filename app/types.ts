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

// Define attributes for team members
export interface TeamMemberAttributes {
  coding: number;
  design: number;
  marketing: number;
  communication: number;
  problemSolving: number;
}

// Define an individual team member
export interface TeamMember {
  id: string; // Unique identifier for each member
  type: TeamMemberType;
  attributes: TeamMemberAttributes;
  // Could add things like salary, morale later
}

// Updated TeamMembers to hold arrays of individual members
export interface TeamMembers {
  engineers: TeamMember[];
  designers: TeamMember[];
  marketers: TeamMember[];
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
  hiringCosts: HiringCosts;
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
  hiringCosts: HiringCosts;
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
  calculateBurnRate: () => number;
}

// Define the new interface here or ensure it's imported
export interface EventImpact {
  cashChange?: number;
  userChange?: number;
  valuationChange?: number;
  revenuePerUserChange?: number;
  message: string; // A concise message summarizing the impact
}

// Import new components 