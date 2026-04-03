'use client';
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface ReasoningFlowProps {
  chartDefinition: string;
}

export default function ReasoningFlow({ chartDefinition }: ReasoningFlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        fontFamily: 'inherit',
        primaryColor: '#8b5cf6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#7c3aed',
        lineColor: '#06b6d4',
        secondaryColor: '#06b6d4',
        tertiaryColor: '#10b981'
      }
    });

    const renderChart = async () => {
      if (ref.current && chartDefinition) {
        try {
          setHasError(false);
          // clean previous render
          ref.current.innerHTML = '';
          const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), chartDefinition);
          ref.current.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid render error:', error);
          setHasError(true);
        }
      }
    };

    renderChart();
  }, [chartDefinition]);

  if (!chartDefinition) return <p style={{ color: 'var(--text-muted)' }}>No reasoning chain available yet.</p>;

  return (
    <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center', padding: '1rem' }}>
      {hasError ? (
        <p style={{ color: 'var(--danger)' }}>Failed to render chart. See console for details.</p>
      ) : (
        <div ref={ref} />
      )}
    </div>
  );
}
