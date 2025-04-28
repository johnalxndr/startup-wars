import { TeamMemberMonthlyCosts, AssetPrices } from "@/app/types";

// Static costs, assuming they don't need to be dynamically calculated for now

export const TEAM_MEMBER_MONTHLY_COSTS: TeamMemberMonthlyCosts = {
  engineer: 1000,
  designer: 800,
  marketer: 700,
};

export const ASSET_PRICES: AssetPrices = {
  infra: [2000, 6000, 12000], // Level 1, 2, 3 upgrades (lowered for balance)
  patent: 25000,
}; 