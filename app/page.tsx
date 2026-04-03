'use client';

import React, { useState } from 'react';
import GoalInput from '@/components/GoalInput';
import AgentFeed from '@/components/AgentFeed';
import OutputCard from '@/components/OutputCard';
import ReasoningFlow from '@/components/ReasoningFlow';
import ScheduleTable from '@/components/ScheduleTable';
import MemoryPanel from '@/components/MemoryPanel';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateProgress = () => {
    const agents = ['Planner', 'Researcher', 'Executor', 'Critic', 'Memory'];
    let idx = 0;
    setActiveAgent(agents[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % agents.length;
      if (idx === 0) { 
        // Loop back or wait for api to return
        setActiveAgent(agents[agents.length - 1]);
      } else {
        setActiveAgent(agents[idx]);
      }
    }, 4500); // cycle through agents
    return interval;
  };

  const handleGoalSubmit = async (goal: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    const interval = simulateProgress();

    try {
      const response = await fetch('/api/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process request');
      }

      const data = await response.json();
      setResult(data);
      setActiveAgent('Done');
    } catch (err: unknown) {
      if (err instanceof Error) {
         setError(err.message);
      } else {
         setError("An unknown error occurred.");
      }
      setActiveAgent(null);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '3rem', margin: 0 }}>
          <span style={{ color: 'var(--accent-secondary)' }}>ALO</span>
          <span>Agent</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', margin: '0.5rem 0 0 0' }}>
          Autonomous Life Optimization Dashboard
        </p>
      </header>

      <GoalInput onSubmit={handleGoalSubmit} isLoading={isLoading} />
      
      {(activeAgent || result) && (
        <AgentFeed activeAgent={activeAgent === 'Done' ? null : activeAgent} />
      )}

      {error && (
        <div className="glass-panel" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Row: Plan and Research */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <OutputCard title="Strategic Plan" agent="Planner">
              <p><strong>Strategy:</strong> {result.plan?.overall_strategy}</p>
              <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>Sub-Goals:</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                {result.plan?.sub_goals?.map((sg: Record<string, unknown>, i: number) => (
                  <li key={i} style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ color: 'var(--accent-secondary)' }}>{String(sg.title)}</strong> - {String(sg.rationale)} <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{String(sg.timeline)} | {String(sg.category)} | Priority: {String(sg.priority)}</span>
                  </li>
                ))}
              </ul>
            </OutputCard>

            <OutputCard title="Research Insights" agent="Researcher">
              <h4 style={{ marginTop: '0', marginBottom: '0.5rem', color: 'var(--success)' }}>Quick Wins:</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {result.research?.quick_wins?.map((qw: string, i: number) => (
                  <span key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem' }}>{qw}</span>
                ))}
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Key Findings:</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                {result.research?.key_findings?.map((kf: Record<string, unknown>, i: number) => (
                  <li key={i} style={{ marginBottom: '0.75rem' }}>
                    {String(kf.finding)} <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source: {String(kf.source_type)} | Actionability: <span style={{color: 'var(--accent-primary)'}}>{String(kf.actionability)}</span></span>
                  </li>
                ))}
              </ul>
            </OutputCard>
          </div>

          {/* Middle Row: Execution */}
          <OutputCard title="Execution Schedule" agent="Executor">
             <ScheduleTable schedule={result.execution?.daily_schedule || []} />
             <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-secondary)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Executor Reasoning</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>{result.execution?.reasoning}</p>
             </div>
          </OutputCard>

          {/* Bottom Row: Critic & Memory */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <OutputCard title="Critique & Optimization" agent="Critic">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1 }}>
                  {result.critique?.overall_score || '--'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Score</div>
                  <div style={{ color: 'var(--success)', fontWeight: 500 }}>Confidence: {result.critique?.confidence_score}</div>
                </div>
              </div>
              <h4 style={{ color: 'var(--warning)', marginTop: '1rem', marginBottom: '0.5rem' }}>Needed Improvements:</h4>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                {result.critique?.improvements?.map((imp: Record<string, unknown>, i: number) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'white' }}>{String(imp.area)}:</strong> <span style={{ color: 'var(--text-muted)' }}>{String(imp.suggestion)}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '4px' }}>Crucial Refocus:</strong> 
                <span style={{ color: 'white' }}>{result.critique?.optimized_focus}</span>
              </div>
            </OutputCard>

            <OutputCard title="Session Memory" agent="Memory">
               <MemoryPanel memoryData={result.memory} />
            </OutputCard>
          </div>

          {/* Reasoning flowchart full width */}
          <OutputCard title="Reasoning Chain Flow" agent="Memory">
             <ReasoningFlow chartDefinition={result.memory?.mermaid_chart} />
          </OutputCard>

        </div>
      )}
    </div>
  );
}
