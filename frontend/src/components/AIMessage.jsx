import { useState, useEffect, useRef } from 'react';

export default function AIMessage({ text, loading }) {
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    idxRef.current = 0;
    if (!text) return;
    const iv = setInterval(() => {
      idxRef.current++;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [text]);

  if (loading) return (
    <div style={{
      display: 'flex', gap: 6, padding: '1.5rem 0',
      alignItems: 'center'
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--yellow)',
          animation: 'pulse 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
  );

  if (!text) return null;

  return (
    <div className="slide-in" style={{
      background: 'rgba(232,255,71,0.04)',
      border: '1px solid rgba(232,255,71,0.12)',
      borderLeft: '3px solid var(--yellow)',
      borderRadius: '0 12px 12px 0',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      lineHeight: 1.8,
      fontSize: '0.9rem',
      color: '#c8c8c8',
      whiteSpace: 'pre-wrap',
    }}>
      {displayed}
    </div>
  );
}