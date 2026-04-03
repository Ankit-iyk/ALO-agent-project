import React from 'react';

interface AgentFeedProps {
  activeAgent: string | null;
}

export default function AgentFeed({ activeAgent }: AgentFeedProps) {
  const agents = [
    'Planner', 
    'Researcher', 
    'Executor', 
    'Conflict Resolver', 
    'Personalization', 
    'Simulator', 
    'Critic', 
    'Memory', 
    'Notification', 
    'Analytics'
  ];
  
  if (!activeAgent) return null;

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Multi-Agent Reasoning Loop</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {agents.map((agent, index) => {
          const isActive = activeAgent === agent;
          const currentIndex = agents.indexOf(activeAgent);
          const isDone = currentIndex > index;

          return (
            <div 
              key={agent}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${isActive ? 'var(--accent-secondary)' : isDone ? 'var(--success)' : 'var(--glass-border)'}`,
                background: isActive ? 'rgba(6, 182, 212, 0.1)' : isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.2)',
                color: isActive ? '#fff' : isDone ? 'var(--success)' : 'var(--text-muted)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}
            >
              {isActive && (
                <span style={{ 
                  width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-secondary)',
                  boxShadow: '0 0 8px var(--accent-secondary)', animation: 'pulse 1.5s infinite' 
                }} />
              )}
              {isDone && <span>✓</span>}
              <span style={{ fontWeight: isActive ? 600 : 400 }}>{agent}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.5; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
