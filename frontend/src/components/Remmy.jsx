import { useEffect, useState } from 'react';

const REMMY_STATES = {
  sleeping:  { eyeScale: 0.15, color: '#444',    wings: 'closed',  float: false, glow: false  },
  waking:    { eyeScale: 0.5,  color: '#666',    wings: 'closed',  float: false, glow: false  },
  alert:     { eyeScale: 1.0,  color: '#E8FF47', wings: 'normal',  float: true,  glow: false  },
  charged:   { eyeScale: 1.1,  color: '#E8FF47', wings: 'spread',  float: true,  glow: true   },
  glowing:   { eyeScale: 1.1,  color: '#E8FF47', wings: 'spread',  float: true,  glow: true   },
  powerful:  { eyeScale: 1.2,  color: '#E8FF47', wings: 'spread',  float: true,  glow: true   },
  legendary: { eyeScale: 1.3,  color: '#FFD700', wings: 'spread',  float: true,  glow: true   },
  judging:   { eyeScale: 0.4,  color: '#888',    wings: 'normal',  float: false, glow: false  },
  zoomies:   { eyeScale: 1.2,  color: '#47ff8a', wings: 'spread',  float: false, glow: true   },
  blocking:  { eyeScale: 1.0,  color: '#ff6b6b', wings: 'spread',  float: false, glow: false  },
  happy:     { eyeScale: 1.2,  color: '#47ff8a', wings: 'spread',  float: true,  glow: true   },
};

const getMoodFromStage = (stage, level) => {
  if (level >= 7) return 'legendary';
  if (level >= 6) return 'powerful';
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
  return moodMap[stage] || 'alert';
};

export default function Remmy({ stage = 'intake', level = 1, mood: forcedMood = null, size = 120 }) {
  const [blink, setBlink] = useState(false);
  const mood = forcedMood || getMoodFromStage(stage, level);
  const state = REMMY_STATES[mood] || REMMY_STATES.alert;

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 3000 + 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const s = size;
  const eyeRy = blink ? 0.5 : 11 * state.eyeScale;
  const pupilRy = blink ? 0.3 : 5 * state.eyeScale;
  const c = state.color;
  const isLegendary = mood === 'legendary';
  const bodyFill = isLegendary ? '#2a2200' : '#111';
  const wingAngle = state.wings === 'spread' ? 20 : 15;

  return (
    <div style={{
      width: s,
      height: s * 1.2,
      position: 'relative',
      animation: mood === 'zoomies'
        ? 'zoomies 0.5s ease-in-out infinite'
        : state.float ? 'float 3s ease-in-out infinite' : 'none',
      filter: state.glow
        ? `drop-shadow(0 0 ${s * 0.12}px ${c})`
        : 'none',
      transition: 'filter 0.5s ease',
    }}>
      <svg
        viewBox="0 0 100 120"
        width={s}
        height={s * 1.2}
        style={{ overflow: 'visible' }}
      >
        {/* Crown for legendary */}
        {isLegendary && (
          <path d="M 28 22 L 33 8 L 50 16 L 67 8 L 72 22"
            fill="none" stroke="#FFD700" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        )}

        {/* Wings */}
        <ellipse cx="18" cy="75" rx="14" ry="22"
          fill={bodyFill} stroke={c} strokeWidth="1.5"
          transform={`rotate(-${wingAngle} 18 75)`}
        />
        <ellipse cx="82" cy="75" rx="14" ry="22"
          fill={bodyFill} stroke={c} strokeWidth="1.5"
          transform={`rotate(${wingAngle} 82 75)`}
        />

        {/* Body */}
        <ellipse cx="50" cy="80" rx="26" ry="30"
          fill={bodyFill} stroke={c} strokeWidth="1.5"
        />

        {/* Chest feather rings */}
        <ellipse cx="50" cy="85" rx="16" ry="20"
          fill={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.05)`}
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.12)`}
          strokeWidth="1"
        />
        <ellipse cx="50" cy="91" rx="9" ry="12"
          fill={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.04)`}
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.08)`}
          strokeWidth="0.5"
        />

        {/* Head */}
        <ellipse cx="50" cy="44" rx="28" ry="26"
          fill={bodyFill} stroke={c} strokeWidth="1.5"
        />

        {/* Ear tufts — sharp and angular */}
        <polygon points="28,22 22,4 36,18"
          fill={bodyFill} stroke={c} strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon points="72,22 78,4 64,18"
          fill={bodyFill} stroke={c} strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Facial disc */}
        <ellipse cx="50" cy="46" rx="22" ry="20"
          fill="none"
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.18)`}
          strokeWidth="1"
        />

        {/* Left eye socket */}
        <ellipse cx="37" cy="42" rx="10" ry="11"
          fill="#0a0a0a" stroke={c} strokeWidth="1.5"
        />
        {/* Left iris glow */}
        <ellipse cx="37" cy="42" rx="7" ry={7 * state.eyeScale}
          fill={c} opacity="0.15"
          style={{ transition: 'ry 0.1s' }}
        />
        {/* Left pupil */}
        <ellipse cx="37" cy="43" rx="4.5" ry={pupilRy}
          fill={c}
          style={{ transition: 'ry 0.1s' }}
        />
        {/* Judging eyelid */}
        {mood === 'judging' && (
          <rect x="27" y="31" width="20" height="9" fill={bodyFill} />
        )}
        {/* Left shine */}
        <circle cx="39.5" cy="39.5" r="1.8" fill="#fff" opacity="0.9" />
        <circle cx="35" cy="44" r="0.7" fill="#fff" opacity="0.35" />

        {/* Right eye socket */}
        <ellipse cx="63" cy="42" rx="10" ry="11"
          fill="#0a0a0a" stroke={c} strokeWidth="1.5"
        />
        {/* Right iris glow */}
        <ellipse cx="63" cy="42" rx="7" ry={7 * state.eyeScale}
          fill={c} opacity="0.15"
          style={{ transition: 'ry 0.1s' }}
        />
        {/* Right pupil */}
        <ellipse cx="63" cy="43" rx="4.5" ry={pupilRy}
          fill={c}
          style={{ transition: 'ry 0.1s' }}
        />
        {/* Judging eyelid */}
        {mood === 'judging' && (
          <rect x="53" y="31" width="20" height="9" fill={bodyFill} />
        )}
        {/* Right shine */}
        <circle cx="65.5" cy="39.5" r="1.8" fill="#fff" opacity="0.9" />
        <circle cx="61" cy="44" r="0.7" fill="#fff" opacity="0.35" />

        {/* Beak — sharp downward triangle */}
        <polygon points="50,52 45.5,59 54.5,59"
          fill={c} opacity="0.85"
        />
        <line x1="50" y1="52" x2="50" y2="59"
          stroke="#0a0a0a" strokeWidth="0.6"
        />

        {/* Happy mouth curve */}
        {(mood === 'happy' || mood === 'zoomies' || mood === 'legendary') && (
          <path d="M 46 60 Q 50 64 54 60"
            fill="none" stroke={c}
            strokeWidth="1.2" strokeLinecap="round"
            opacity="0.6"
          />
        )}

        {/* Talons */}
        {['left', 'right'].map((side, si) => {
          const base = si === 0 ? 38 : 54;
          return [0, 1, 2].map((t, ti) => (
            <line
              key={`${side}-${t}`}
              x1={base + ti * 4} y1={108}
              x2={base + ti * 4 + (si === 0 ? -2 + ti * 2 : ti * 2)} y2={116}
              stroke={c} strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.8"
            />
          ));
        })}

        {/* Sparkles for high levels */}
        {level >= 5 && (
          <>
            <circle cx="12" cy="28" r="2" fill={c} opacity="0.7"
              style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            <circle cx="88" cy="28" r="2" fill={c} opacity="0.7"
              style={{ animation: 'pulse 1.5s ease-in-out infinite 0.5s' }} />
            <circle cx="50" cy="6" r="2" fill={c} opacity="0.7"
              style={{ animation: 'pulse 1.5s ease-in-out infinite 1s' }} />
          </>
        )}
      </svg>
    </div>
  );
}