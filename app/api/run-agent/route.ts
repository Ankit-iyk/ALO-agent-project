import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL = "gemini-2.5-flash";

async function callAgent(agentName: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

const PLANNER_PROMPT = `You are the Planner Agent. Break down ANY high-level user goal into 4-6 clear, prioritized sub-goals.
Respond ONLY with valid JSON structure: {"sub_goals": [{"title": "...", "priority": "high", "rationale": "...", "timeline": "...", "category": "..."}], "overall_strategy": "...", "success_metrics": ["..."]}`;

const RESEARCHER_PROMPT = `You are the Researcher Agent. Given a user goal and sub-goals, provide actionable insights.
Respond ONLY with valid JSON: {"key_findings": [{"finding": "...", "source_type": "...", "actionability": "high"}], "quick_wins": ["..."], "common_pitfalls": ["..."], "resources": [{"title": "...", "type": "...", "relevance": "..."}]}`;

const EXECUTOR_PROMPT = `You are the Executor Agent. Convert plans into a daily/weekly schedule.
Respond ONLY with valid JSON: {"daily_schedule": [{"time": "...", "task": "...", "duration": "...", "category": "...", "priority": "high"}], "weekly_milestones": [{"week": 1, "milestone": "...", "tasks": ["..."], "kpi": "..."}], "immediate_actions": ["..."], "reasoning": "..."}`;

const CONFLICT_RESOLVER_PROMPT = `You are the Conflict Resolver Agent. Ensure the executor's schedule has no overlaps or burnout risks. 
Fix resource constraints and output an optimized schedule.
Respond ONLY with valid JSON: {"resolved_schedule": [{"time": "...", "task": "...", "duration": "...", "adjustment_reason": "..."}], "conflicts_avoided": ["..."], "optimization_score": 95}`;

const PERSONALIZATION_PROMPT = `You are the Personalization Agent. Adapt the resolved schedule based on the user's profile (age, occupation, health, etc.).
Respond ONLY with valid JSON: {"adapted_tasks": [{"original_task": "...", "adapted_task": "...", "personalization_factor": "..."}], "difficulty_adjustments": ["..."], "focus_recommendations": ["..."]}`;

const SIMULATOR_PROMPT = `You are the Simulator Agent. Predict outcomes, KPIs, risk factors, and success probabilities for the personalized plan.
Respond ONLY with valid JSON: {"predicted_kpis": [{"metric": "...", "value_by_day_30": "..."}], "success_probability": 85, "risk_factors": [{"risk": "...", "mitigation": "..."}], "recommended_path": "..."}`;

const CRITIC_PROMPT = `You are the Critic Agent. Evaluate the entire plan's feasibility.
Respond ONLY with valid JSON: {"overall_score": 85, "strengths": ["..."], "weaknesses": ["..."], "improvements": [{"area": "...", "suggestion": "...", "impact": "high"}], "optimized_focus": "..."}`;

const MEMORY_PROMPT = `You are the Memory Agent. Synthesize outputs and create a Mermaid.js reasoning flow.
Respond ONLY with valid JSON: {"session_summary": "...", "key_decisions": ["..."], "mermaid_chart": "graph TD\\n A[User Goal] --> B[Planner]", "next_iteration_focus": "..."}`;

const NOTIFICATION_PROMPT = `You are the Notification Agent. Design push notifications and alerts based on the schedule.
Respond ONLY with valid JSON: {"push_notifications": [{"trigger_time": "...", "message": "...", "urgency": "high|medium"}], "reminder_strategy": "..."}`;

const ANALYTICS_PROMPT = `You are the Analytics Agent. Define JSON data structures for frontend progress graphs based on predicted KPIs.
Respond ONLY with valid JSON: {"chart_data": [{"day": 1, "progress": 10}, {"day": 7, "progress": 30}], "dashboard_metrics": [{"label": "...", "value": "...", "trend": "up|down"}]}`;

function safeJsonParse(text: string): Record<string, unknown> {
  try {
    const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw: text, parse_error: true };
  }
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

    // Mock User Context (since we only receive string input from UI currently)
    const mockContext = {
      user_profile: { age: 28, occupation: "Software Engineer", preferences: "Night owl, prefers intense short sprints" },
      health_metrics: { avg_sleep: "6.5h", fitness_level: "Intermediate" },
      calendar_data: { busy_hours: ["10:00 AM-2:00 PM"] }
    };
    const contextStr = `\n\nUser Profile: ${JSON.stringify(mockContext.user_profile)}\nHealth Metrics: ${JSON.stringify(mockContext.health_metrics)}\nCalendar Data: ${JSON.stringify(mockContext.calendar_data)}`;

    const goalContext = `User Goal: ${goal}${contextStr}`;

    // 1. Planner
    const plannerRaw = await callAgent("Planner", PLANNER_PROMPT, goalContext);
    const plannerOutput = safeJsonParse(plannerRaw);

    // 2. Researcher
    const researcherRaw = await callAgent("Researcher", RESEARCHER_PROMPT, `${goalContext}\n\nPlanner: ${JSON.stringify(plannerOutput)}`);
    const researcherOutput = safeJsonParse(researcherRaw);

    // 3. Executor
    const executorRaw = await callAgent("Executor", EXECUTOR_PROMPT, `${goalContext}\n\nPlan: ${JSON.stringify(plannerOutput)}\n\nResearch: ${JSON.stringify(researcherOutput)}`);
    const executorOutput = safeJsonParse(executorRaw);

    // 4. Conflict Resolver
    const conflictRaw = await callAgent("Conflict Resolver", CONFLICT_RESOLVER_PROMPT, `${goalContext}\n\nExecutor Schedule: ${JSON.stringify(executorOutput)}`);
    const conflictOutput = safeJsonParse(conflictRaw);

    // 5. Personalization
    const personRaw = await callAgent("Personalization", PERSONALIZATION_PROMPT, `${goalContext}\n\nResolved Schedule: ${JSON.stringify(conflictOutput)}`);
    const personOutput = safeJsonParse(personRaw);

    // 6. Simulator
    const simulatorRaw = await callAgent("Simulator", SIMULATOR_PROMPT, `${goalContext}\n\nAdapted Tasks: ${JSON.stringify(personOutput)}`);
    const simulatorOutput = safeJsonParse(simulatorRaw);

    // 7. Critic
    const criticRaw = await callAgent("Critic", CRITIC_PROMPT, `${goalContext}\n\nPlan: ${JSON.stringify(plannerOutput)}\n\nSimulator Params: ${JSON.stringify(simulatorOutput)}`);
    const criticOutput = safeJsonParse(criticRaw);

    // 8. Memory
    const memoryRaw = await callAgent("Memory", MEMORY_PROMPT, `${goalContext}\n\nPlan: ${JSON.stringify(plannerOutput)}\n\nCritic Review: ${JSON.stringify(criticOutput)}`);
    const memoryOutput = safeJsonParse(memoryRaw);

    // 9. Notification
    const notifRaw = await callAgent("Notification", NOTIFICATION_PROMPT, `${goalContext}\n\nAdapted Tasks: ${JSON.stringify(personOutput)}`);
    const notifOutput = safeJsonParse(notifRaw);

    // 10. Analytics
    const analyticsRaw = await callAgent("Analytics", ANALYTICS_PROMPT, `${goalContext}\n\nSimulator Prediction: ${JSON.stringify(simulatorOutput)}`);
    const analyticsOutput = safeJsonParse(analyticsRaw);


    const response = {
      goal,
      timestamp: new Date().toISOString(),
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
