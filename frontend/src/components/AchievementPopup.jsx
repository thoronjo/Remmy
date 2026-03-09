import { useEffect, useState } from 'react';

const ACHIEVEMENT_META = {
  first_strike:    { icon: 'âš¡', name: 'First Strike',    desc: 'Made your first decision' },
  lightning:       { icon: 'ðŸŒ©ï¸', name: 'Lightning',       desc: 'Decided in under 24 hours' },
  vault:           { icon: 'ðŸ”’', name: 'Vault',           desc: 'Completed a full lock period' },
  ironwill:        { icon: 'ðŸª¨', name: 'Iron Will',       desc: 'Resisted unlocking 3 times' },
  on_fire:         { icon: 'ðŸ”¥', name: 'On Fire',         desc: '5 decision streak' },
  eyes_open:       { icon: 'ðŸ‘ï¸', name: 'Eyes Open',       desc: 'Faced 5 scary choices' },
  pattern_breaker: { icon: 'ðŸ’¥', name: 'Pattern Breaker', desc: '10 decisions completed' },
  forged:          { icon: 'ðŸ‘‘', name: 'Forged',          desc: 'Reached Level 7 â€” Resolved' },
};

export default function AchievementPopup({ achievement, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement) return;
    // Slide in
    setTimeout(() => setVisible(true), 50);
    // Slide out after 3.5s
    setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 3500);
  }, [achievement, onDone]);

  if (!achievement) return null;
  const meta = ACHIEVEMENT_META[achievement];
  if (!meta) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '120px'})`,
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: '#0d0d0d',
        border: '1px solid #E8FF47',
        borderRadius: 16,
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 0 40px rgba(232,255,71,0.3), 0 8px 32px rgba(0,0,0,0.8)',
        minWidth: 280,
        maxWidth: 360,
      }}>
        {/* Icon */}
        <div style={{
          fontSize: 32,
          lineHeight: 1,
          filter: 'drop-shadow(0 0 8px rgba(232,255,71,0.6))',
        }}>
          {meta.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            color: '#E8FF47',
            textTransform: 'uppercase',
            marginBottom: 2,
            fontFamily: 'var(--font-mono)',
          }}>
            Achievement Unlocked
          </div>
          <div style={{
            fontSize: '0.95rem',
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#fff',
            letterSpacing: '0.05em',
            lineHeight: 1.2,
          }}>
            {meta.name}
          </div>
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: 2,
          }}>
            {meta.desc}
          </div>
        </div>

        {/* Glow bar */}
        <div style={{
          width: 3,
          height: 40,
          background: 'linear-gradient(to bottom, #E8FF47, transparent)',
          borderRadius: 2,
          opacity: 0.7,
        }} />
      </div>
    </div>
  );
}
