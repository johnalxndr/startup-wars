import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"
import type { RandomEvent, GameState, EventImpact } from "@/app/types"

export async function POST(req: Request) {
  try {
    // Get the game state from the request body
    const { gameState } = (await req.json()) as { gameState: GameState }

    // Instead of using generateObject which is causing issues,
    // we'll use generateText and parse the JSON response
    const prompt = `Generate a random event for a startup simulation game.
    
    Current game state:
    - Month: ${gameState.month}
    - Cash: $${gameState.cash}
    - Users: ${gameState.users}
    - Valuation: $${gameState.valuation}
    - MRR per user: $${gameState.mrrPerUser}
    - Team size: ${gameState.team.engineers.length + gameState.team.designers.length + gameState.team.marketers.length + (gameState.team.founder ? 1 : 0)}
    
    Create a realistic, interesting, and unexpected event that could happen to a startup.
    The event should be contextually appropriate for the current game state.
    
    Ensure a wide variety of event types and impacts. Avoid focusing too heavily on just one category like viral growth or influencer events.
    
    Return a JSON object with the following structure:
    {
      "id": "unique-event-id",
      "title": "Event Title",
      "description": "Detailed event description",
      "impact": {
        "cashChange": number, // Amount of cash gained or lost (can be positive or negative)
        "userChange": number, // Number of users gained or lost (can be positive or negative)
        "valuationChange": number, // Change in company valuation (can be positive or negative)
        "mrrPerUserChange": number, // Change in monthly recurring revenue per user (can be positive or negative)
        "message": "A concise message explaining the impact"
      }
    }
    
    Generate a good mix of positive, negative, and mixed events (with both positive and negative impacts).
    Some events should be major (big impacts) and others should be minor (small impacts).
    
    Event types to consider:
    - Market changes (competitor actions, market trends)
    - Technical issues (server outages, bugs)
    - PR events (good or bad press)
    - Team events (employee performance, morale)
    - Investor interest
    - Customer feedback
    - Regulatory changes
    - Viral growth opportunities
    
    IMPORTANT: Return ONLY the JSON object with no additional text.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.85,
    })

    // Parse the JSON response
    let eventData
    try {
      // Find JSON in the response (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text
      eventData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.log("Raw AI response:", text)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Create a proper RandomEvent object with the effect function
    const randomEvent: RandomEvent = {
      id: eventData.id || `event-${Date.now()}`,
      title: eventData.title,
      description: eventData.description,
      effect: (state: GameState) => {
        // Apply the impacts to the game state
        const newState = { ...state }

        if (eventData.impact.cashChange) {
          newState.cash += eventData.impact.cashChange
        }

        if (eventData.impact.userChange) {
          newState.users = Math.max(0, newState.users + eventData.impact.userChange)
        }

        if (eventData.impact.valuationChange) {
          newState.valuation += eventData.impact.valuationChange
        }

        if (eventData.impact.mrrPerUserChange) {
          newState.mrrPerUser += eventData.impact.mrrPerUserChange
        }

        return newState
      },
    }

    // Create the impact object
    const impact: EventImpact = {
      cashChange: eventData.impact.cashChange,
      userChange: eventData.impact.userChange,
      valuationChange: eventData.impact.valuationChange,
      mrrPerUserChange: eventData.impact.mrrPerUserChange,
      message: eventData.impact.message,
    }

    return NextResponse.json({
      event: randomEvent,
      impact,
    })
  } catch (error) {
    console.error("Error generating random event:", error)
    return NextResponse.json(
      { error: "Failed to generate random event", details: (error as Error).message },
      { status: 500 },
    )
  }
}
