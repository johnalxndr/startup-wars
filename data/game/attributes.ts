import { TeamMemberType, TeamMemberAttributes } from "@/app/types";

// Helper to generate random attributes within a specific range
export const randomStatInRange = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Define attribute ranges for roles
export const attributeRanges: Record<Exclude<TeamMemberType, 'founder'>, { [key in keyof TeamMemberAttributes]: { min: number, max: number } }> = {
    engineer: {
        coding: { min: 6, max: 9 },
        design: { min: 1, max: 4 },
        marketing: { min: 1, max: 3 },
    },
    designer: {
        design: { min: 6, max: 9 },
        coding: { min: 2, max: 5 },
        marketing: { min: 1, max: 4 },
    },
    marketer: {
        marketing: { min: 6, max: 9 },
        design: { min: 1, max: 4 },
        coding: { min: 1, max: 3 },
    }
};

// Generate attributes for a given type
export const generateAttributes = (type: Exclude<TeamMemberType, 'founder'>): TeamMemberAttributes => {
    const ranges = attributeRanges[type];
    return {
        coding: randomStatInRange(ranges.coding.min, ranges.coding.max),
        design: randomStatInRange(ranges.design.min, ranges.design.max),
        marketing: randomStatInRange(ranges.marketing.min, ranges.marketing.max),
    };
}; 