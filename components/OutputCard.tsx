import React from 'react';

interface OutputCardProps {
  title: string;
  agent: string;
  children: React.ReactNode;
}

export default function OutputCard({ title, agent, children }: OutputCardProps) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, color: 'white' }}>{title}</h3>
        <span style={{ 
          fontSize: '0.75rem', 
          background: 'rgba(139, 92, 246, 0.2)', 
          color: 'var(--accent-primary)', 
          padding: '4px 10px', 
          borderRadius: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {agent} Agent
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
