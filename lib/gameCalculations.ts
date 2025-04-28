import { GameState, TeamMemberMonthlyCosts, AssetPrices } from "@/app/types";

export function calculateValuation(state: GameState): number {
  // SaaS-style: Valuation = ARR (annual recurring revenue) * multiple
  const monthlyRevenue = state.users * state.mrrPerUser;
  const ARR = monthlyRevenue * 12;
  const saasMultiple = 8; // Typical SaaS multiple (can tweak)
  let valuation = ARR * saasMultiple;
  // Small bonus for patents and infra
  valuation += state.assets.patents * 25000;
  valuation += state.assets.infraLevel * 5000; // Each infra level adds more value
  return Math.round(valuation);
}

export function calculateBurnRate(
  state: GameState,
  TEAM_MEMBER_MONTHLY_COSTS: TeamMemberMonthlyCosts
): number {
  // Assuming these costs are per month now
  const founderBurn = state.team.founder ? 1500 : 0; // Founder monthly cost
  const teamBurn = (
    state.team.engineers.length * TEAM_MEMBER_MONTHLY_COSTS.engineer +
    state.team.designers.length * TEAM_MEMBER_MONTHLY_COSTS.designer +
    state.team.marketers.length * TEAM_MEMBER_MONTHLY_COSTS.marketer
  );
  const assetBurn = state.assets.infraLevel * 500; // Each infra level has a higher monthly cost
  // Per-user monthly cost, reduced by infra level
  const infraDiscounts = [1, 0.8, 0.6, 0.4]; // Level 0-3
  const userBurn = state.users * 0.05 * infraDiscounts[state.assets.infraLevel];
  // Include recurring action monthly costs
  return founderBurn + teamBurn + assetBurn + userBurn + state.recurringActionMonthlyCost;
} 