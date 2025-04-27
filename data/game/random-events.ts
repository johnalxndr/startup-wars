import { GameState, RandomEvent } from "@/app/types";

// Random events that can occur
export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: "viral",
    title: "Viral Success!",
    description: "Your app goes viral on TikTok! Users surge by 500%.",
    effect: (state: GameState) => {
      const newUsers = state.users * 5;
      return {
        ...state,
        users: newUsers,
        events: [
          ...state.events,
          { month: state.month, type: "positive", message: `App went viral! Users +${(newUsers - state.users).toLocaleString()} (+500%)` },
        ],
      };
    },
  },
  {
    id: "press",
    title: "Press Coverage",
    description: "Major tech blog writes about your startup.",
    effect: (state: GameState) => {
      const newUserGrowth = Math.floor(state.users * 0.2);
      return {
        ...state,
        users: state.users + newUserGrowth,
        events: [
          ...state.events,
          { month: state.month, type: "positive", message: `Press coverage! Users +${newUserGrowth.toLocaleString()} (+20%)` },
        ],
      };
    },
  },
  {
    id: "outage",
    title: "Server Outage!",
    description: "Your servers crashed during peak usage.",
    effect: (state: GameState) => {
      const userLoss = Math.floor(state.users * 0.3);
      return {
        ...state,
        users: Math.max(0, state.users - userLoss),
        events: [...state.events, { month: state.month, type: "negative", message: `Server outage! Lost ${userLoss.toLocaleString()} users (-30%)` }],
      };
    },
  },
  {
    id: "lawsuit",
    title: "Legal Trouble",
    description: "Ex-employee sues for IP theft.",
    effect: (state: GameState) => ({
      ...state,
      cash: Math.max(0, state.cash - 25000),
      events: [...state.events, { month: state.month, type: "negative", message: "Legal fees! -$25,000" }],
    }),
  },
  {
    id: "acquisition",
    title: "Acquisition Offer",
    description: "A larger company wants to buy you out.",
    effect: (state: GameState) => ({
      ...state,
      events: [...state.events, { month: state.month, type: "special", message: "Received acquisition offer!" }],
      // Special event that will be handled separately in the UI
    }),
  },
  {
    id: "member_quits",
    title: "Team Member Quits!",
    description: "One of your team members has decided to leave the company.",
    effect: (state: GameState) => {
      const availableTypes = (['engineers', 'designers', 'marketers'] as const)
        .filter(type => state.team[type].length > 0);

      if (availableTypes.length === 0) {
        // No one to quit, maybe trigger a less impactful event or nothing?
        // For now, just return the state unchanged, maybe add a less dramatic event log
         return {
            ...state,
            events: [...state.events, { month: state.month, type: "info", message: "Heard resignation rumors, but everyone stayed... this time." }],
        };
      }

      // Select a random team type that has members
      const typeToQuit = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const teamArray = state.team[typeToQuit];

      // Select a random member from that type
      const memberIndexToQuit = Math.floor(Math.random() * teamArray.length);
      const memberWhoQuit = teamArray[memberIndexToQuit];

      // Create the updated team array without the member who quit
      const newTeamArray = [
        ...teamArray.slice(0, memberIndexToQuit),
        ...teamArray.slice(memberIndexToQuit + 1),
      ];

      // Create the new team state
      const newTeam = {
        ...state.team,
        [typeToQuit]: newTeamArray,
      };

      // Format member type for the message
      const memberTypeReadable = typeToQuit.charAt(0).toUpperCase() + typeToQuit.slice(1, -1); // Engineer, Designer, Marketer

      return {
        ...state,
        team: newTeam, // Update the team state
        // Valuation and burn rate will be recalculated based on the new team state
        events: [
          ...state.events,
          {
            month: state.month,
            type: "negative",
            message: `${memberTypeReadable} (ID: ${memberWhoQuit.id.substring(0,6)}) quit! Team size decreased.`
          }
        ],
      };
    },
  },
]; 