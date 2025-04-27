import { TeamMemberMonthlyCosts, AssetPrices } from "@/app/types";

// Static costs, assuming they don't need to be dynamically calculated for now

export const TEAM_MEMBER_MONTHLY_COSTS: TeamMemberMonthlyCosts = {
  engineer: 1000,
  designer: 800,
  marketer: 700,
};

export const ASSET_PRICES: AssetPrices = {
  server: 5000,
  patent: 25000,
}; 