import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL = "gemini-2.5-flash";

async function callAgent(agentName: string, systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    return result.response.text();
  } catch (error: any) {
    if (error.status === 429) {
      throw new Error("API quota exceeded. You've reached the daily limit for the free tier (20 requests). Please upgrade your plan at https://ai.google.dev/gemini-api/docs/rate-limits or wait until tomorrow for the quota to reset.");
    }
    throw error;
  }
}

const PLANNER_PROMPT = `You are the Planner Agent. Break down ANY high-level user goal into 4-6 clear, prioritized sub-goals.
Respond ONLY with valid JSON structure: {"sub_goals": [{"title": "...", "priority": "high", "rationale": "...", "timeline": "...", "category": "..."}], "overall_strategy": "...", "success_metrics": ["..."]}`;

const EXECUTOR_PROMPT = `You are the Executor Agent. Convert plans into a daily/weekly schedule.
Respond ONLY with valid JSON: {"daily_schedule": [{"time": "...", "task": "...", "duration": "...", "category": "...", "priority": "high"}], "weekly_milestones": [{"week": 1, "milestone": "...", "tasks": ["..."], "kpi": "..."}], "immediate_actions": ["..."], "reasoning": "..."}`;

const CRITIC_PROMPT = `You are the Critic Agent. Evaluate the entire plan's feasibility and execution quality.
Respond ONLY with valid JSON: {"overall_score": 85, "strengths": ["..."], "weaknesses": ["..."], "improvements": [{"area": "...", "suggestion": "...", "impact": "high"}], "optimized_focus": "..."}`;

function safeJsonParse(text: string): Record<string, unknown> {
  try {
    const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw: text, parse_error: true };
  }
}

// Mock responses for reduced API calls
function generateMockResearch(plan: Record<string, unknown>): Record<string, unknown> {
  return {
    key_findings: [
      { finding: "Goal aligns with current market trends", source_type: "analysis", actionability: "high" },
      { finding: "Timeline is realistic based on similar goals", source_type: "historical_data", actionability: "high" },
      { finding: "Resource requirements are manageable", source_type: "estimation", actionability: "medium" }
    ],
    quick_wins: ["Start with highest priority sub-goal", "Allocate 30% of time to planning", "Set weekly check-ins"],
    common_pitfalls: ["Underestimating time requirements", "Scope creep", "Insufficient break time"],
    resources: [
      { title: "Project Management Best Practices", type: "guide", relevance: "high" },
      { title: "Time Management Tools", type: "tool", relevance: "medium" }
    ]
  };
}

function generateMockConflictResolution(execution: Record<string, unknown>): Record<string, unknown> {
  return {
    resolved_schedule: (execution.daily_schedule as any[])?.map((task: any) => ({
      ...task,
      adjustment_reason: "Optimized for focus and recovery time"
    })) || [],
    conflicts_avoided: ["Overlapping task times", "Burnout from consecutive high-intensity tasks"],
    optimization_score: 92
  };
}

function generateMockPersonalization(conflict: Record<string, unknown>): Record<string, unknown> {
  return {
    adapted_tasks: [
      { original_task: "Morning planning session", adapted_task: "Evening planning session", personalization_factor: "Night owl preference" },
      { original_task: "Standard 8-hour work blocks", adapted_task: "Intense 3-4 hour sprints", personalization_factor: "Prefers short intense work periods" }
    ],
    difficulty_adjustments: ["Reduced early morning commitments", "Added energy recovery breaks"],
    focus_recommendations: ["Peak focus hours: 8 PM - 11 PM", "Recovery time needed after sprints"]
  };
}

function generateMockSimulation(personalization: Record<string, unknown>): Record<string, unknown> {
  return {
    predicted_kpis: [
      { metric: "Goal Completion % by Day 30", value_by_day_30: "85%" },
      { metric: "Average Daily Progress", value_by_day_30: "6.8% per day" },
      { metric: "Milestone Hit Rate", value_by_day_30: "92%" }
    ],
    success_probability: 87,
    risk_factors: [
      { risk: "Scope expansion", mitigation: "Weekly scope review meetings" },
      { risk: "Burnout from sprints", mitigation: "Mandatory 2-day recovery weekends" }
    ],
    recommended_path: "Follow the optimized schedule with built-in buffer time"
  };
}

function generateMockMemory(plan: Record<string, unknown>, critique: Record<string, unknown>): Record<string, unknown> {
  return {
    session_summary: "Successfully created and validated a comprehensive action plan with 87% success probability",
    key_decisions: [
      "Prioritized high-impact sub-goals first",
      "Adapted schedule for night owl preferences",
      "Included weekly validation checkpoints"
    ],
    mermaid_chart: `graph TD
      A["User Goal"] --> B["Planner Agent"]
      B --> C["Execution Plan"]
      C --> D["Conflict Resolution"]
      D --> E["Personalization"]
      E --> F["Simulation"]
      F --> G["Critic Review"]
      G --> H["Validated Plan"]`,
    next_iteration_focus: "Monitor week 1 KPIs and adjust sprint intensity based on actual energy levels"
  };
}

function generateMockNotification(personalization: Record<string, unknown>): Record<string, unknown> {
  return {
    push_notifications: [
      { trigger_time: "8:00 PM", message: "Your peak focus time is starting. Begin sprint session.", urgency: "medium" },
      { trigger_time: "11:00 PM", message: "Sprint recovery: time to wind down and plan tomorrow.", urgency: "medium" },
      { trigger_time: "Monday 8:00 PM", message: "Weekly milestone check-in: review progress and adjust if needed.", urgency: "high" }
    ],
    reminder_strategy: "Push notifications at peak focus times and milestone checkpoints"
  };
}

function generateMockAnalytics(simulation: Record<string, unknown>): Record<string, unknown> {
  return {
    chart_data: [
      { day: 1, progress: 5 },
      { day: 7, progress: 32 },
      { day: 14, progress: 58 },
      { day: 21, progress: 75 },
      { day: 30, progress: 85 }
    ],
    dashboard_metrics: [
      { label: "Success Probability", value: "87%", trend: "up" },
      { label: "Completion Rate", value: "85%", trend: "up" },
      { label: "Risk Level", value: "Low", trend: "down" }
    ]
  };
}

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json();

    if (!goal || typeof goal !== "string") {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured. Add it to .env" }, { status: 500 });
    }

    // Mock User Context
    const mockContext = {
      user_profile: { age: 28, occupation: "Software Engineer", preferences: "Night owl, prefers intense short sprints" },
      health_metrics: { avg_sleep: "6.5h", fitness_level: "Intermediate" },
      calendar_data: { busy_hours: ["10:00 AM-2:00 PM"] }
    };
    const contextStr = `\n\nUser Profile: ${JSON.stringify(mockContext.user_profile)}\nHealth Metrics: ${JSON.stringify(mockContext.health_metrics)}\nCalendar Data: ${JSON.stringify(mockContext.calendar_data)}`;

    const goalContext = `User Goal: ${goal}${contextStr}`;

    // Only 3 API calls to stay within free tier limits (20 requests/day)
    
    // 1. Planner
    const plannerRaw = await callAgent("Planner", PLANNER_PROMPT, goalContext);
    const plannerOutput = safeJsonParse(plannerRaw);

    // 2. Executor
    const executorRaw = await callAgent("Executor", EXECUTOR_PROMPT, `${goalContext}\n\nPlan: ${JSON.stringify(plannerOutput)}`);
    const executorOutput = safeJsonParse(executorRaw);

    // 3. Critic
    const criticRaw = await callAgent("Critic", CRITIC_PROMPT, `${goalContext}\n\nPlan: ${JSON.stringify(plannerOutput)}\n\nExecution: ${JSON.stringify(executorOutput)}`);
    const criticOutput = safeJsonParse(criticRaw);

    // Mock all other agents to save API calls
    const researcherOutput = generateMockResearch(plannerOutput);
    const conflictOutput = generateMockConflictResolution(executorOutput);
    const personOutput = generateMockPersonalization(conflictOutput);
    const simulatorOutput = generateMockSimulation(personOutput);
    const memoryOutput = generateMockMemory(plannerOutput, criticOutput);
    const notifOutput = generateMockNotification(personOutput);
    const analyticsOutput = generateMockAnalytics(simulatorOutput);

    const response = {
      goal,
      timestamp: new Date().toISOString(),
      api_calls_made: 3,
      api_calls_mocked: 7,
      plan: plannerOutput,
      research: researcherOutput,
      execution: executorOutput,
      conflict: conflictOutput,
      personalization: personOutput,
      simulator: simulatorOutput,
      critique: criticOutput,
      memory: memoryOutput,
      notification: notifOutput,
      analytics: analyticsOutput,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("Agent error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
