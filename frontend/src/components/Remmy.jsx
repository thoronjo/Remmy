import { useEffect, useState } from 'react';

const REMMY_STATES = {
  sleeping:  { eyeScale: 0.1,  color: '#444',    wingSpread: 8,   float: false, glow: false },
  waking:    { eyeScale: 0.5,  color: '#666',    wingSpread: 8,   float: false, glow: false },
  alert:     { eyeScale: 1.0,  color: '#E8FF47', wingSpread: 8,   float: true,  glow: false },
  charged:   { eyeScale: 1.0,  color: '#E8FF47', wingSpread: 12,  float: true,  glow: true  },
  glowing:   { eyeScale: 1.0,  color: '#E8FF47', wingSpread: 12,  float: true,  glow: true  },
  powerful:  { eyeScale: 1.1,  color: '#E8FF47', wingSpread: 15,  float: true,  glow: true  },
  legendary: { eyeScale: 1.1,  color: '#FFD700', wingSpread: 15,  float: true,  glow: true  },
  judging:   { eyeScale: 0.35, color: '#777',    wingSpread: 8,   float: false, glow: false },
  zoomies:   { eyeScale: 1.2,  color: '#47ff8a', wingSpread: 20,  float: false, glow: true  },
  blocking:  { eyeScale: 1.0,  color: '#ff6b6b', wingSpread: 8,   float: false, glow: false },
  happy:     { eyeScale: 1.1,  color: '#47ff8a', wingSpread: 20,  float: true,  glow: true  },
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

  const c = state.color;
  const isLegendary = mood === 'legendary';
  const isHappy = mood === 'happy' || mood === 'zoomies' || mood === 'legendary';
  const isJudging = mood === 'judging' || mood === 'sleeping' || mood === 'waking';
  const bodyFill = isLegendary ? '#2a2200' : '#111';
  const w = state.wingSpread;

  // Pupil size based on mood
  const pupilR = blink ? 0.5 : 7 * state.eyeScale;
  const eyeOuterR = 14;

  return (
    <div style={{
      width: size,
      height: size * 1.25,
      position: 'relative',
      animation: mood === 'zoomies'
        ? 'zoomies 0.5s ease-in-out infinite'
        : state.float ? 'float 3s ease-in-out infinite' : 'none',
      filter: state.glow
        ? `drop-shadow(0 0 ${size * 0.1}px ${c})`
        : 'none',
      transition: 'filter 0.5s ease',
    }}>
      <svg
        viewBox="0 0 120 150"
        width={size}
        height={size * 1.25}
        style={{ overflow: 'visible' }}
      >
        {/* Crown for legendary */}
        {isLegendary && (
          <>
            <path d="M 36 22 L 42 8 L 60 16 L 78 8 L 84 22"
              fill="none" stroke="#FFD700" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="36" cy="22" r="2.5" fill="#FFD700" />
            <circle cx="60" cy="16" r="2.5" fill="#FFD700" />
            <circle cx="84" cy="22" r="2.5" fill="#FFD700" />
          </>
        )}

        {/* Branch / perch */}
        <rect x="5" y="128" width="110" height="10" rx="5"
          fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1"
        />

        {/* Tail feathers below branch */}
        <ellipse cx="45" cy="140" rx="5.5" ry="11"
          fill={bodyFill} stroke={c} strokeWidth="1"
          transform="rotate(-10 45 135)" opacity="0.7"
        />
        <ellipse cx="60" cy="142" rx="5.5" ry="12"
          fill={bodyFill} stroke={c} strokeWidth="1" opacity="0.7"
        />
        <ellipse cx="75" cy="140" rx="5.5" ry="11"
          fill={bodyFill} stroke={c} strokeWidth="1"
          transform="rotate(10 75 135)" opacity="0.7"
        />

        {/* Feet gripping branch — left */}
        {[[-8, 0], [-2, 9], [4, 9], [10, 7]].map(([dx, dy], i) => (
          <line key={`lf${i}`}
            x1="44" y1="122"
            x2={44 + dx} y2={122 + dy}
            stroke={c} strokeWidth="2.2" strokeLinecap="round" opacity="0.85"
          />
        ))}
        {/* Feet gripping branch — right */}
        {[[-10, 7], [-4, 9], [2, 9], [8, 0]].map(([dx, dy], i) => (
          <line key={`rf${i}`}
            x1="76" y1="122"
            x2={76 + dx} y2={122 + dy}
            stroke={c} strokeWidth="2.2" strokeLinecap="round" opacity="0.85"
          />
        ))}

        {/* Wings */}
        <ellipse cx="26" cy="93" rx="12" ry="24"
          fill={isLegendary ? '#221800' : '#0f0f0f'}
          stroke={c} strokeWidth="1.5"
          transform={`rotate(-${w} 26 93)`}
        />
        {/* Wing feather texture left */}
        {[82, 90, 98, 106].map((y, i) => (
          <line key={`wl${i}`}
            x1={20 + i} y1={y - 6}
            x2={30} y2={y}
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.18)`}
            strokeWidth="0.8"
          />
        ))}

        <ellipse cx="94" cy="93" rx="12" ry="24"
          fill={isLegendary ? '#221800' : '#0f0f0f'}
          stroke={c} strokeWidth="1.5"
          transform={`rotate(${w} 94 93)`}
        />
        {/* Wing feather texture right */}
        {[82, 90, 98, 106].map((y, i) => (
          <line key={`wr${i}`}
            x1={100 - i} y1={y - 6}
            x2={90} y2={y}
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.18)`}
            strokeWidth="0.8"
          />
        ))}

        {/* Body — round and plump */}
        <ellipse cx="60" cy="95" rx="34" ry="32"
          fill={bodyFill} stroke={c} strokeWidth="2"
        />

        {/* Chest belly */}
        <ellipse cx="60" cy="100" rx="20" ry="22"
          fill={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.04)`}
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.1)`}
          strokeWidth="1"
        />
        {/* Chest feather arcs */}
        {[88, 96, 104].map((y, i) => (
          <path key={`cf${i}`}
            d={`M ${48 - i} ${y} Q 60 ${y + 4} ${72 + i} ${y}`}
            fill="none"
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},${0.15 - i * 0.04})`}
            strokeWidth="0.8"
          />
        ))}

        {/* HEAD — big round */}
        <circle cx="60" cy="55" r="36"
          fill={bodyFill} stroke={c} strokeWidth="2"
        />

        {/* Ear tufts — sharp angular */}
        <polygon points="38,26 30,8 48,22"
          fill={bodyFill} stroke={c} strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line x1="37" y1="24" x2="33" y2="12"
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.3)`}
          strokeWidth="0.8"
        />
        <polygon points="82,26 90,8 72,22"
          fill={bodyFill} stroke={c} strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line x1="83" y1="24" x2="87" y2="12"
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.3)`}
          strokeWidth="0.8"
        />

        {/* Facial disc */}
        <ellipse cx="60" cy="57" rx="28" ry="26"
          fill={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.03)`}
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.18)`}
          strokeWidth="1.2"
        />

        {/* Eyebrow ridges */}
        <path
          d={isJudging
            ? "M 33 38 Q 42 32 50 36"
            : isHappy
            ? "M 34 35 Q 42 29 50 33"
            : "M 34 37 Q 42 33 50 36"}
          fill="none" stroke={c} strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d={isJudging
            ? "M 87 38 Q 78 32 70 36"
            : isHappy
            ? "M 86 35 Q 78 29 70 33"
            : "M 86 37 Q 78 33 70 36"}
          fill="none" stroke={c} strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* LEFT EYE */}
        <circle cx="46" cy="52" r={eyeOuterR}
          fill="#0a0a0a" stroke={c} strokeWidth="1.8"
        />
        {/* Iris glow */}
        <circle cx="46" cy="52" r="10"
          fill={c} opacity="0.1"
        />
        {/* Pupil */}
        <circle cx="46" cy="53" r={pupilR}
          fill={c}
          style={{ transition: 'r 0.1s', transformOrigin: '46px 53px' }}
        />
        {/* Judging eyelid */}
        {isJudging && (
          <path d="M 32 52 Q 46 40 60 52"
            fill={bodyFill} stroke="none"
          />
        )}
        {/* Shine */}
        <circle cx="50" cy="47.5" r="3.5" fill="#fff" opacity="0.95" />
        <circle cx="42" cy="55" r="1.2" fill="#fff" opacity="0.4" />

        {/* RIGHT EYE */}
        <circle cx="74" cy="52" r={eyeOuterR}
          fill="#0a0a0a" stroke={c} strokeWidth="1.8"
        />
        <circle cx="74" cy="52" r="10"
          fill={c} opacity="0.1"
        />
        <circle cx="74" cy="53" r={pupilR}
          fill={c}
          style={{ transition: 'r 0.1s', transformOrigin: '74px 53px' }}
        />
        {isJudging && (
          <path d="M 60 52 Q 74 40 88 52"
            fill={bodyFill} stroke="none"
          />
        )}
        <circle cx="78" cy="47.5" r="3.5" fill="#fff" opacity="0.95" />
        <circle cx="70" cy="55" r="1.2" fill="#fff" opacity="0.4" />

        {/* BEAK */}
        <polygon points="60,60 55,67 65,67"
          fill={c} opacity="0.85"
        />
        <line x1="60" y1="60" x2="60" y2="67"
          stroke="#080808" strokeWidth="0.8"
        />

        {/* Happy smile below beak */}
        {isHappy && (
          <path d="M 54 68 Q 60 74 66 68"
            fill="none" stroke={c}
            strokeWidth="1.5" strokeLinecap="round" opacity="0.65"
          />
        )}

        {/* Sparkles for high levels */}
        {level >= 5 && (
          <>
            <circle cx="10" cy="32" r="2.2" fill={c}
              style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            <circle cx="110" cy="32" r="2.2" fill={c}
              style={{ animation: 'pulse 1.5s ease-in-out infinite 0.5s' }} />
            <circle cx="60" cy="10" r="2.2" fill={c}
              style={{ animation: 'pulse 1.5s ease-in-out infinite 1s' }} />
          </>
        )}
      </svg>
    </div>
  );
}