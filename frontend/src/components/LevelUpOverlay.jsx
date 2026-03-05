import { useEffect, useState } from 'react';

const LEVEL_NAMES = [
  '', 'Frozen', 'Stirring', 'Deciding', 'Acting', 'Committed', 'Forging', 'Resolved'
];

const LEVEL_MESSAGES = [
  '',
  'The journey begins.',
  "You're starting to move.",
  'Decisions are being made.',
  'You are taking action.',
  'Commitment is your superpower.',
  'You forge your own path.',
  'You are Resolved. Nothing stops you now.',
];

export default function LevelUpOverlay({ level, onDone }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    if (!level) return;
    const t1 = setTimeout(() => setPhase('hold'), 50);
    const t2 = setTimeout(() => setPhase('exit'), 4000);
    const t3 = setTimeout(onDone, 4600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [level]);

  if (!level) return null;

  const handleClick = () => {
    setPhase('exit');
    setTimeout(onDone, 600);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        opacity: phase === 'hold' ? 1 : 0,
        transition: 'opacity 0.5s ease',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
      }}
    >
      {/* Glow ring + Remmy */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: level >= 7
            ? 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(232,255,71,0.2) 0%, transparent 70%)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <img
          src="/remmy.png"
          alt="Remmy"
          style={{
            width: 140,
            height: 140,
            objectFit: 'contain',
            borderRadius: 32,
            filter: level >= 7
              ? 'brightness(1.3) sepia(1) saturate(3) hue-rotate(5deg)'
              : 'brightness(1.2) saturate(1.5)',
            boxShadow: level >= 7
              ? '0 0 60px rgba(255,215,0,0.8)'
              : '0 0 60px rgba(232,255,71,0.6)',
            animation: 'float 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Text */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          color: '#E8FF47',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)',
        }}>
          Level Up
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '3.5rem',
          color: '#fff',
          letterSpacing: '0.05em',
          lineHeight: 1,
          animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {LEVEL_NAMES[level]}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          maxWidth: 240,
          fontFamily: 'var(--font-mono)',
        }}>
          {LEVEL_MESSAGES[level]}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[1,2,3,4,5,6,7].map(l => (
          <div key={l} style={{
            width: l === level ? 28 : 8,
            height: 8,
            borderRadius: 4,
            background: l <= level ? '#E8FF47' : '#222',
            transition: 'all 0.3s ease',
            boxShadow: l === level ? '0 0 12px rgba(232,255,71,0.8)' : 'none',
          }} />
        ))}
      </div>

      <div style={{
        fontSize: '0.7rem',
        color: '#444',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.1em',
        marginTop: 8,
      }}>
        TAP TO CONTINUE
      </div>
    </div>
  );
}