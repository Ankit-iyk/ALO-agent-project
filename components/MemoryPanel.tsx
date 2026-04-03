import React from 'react';

// Type definition loosely based on our expected JSON output
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface MemoryPanelProps {
  memoryData: any | null;
}

export default function MemoryPanel({ memoryData }: MemoryPanelProps) {
  if (!memoryData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
        No memory stored yet. Start a session to see agent synthesis.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Session Summary</h4>
        <p style={{ color: 'white', fontSize: '1.1rem', lineHeight: 1.6 }}>
          {memoryData.session_summary || 'No summary available.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Key Decisions Made</h4>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {(memoryData.key_decisions || []).map((decision: string, i: number) => (
              <li key={i} style={{ marginBottom: '4px' }}>{decision}</li>
            ))}
          </ul>
        </div>
        
        <div style={{ flex: 1, minWidth: '200px', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--warning)' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Next Iteration Focus</h4>
          <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {memoryData.next_iteration_focus || 'N/A'}
          </p>
        </div>
      </div>

      {memoryData.stored_context && (
        <div>
           <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Context Snapshot</h4>
           <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
                Category: <strong>{memoryData.stored_context.goal_category}</strong>
              </span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
                Complexity: <strong>{memoryData.stored_context.complexity}</strong>
              </span>
           </div>
        </div>
      )}
    </div>
  );
}
