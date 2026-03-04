import { useEffect, useState } from 'react';

const REMMY_STATES = {
  sleeping:  { eyeScale: 0.3, color: '#555',    tail: 'none',     float: false, glow: false  },
  waking:    { eyeScale: 0.6, color: '#888',    tail: 'slow',     float: false, glow: false  },
  alert:     { eyeScale: 1.0, color: '#ccc',    tail: 'medium',   float: true,  glow: false  },
  charged:   { eyeScale: 1.0, color: '#E8FF47', tail: 'fast',     float: true,  glow: true   },
  glowing:   { eyeScale: 1.1, color: '#E8FF47', tail: 'fast',     float: true,  glow: true   },
  powerful:  { eyeScale: 1.2, color: '#E8FF47', tail: 'fast',     float: true,  glow: true   },
  legendary: { eyeScale: 1.3, color: '#FFD700', tail: 'fast',     float: true,  glow: true   },
  judging:   { eyeScale: 0.8, color: '#E8FF47', tail: 'slow',     float: false, glow: false  },
  zoomies:   { eyeScale: 1.2, color: '#47ff8a', tail: 'fast',     float: false, glow: true   },
  blocking:  { eyeScale: 1.0, color: '#ff6b6b', tail: 'none',     float: false, glow: false  },
  happy:     { eyeScale: 1.1, color: '#47ff8a', tail: 'fast',     float: true,  glow: true   },
};

const getMoodFromStage = (stage, level) => {
  const moodMap = {
    intake:           'judging',
    narrowing:        'alert',
    gut_check:        'alert',
    resistance:       'judging',
    anxiety_analysis: 'charged',
    deadline:         'charged',
    committed:        'happy',
    implementation:   'glowing',
    checkin:          'alert',
  };
  if (level >= 7) return 'legendary';
  if (level >= 6) return 'powerful';
  return moodMap[stage] || 'alert';
};

export default function Remmy({ stage = 'intake', level = 1, mood: forcedMood = null, size = 120 }) {
  const [blink, setBlink] = useState(false);
  const mood = forcedMood || getMoodFromStage(stage, level);
  const state = REMMY_STATES[mood] || REMMY_STATES.alert;

  // Random blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, Math.random() * 3000 + 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const s = size;
  const eyeY = blink ? 0.1 : state.eyeScale;

  return (
    <div style={{
      width: s, height: s,
      position: 'relative',
      animation: mood === 'zoomies'
        ? 'zoomies 0.5s ease-in-out infinite'
        : state.float ? 'float 3s ease-in-out infinite' : 'none',
      filter: state.glow
        ? `drop-shadow(0 0 ${s * 0.15}px ${state.color})`
        : 'none',
      transition: 'filter 0.5s ease',
    }}>
      <svg
        viewBox="0 0 100 100"
        width={s} height={s}
        style={{ overflow: 'visible' }}
      >
        {/* Tail */}
        <path
          d="M 30 78 Q 10 85 15 95 Q 20 105 35 90"
          fill="none"
          stroke={state.color}
          strokeWidth="5"
          strokeLinecap="round"
          style={{
            transformOrigin: '30px 78px',
            animation: state.tail === 'fast'
              ? 'tailWag 0.4s ease-in-out infinite'
              : state.tail === 'medium'
              ? 'tailWag 0.8s ease-in-out infinite'
              : state.tail === 'slow'
              ? 'tailWag 2s ease-in-out infinite'
              : 'none',
            opacity: 0.8,
          }}
        />

        {/* Body */}
        <ellipse cx="50" cy="70" rx="28" ry="22"
          fill={state.color === '#FFD700' ? '#2a2200' : '#111'}
          stroke={state.color} strokeWidth="2"
        />

        {/* Head */}
        <circle cx="50" cy="42" r="28"
          fill={state.color === '#FFD700' ? '#2a2200' : '#111'}
          stroke={state.color} strokeWidth="2"
        />

        {/* Left ear */}
        <polygon points="24,20 18,4 34,16"
          fill={state.color === '#FFD700' ? '#2a2200' : '#111'}
          stroke={state.color} strokeWidth="2"
        />
        {/* Left ear inner */}
        <polygon points="25,18 21,8 31,17"
          fill={state.color}
          opacity="0.3"
        />

        {/* Right ear */}
        <polygon points="76,20 82,4 66,16"
          fill={state.color === '#FFD700' ? '#2a2200' : '#111'}
          stroke={state.color} strokeWidth="2"
        />
        {/* Right ear inner */}
        <polygon points="75,18 79,8 69,17"
          fill={state.color}
          opacity="0.3"
        />

        {/* Left eye white */}
        <ellipse cx="38" cy="42" rx="8" ry={8 * eyeY}
          fill="#1a1a1a"
          stroke={state.color} strokeWidth="1.5"
          style={{ transition: 'ry 0.1s' }}
        />
        {/* Left pupil */}
        <ellipse cx="39" cy="43" rx="4" ry={4 * eyeY}
          fill={state.color}
          opacity="0.9"
          style={{ transition: 'ry 0.1s' }}
        />
        {/* Left eye shine */}
        <circle cx="41" cy="40" r="1.5" fill="#fff" opacity="0.8" />

        {/* Right eye white */}
        <ellipse cx="62" cy="42" rx="8" ry={8 * eyeY}
          fill="#1a1a1a"
          stroke={state.color} strokeWidth="1.5"
          style={{ transition: 'ry 0.1s' }}
        />
        {/* Right pupil */}
        <ellipse cx="63" cy="43" rx="4" ry={4 * eyeY}
          fill={state.color}
          opacity="0.9"
          style={{ transition: 'ry 0.1s' }}
        />
        {/* Right eye shine */}
        <circle cx="65" cy="40" r="1.5" fill="#fff" opacity="0.8" />

        {/* Nose */}
        <polygon points="50,52 47,55 53,55"
          fill={state.color}
          opacity="0.7"
        />

        {/* Mouth — changes with mood */}
        {(mood === 'happy' || mood === 'zoomies' || mood === 'legendary') ? (
          <path d="M 44 57 Q 50 63 56 57"
            fill="none" stroke={state.color}
            strokeWidth="1.5" strokeLinecap="round"
            opacity="0.7"
          />
        ) : mood === 'blocking' ? (
          <path d="M 44 60 Q 50 56 56 60"
            fill="none" stroke={state.color}
            strokeWidth="1.5" strokeLinecap="round"
            opacity="0.7"
          />
        ) : (
          <path d="M 45 58 Q 50 60 55 58"
            fill="none" stroke={state.color}
            strokeWidth="1.5" strokeLinecap="round"
            opacity="0.5"
          />
        )}

        {/* Whiskers left */}
        <line x1="20" y1="52" x2="38" y2="54" stroke={state.color} strokeWidth="1" opacity="0.4"/>
        <line x1="20" y1="56" x2="38" y2="56" stroke={state.color} strokeWidth="1" opacity="0.4"/>

        {/* Whiskers right */}
        <line x1="80" y1="52" x2="62" y2="54" stroke={state.color} strokeWidth="1" opacity="0.4"/>
        <line x1="80" y1="56" x2="62" y2="56" stroke={state.color} strokeWidth="1" opacity="0.4"/>

        {/* Level sparkles for high levels */}
        {level >= 5 && (
          <>
            <circle cx="15" cy="25" r="2" fill={state.color} opacity="0.6"
              style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            <circle cx="85" cy="25" r="2" fill={state.color} opacity="0.6"
              style={{ animation: 'pulse 1.5s ease-in-out infinite 0.5s' }} />
            <circle cx="50" cy="10" r="2" fill={state.color} opacity="0.6"
              style={{ animation: 'pulse 1.5s ease-in-out infinite 1s' }} />
          </>
        )}

        {/* Crown for legendary */}
        {level >= 7 && (
          <path d="M 30 22 L 35 12 L 50 18 L 65 12 L 70 22"
            fill="none" stroke="#FFD700" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}