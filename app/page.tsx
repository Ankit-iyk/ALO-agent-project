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
     const agents = [
        'Planner', 'Researcher', 'Executor', 'Conflict Resolver', 
        'Personalization', 'Simulator', 'Critic', 'Memory', 
        'Notification', 'Analytics'
      ];
    let idx = 0;
    setActiveAgent(agents[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % agents.length;
      if (idx === 0) { 
        setActiveAgent(agents[agents.length - 1]);
      } else {
        setActiveAgent(agents[idx]);
      }
    }, 4500);
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
    <div className="container" style={{ maxWidth: '1400px' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '3rem', margin: 0 }}>
          <span style={{ color: 'var(--accent-secondary)' }}>AgentOS</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', margin: '0.5rem 0 0 0' }}>
          Turn Goals into Execution using AI Agents
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
          
          {/* Row 1: Plan & Research */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
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

          {/* Row 2: Executor, Conflict Resolver, Personalization */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <OutputCard title="Raw Execution" agent="Executor">
               <ScheduleTable schedule={result.execution?.daily_schedule || []} />
               <div style={{ marginTop: '1.5rem' }}>
                 <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{result.execution?.reasoning}</p>
               </div>
            </OutputCard>

            <OutputCard title="Conflict Resolution" agent="Conflict Resolver">
               <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid var(--warning)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--warning)', margin: '0 0 0.5rem 0' }}>Resolved Schedule</h4>
                  <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.9rem' }}>
                    {result.conflict?.resolved_schedule?.map((item: Record<string, unknown>, i: number) => (
                       <li key={i}><strong>{String(item.time)}</strong>: {String(item.task)} <br/><span style={{ color: 'var(--text-muted)' }}>Reason: {String(item.adjustment_reason)}</span></li>
                    ))}
                  </ul>
               </div>
               <p style={{ fontSize: '0.9rem', color: 'white' }}>Conflicts Avoided: {result.conflict?.conflicts_avoided?.join(", ")}</p>
            </OutputCard>

            <OutputCard title="Personalization Factors" agent="Personalization">
                <ul style={{ paddingLeft: '1rem', color: 'var(--text-main)' }}>
                   {result.personalization?.adapted_tasks?.map((adp: Record<string, unknown>, i: number) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>
                         <strong>{String(adp.adapted_task)}</strong> <br/>
                         <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>Factor: {String(adp.personalization_factor)}</span>
                      </li>
                   ))}
                </ul>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--success)' }}>
                  <strong>Focus Recs:</strong> {result.personalization?.focus_recommendations?.join(", ")}
                </div>
            </OutputCard>
          </div>

          {/* Row 3: Simulator & Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <OutputCard title="Simulation Engine" agent="Simulator">
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                 <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                    {result.simulator?.success_probability || 0}%
                 </div>
                 <div style={{ color: 'var(--text-muted)' }}>Probable Success Rate</div>
               </div>
               <h4>Predicted KPIs (Day 30):</h4>
               <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                 {result.simulator?.predicted_kpis?.map((kpi: Record<string, unknown>, i: number) => (
                    <li key={i}><strong>{String(kpi.metric)}</strong>: {String(kpi.value_by_day_30)}</li>
                 ))}
               </ul>
               <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                  <h4 style={{ color: 'var(--danger)', margin: '0 0 0.5rem 0' }}>Risk Mitigation</h4>
                  <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.9rem' }}>
                     {result.simulator?.risk_factors?.map((rf: Record<string, unknown>, i: number) => (
                        <li key={i}>{String(rf.risk)} → <span style={{ color: 'white' }}>{String(rf.mitigation)}</span></li>
                     ))}
                  </ul>
               </div>
            </OutputCard>

             <OutputCard title="Performance Analytics" agent="Analytics">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                   {result.analytics?.dashboard_metrics?.map((metric: Record<string, unknown>, i: number) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', flex: 1, minWidth: '120px', textAlign: 'center' }}>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{String(metric.label)}</div>
                         <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>{String(metric.value)}</div>
                         <div style={{ fontSize: '0.8rem', color: metric.trend === 'up' ? 'var(--success)' : 'var(--warning)' }}>Trend: {String(metric.trend)}</div>
                      </div>
                   ))}
                </div>
                <h4>Chart Data Projection:</h4>
                <ul style={{ paddingLeft: '1rem', fontSize: '0.9rem' }}>
                   {result.analytics?.chart_data?.map((cd: Record<string, unknown>, i: number) => (
                       <li key={i}>Day {String(cd.day)}: {String(cd.progress)}% progress expected</li>
                   ))}
                </ul>
             </OutputCard>
          </div>

          {/* Row 4: Critic & Notifications */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
             <OutputCard title="Critic Audit" agent="Critic">
                 <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                    Score: {result.critique?.overall_score || '--'}/100
                 </div>
                 <h4 style={{ color: 'var(--warning)', marginTop: '1rem', marginBottom: '0.5rem' }}>Improvements Needed:</h4>
                 <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                  {result.critique?.improvements?.map((imp: Record<string, unknown>, i: number) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'white' }}>{String(imp.area)}:</strong> <span style={{ color: 'var(--text-muted)' }}>{String(imp.suggestion)}</span>
                    </li>
                  ))}
                 </ul>
             </OutputCard>

             <OutputCard title="Notification & Push Strategy" agent="Notification">
                 <h4>Trigger Strategy: {result.notification?.reminder_strategy}</h4>
                 <ul style={{ paddingLeft: '1rem' }}>
                    {result.notification?.push_notifications?.map((push: Record<string, unknown>, i: number) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>
                           <span style={{ background: push.urgency === 'high' ? 'var(--danger)' : 'var(--accent-secondary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginRight: '8px' }}>
                             {String(push.trigger_time)}
                           </span>
                           {String(push.message)}
                        </li>
                    ))}
                 </ul>
             </OutputCard>
          </div>

          {/* Row 5: Memory Flow */}
          <OutputCard title="Session Memory & Final Reasoning Flow" agent="Memory">
             <div style={{ marginBottom: '2rem' }}>
               <MemoryPanel memoryData={result.memory} />
             </div>
             <ReasoningFlow chartDefinition={result.memory?.mermaid_chart} />
          </OutputCard>

        </div>
      )}
    </div>
  );
}
