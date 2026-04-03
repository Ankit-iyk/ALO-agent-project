import React, { useState } from 'react';

interface GoalInputProps {
  onSubmit: (goal: string) => void;
  isLoading: boolean;
}

export default function GoalInput({ onSubmit, isLoading }: GoalInputProps) {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim() && !isLoading) {
      onSubmit(goal);
    }
  };

  const suggestions = [
    "Get fit in 30 days",
    "Launch a profitable side project",
    "Learn to speak French fluently"
  ];

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '1.5rem', 
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        fontSize: '2.5rem'
      }}>
        What is your high-level goal?
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Build a SaaS in 30 days, Run a marathon, Learn Quantum Physics..." 
            disabled={isLoading}
            style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}
          />
          <button type="submit" disabled={isLoading || !goal.trim()} style={{ whiteSpace: 'nowrap' }}>
            {isLoading ? 'Agents Processing...' : 'Optimize Life →'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', alignSelf: 'center' }}>Suggestions:</span>
          {suggestions.map(s => (
            <button 
              key={s} 
              type="button" 
              className="secondary"
              onClick={() => setGoal(s)}
              style={{ padding: '4px 12px', fontSize: '0.85rem', borderRadius: '16px' }}
              disabled={isLoading}
            >
              {s}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
