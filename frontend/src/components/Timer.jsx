import { useState, useEffect } from 'react';

export default function Timer({ seconds, onEnd }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);

    const iv = setInterval(() => {
      setLeft((current) => {
        if (current <= 1) {
          clearInterval(iv);
          onEnd?.();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [seconds, onEnd]);

  const pct = (left / seconds) * 100;

  return (
    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
      <div style={{
        width: 130, height: 130, margin: '0 auto',
        borderRadius: '50%',
        background: `conic-gradient(var(--yellow) ${pct}%, #1a1a1a ${pct}%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: left <= 10 ? 'glow 1s ease-in-out infinite' : 'none',
      }}>
        <div style={{
          width: 106, height: 106, borderRadius: '50%',
          background: 'var(--bg)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column',
        }}>
          <span style={{
            fontSize: '2.5rem', fontWeight: 800,
            color: left <= 10 ? 'var(--danger)' : 'var(--yellow)',
            lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.05em',
          }}>{left}</span>
          <span style={{ fontSize: '0.6rem', color: '#555', letterSpacing: '0.15em' }}>SEC</span>
        </div>
      </div>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
        {left > 0 ? 'FEEL. DON\'T THINK.' : 'TIME\'S UP.'}
      </p>
    </div>
  );
}
