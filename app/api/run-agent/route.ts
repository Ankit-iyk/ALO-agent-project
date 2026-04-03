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

const PLANNER_PROMPT = `You are the Planner Agent in a multi-agent AI system called ALO (Autonomous Life Optimization Agent).
Your role is to break down ANY high-level user goal into 4-6 clear, prioritized sub-goals.
Respond ONLY with valid JSON (no markdown, no code fences) in this exact structure:
{
  "sub_goals": [
    { "id": 1, "title": "Sub-goal title", "priority": "high|medium|low", "rationale": "Why this is important", "timeline": "e.g., Week 1", "category": "e.g., Health|Learning|Finance|Productivity" }
  ],
  "overall_strategy": "A 2-3 sentence strategic overview",
  "success_metrics": ["metric1", "metric2", "metric3"]
}`;

const RESEARCHER_PROMPT = `You are the Researcher Agent in the ALO multi-agent system.
Given a user goal and its sub-goals, provide evidence-based research with concise, actionable insights.
Respond ONLY with valid JSON (no markdown, no code fences):
{
  "key_findings": [
    { "sub_goal_id": 1, "finding": "Specific insight", "source_type": "Scientific study|Expert advice|Best practice", "actionability": "high|medium|low" }
  ],
  "quick_wins": ["Win 1", "Win 2", "Win 3"],
  "common_pitfalls": ["Pitfall 1", "Pitfall 2"],
  "resources": [
    { "title": "Resource name", "type": "Book|Tool|Method|Framework", "relevance": "Why it helps" }
  ]
}`;

const EXECUTOR_PROMPT = `You are the Executor Agent in the ALO multi-agent system.
Convert plans and research into concrete, actionable daily/weekly schedules and task lists.
Respond ONLY with valid JSON (no markdown, no code fences):
{
  "daily_schedule": [
    { "time": "6:00 AM", "task": "Task description", "duration": "30 min", "category": "Health|Learning|Work|Personal", "priority": "high|medium|low" }
  ],
  "weekly_milestones": [
    { "week": 1, "milestone": "What to achieve", "tasks": ["Task 1", "Task 2"], "kpi": "Measurable outcome" }
  ],
  "immediate_actions": ["Action 1 (do today)", "Action 2", "Action 3"],
  "tools_needed": ["Tool 1", "Tool 2"],
  "reasoning": "Explain why this schedule/plan is optimal"
}`;

const CRITIC_PROMPT = `You are the Critic Agent in the ALO multi-agent system.
Evaluate the plan, research, and execution schedule for feasibility, gaps, and improvements.
Be constructive but honest. Respond ONLY with valid JSON (no markdown, no code fences):
{
  "overall_score": 85,
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "improvements": [
    { "area": "Area name", "suggestion": "Specific improvement", "impact": "high|medium|low" }
  ],
  "risk_factors": ["Risk 1", "Risk 2"],
  "optimized_focus": "The single most impactful thing to focus on first",
  "confidence_score": 0.85
}`;

const MEMORY_PROMPT = `You are the Memory Agent in the ALO multi-agent system.
Synthesize all agent outputs into a coherent summary and generate a Mermaid.js flowchart showing the reasoning chain.
Respond ONLY with valid JSON (no markdown, no code fences):
{
  "session_summary": "2-3 sentence summary of the full analysis",
  "key_decisions": ["Decision 1 made by agents", "Decision 2", "Decision 3"],
  "mermaid_chart": "graph TD\\n  A[User Goal] --> B[Planner\\nSub-goals]\\n  B --> C[Researcher\\nFindings]\\n  C --> D[Executor\\nSchedule]\\n  D --> E[Critic\\nEvaluation]\\n  E --> F[Memory\\nSynthesis]\\n  F --> G[Optimal Plan]",
  "next_iteration_focus": "What should be improved in the next cycle",
  "stored_context": {
    "goal_category": "Health|Career|Finance|Learning|Relationships|Other",
    "complexity": "simple|moderate|complex",
    "estimated_duration": "e.g., 30 days"
  }
}`;

function safeJsonParse(text: string): Record<string, unknown> {
  try {
    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
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
      return NextResponse.json({ error: "GEMINI_API_KEY not configured. Add it to .env.local" }, { status: 500 });
    }

    const goalContext = `User Goal: ${goal}`;

    // Step 1: Planner
    const plannerRaw = await callAgent("Planner", PLANNER_PROMPT, goalContext);
    const plannerOutput = safeJsonParse(plannerRaw);

    // Step 2: Researcher (has context of plan)
    const researcherRaw = await callAgent(
      "Researcher",
      RESEARCHER_PROMPT,
      `${goalContext}\n\nPlanner Output: ${JSON.stringify(plannerOutput)}`
    );
    const researcherOutput = safeJsonParse(researcherRaw);

    // Step 3: Executor (has context of plan + research)
    const executorRaw = await callAgent(
      "Executor",
      EXECUTOR_PROMPT,
      `${goalContext}\n\nPlan: ${JSON.stringify(plannerOutput)}\n\nResearch: ${JSON.stringify(researcherOutput)}`
    );
    const executorOutput = safeJsonParse(executorRaw);

    // Step 4: Critic (evaluates everything)
    const criticRaw = await callAgent(
      "Critic",
      CRITIC_PROMPT,
      `${goalContext}\n\nPlan: ${JSON.stringify(plannerOutput)}\n\nResearch: ${JSON.stringify(researcherOutput)}\n\nExecution: ${JSON.stringify(executorOutput)}`
    );
    const criticOutput = safeJsonParse(criticRaw);

    // Step 5: Memory (synthesizes all)
    const memoryRaw = await callAgent(
      "Memory",
      MEMORY_PROMPT,
      `${goalContext}\n\nPlan: ${JSON.stringify(plannerOutput)}\n\nResearch: ${JSON.stringify(researcherOutput)}\n\nExecution: ${JSON.stringify(executorOutput)}\n\nCritique: ${JSON.stringify(criticOutput)}`
    );
    const memoryOutput = safeJsonParse(memoryRaw);

    const response = {
      goal,
      timestamp: new Date().toISOString(),
      plan: plannerOutput,
      research: researcherOutput,
      execution: executorOutput,
      critique: criticOutput,
      memory: memoryOutput,
      reasoning_chain: [
        { agent: "Planner", status: "complete", output_keys: Object.keys(plannerOutput) },
        { agent: "Researcher", status: "complete", output_keys: Object.keys(researcherOutput) },
        { agent: "Executor", status: "complete", output_keys: Object.keys(executorOutput) },
        { agent: "Critic", status: "complete", output_keys: Object.keys(criticOutput) },
        { agent: "Memory", status: "complete", output_keys: Object.keys(memoryOutput) },
      ],
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("Agent error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
