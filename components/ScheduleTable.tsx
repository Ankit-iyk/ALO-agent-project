import React from 'react';

interface ScheduleTask {
  time: string;
  task: string;
  duration: string;
  category: string;
  priority: string;
}

interface ScheduleTableProps {
  schedule: ScheduleTask[];
}

export default function ScheduleTable({ schedule }: ScheduleTableProps) {
  if (!schedule || schedule.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No schedule provided.</p>;
  }

  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Task</th>
            <th>Duration</th>
            <th>Category</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item, index) => (
            <tr key={index}>
              <td style={{ whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--accent-secondary)' }}>
                {item.time}
              </td>
              <td style={{ fontWeight: 500, color: 'white' }}>{item.task}</td>
              <td style={{ color: 'var(--text-muted)' }}>{item.duration}</td>
              <td>
                <span style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem' 
                }}>
                  {item.category}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    width: '8px', height: '8px', borderRadius: '50%', 
                    background: getPriorityColor(item.priority) 
                  }}></span>
                  <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                    {item.priority}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
