import { useEffect, useState } from 'react';

export default function CPFlash({ amount, label, onDone }) {
  const [visible, setVisible] = useState(false);
  const [risen, setRisen] = useState(false);

  useEffect(() => {
    if (!amount) return;
    setTimeout(() => setVisible(true), 50);
    setTimeout(() => setRisen(true), 100);
    setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 1500);
  }, [amount, onDone]);

  if (!amount) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '40%',
      left: '50%',
      transform: `translateX(-50%) translateY(${risen ? '-40px' : '0'})`,
      opacity: visible ? 1 : 0,
      transition: 'transform 1.2s ease-out, opacity 0.3s ease',
      zIndex: 9998,
      pointerEvents: 'none',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.4rem',
        color: '#E8FF47',
        letterSpacing: '0.1em',
        textShadow: '0 0 20px rgba(232,255,71,0.8)',
      }}>
        +{amount} CP
      </div>
      {label && (
        <div style={{
          fontSize: '0.6rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.1em',
          marginTop: 2,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
