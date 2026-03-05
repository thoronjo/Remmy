import { useEffect, useState } from 'react';
import Remmy from './Remmy';

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
  const [phase, setPhase] = useState('enter'); // enter → hold → exit

  useEffect(() => {
    if (!level) return;
    setTimeout(() => setPhase('hold'), 100);
    setTimeout(() => setPhase('exit'), 3000);
    setTimeout(onDone, 3500);
  }, [level]);

  if (!level) return null;

  return (
    <div style={{
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
      transition: 'opacity 0.4s ease',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Glow ring */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(232,255,71,0.15) 0%, transparent 70%)`,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <Remmy
          size={140}
          level={level}
          mood={level >= 7 ? 'legendary' : 'zoomies'}
        />
      </div>

      {/* Level badge */}
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

      {/* Level number pills */}
      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}>
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
        color: '#333',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.1em',
      }}>
        TAP TO CONTINUE
      </div>
    </div>
  );
}