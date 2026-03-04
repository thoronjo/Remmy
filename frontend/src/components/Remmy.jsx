import { useEffect, useState } from 'react';

const REMMY_STATES = {
  sleeping:  { eyeScale: 0.1,  color: '#555',    tilt: 0,    float: false, glow: false },
  waking:    { eyeScale: 0.5,  color: '#888',    tilt: 5,    float: false, glow: false },
  alert:     { eyeScale: 1.0,  color: '#E8FF47', tilt: 12,   float: true,  glow: false },
  charged:   { eyeScale: 1.0,  color: '#E8FF47', tilt: 15,   float: true,  glow: true  },
  glowing:   { eyeScale: 1.0,  color: '#E8FF47', tilt: 12,   float: true,  glow: true  },
  powerful:  { eyeScale: 1.1,  color: '#E8FF47', tilt: 18,   float: true,  glow: true  },
  legendary: { eyeScale: 1.1,  color: '#FFD700', tilt: 15,   float: true,  glow: true  },
  judging:   { eyeScale: 0.8,  color: '#E8FF47', tilt: 20,   float: false, glow: false },
  zoomies:   { eyeScale: 1.2,  color: '#47ff8a', tilt: 8,    float: false, glow: true  },
  blocking:  { eyeScale: 1.0,  color: '#ff6b6b', tilt: 0,    float: false, glow: false },
  happy:     { eyeScale: 1.1,  color: '#47ff8a', tilt: 10,   float: true,  glow: true  },
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
    const iv = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, Math.random() * 3000 + 2000);
    return () => clearInterval(iv);
  }, []);

  const c = state.color;
  const isLegendary = mood === 'legendary';
  const isHappy = mood === 'happy' || mood === 'zoomies' || mood === 'legendary';
  const bodyFill = isLegendary ? '#2a2200' : '#0d0d0d';
  const discFill = isLegendary ? '#3a2800' : '#161616';
  const pupilR = blink ? 0.4 : 4.5 * state.eyeScale;
  const tilt = state.tilt;

  return (
    <div style={{
      width: size,
      height: size * 1.3,
      position: 'relative',
      animation: mood === 'zoomies'
        ? 'zoomies 0.5s ease-in-out infinite'
        : state.float ? 'float 3s ease-in-out infinite' : 'none',
      filter: state.glow
        ? `drop-shadow(0 0 ${size * 0.12}px ${c})`
        : 'none',
      transition: 'filter 0.5s ease',
    }}>
      <svg
        viewBox="0 0 100 130"
        width={size}
        height={size * 1.3}
        style={{ overflow: 'visible' }}
      >
        {/* Crown for legendary */}
        {isLegendary && (
          <>
            <path d="M 30 18 L 36 6 L 50 13 L 64 6 L 70 18"
              fill="none" stroke="#FFD700" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="30" cy="18" r="2" fill="#FFD700" />
            <circle cx="50" cy="13" r="2" fill="#FFD700" />
            <circle cx="70" cy="18" r="2" fill="#FFD700" />
          </>
        )}

        {/* POST — single flat-top post like the photo */}
        <rect x="40" y="118" width="20" height="12" rx="2"
          fill="#141414" stroke="#222" strokeWidth="1"
        />
        {/* Post top cap */}
        <rect x="38" y="116" width="24" height="4" rx="1"
          fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.5"
        />

        {/* FEET on post */}
        {/* Left foot */}
        <line x1="46" y1="116" x2="40" y2="120" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
        <line x1="46" y1="116" x2="44" y2="121" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
        <line x1="46" y1="116" x2="48" y2="121" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
        {/* Right foot */}
        <line x1="54" y1="116" x2="52" y2="121" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
        <line x1="54" y1="116" x2="56" y2="121" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
        <line x1="54" y1="116" x2="60" y2="120" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>

        {/* BODY — slim upright like barn owl */}
        <ellipse cx="50" cy="95" rx="20" ry="26"
          fill={bodyFill} stroke={c} strokeWidth="1.5"
        />

        {/* Wing texture left */}
        <ellipse cx="32" cy="98" rx="10" ry="20"
          fill={isLegendary ? '#221800' : '#0a0a0a'}
          stroke={c} strokeWidth="1.2"
          transform="rotate(-5 32 98)"
          opacity="0.9"
        />
        {[88, 95, 102, 109].map((y, i) => (
          <line key={`wl${i}`}
            x1={26 + i} y1={y - 5}
            x2={34} y2={y}
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.15)`}
            strokeWidth="0.7"
          />
        ))}

        {/* Wing texture right */}
        <ellipse cx="68" cy="98" rx="10" ry="20"
          fill={isLegendary ? '#221800' : '#0a0a0a'}
          stroke={c} strokeWidth="1.2"
          transform="rotate(5 68 98)"
          opacity="0.9"
        />
        {[88, 95, 102, 109].map((y, i) => (
          <line key={`wr${i}`}
            x1={74 - i} y1={y - 5}
            x2={66} y2={y}
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.15)`}
            strokeWidth="0.7"
          />
        ))}

        {/* Chest lighter belly */}
        <ellipse cx="50" cy="98" rx="12" ry="18"
          fill={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.05)`}
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.08)`}
          strokeWidth="1"
        />

        {/* HEAD GROUP — tilted like barn owl in photo */}
        <g transform={`rotate(${-tilt} 50 65)`}
          style={{ transformOrigin: '50px 75px', transition: 'transform 0.5s ease' }}
        >
          {/* HEAD — slightly oval */}
          <ellipse cx="50" cy="52" rx="26" ry="24"
            fill={bodyFill} stroke={c} strokeWidth="1.5"
          />

          {/* HEART-SHAPED FACIAL DISC — barn owl's signature */}
          {/* Outer disc border */}
          <path
            d="M 50 32 C 38 30 24 38 24 50 C 24 62 34 70 50 74 C 66 70 76 62 76 50 C 76 38 62 30 50 32 Z"
            fill="none"
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.25)`}
            strokeWidth="1.2"
          />
          {/* Inner disc — the white heart face */}
          <path
            d="M 50 35 C 40 33 28 40 28 51 C 28 61 37 68 50 71 C 63 68 72 61 72 51 C 72 40 60 33 50 35 Z"
            fill={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.04)`}
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.15)`}
            strokeWidth="0.8"
          />

          {/* LEFT EYE — small dark intense like barn owl */}
          <circle cx="40" cy="50" r="7"
            fill="#080808" stroke={c} strokeWidth="1.4"
          />
          {/* Subtle iris */}
          <circle cx="40" cy="50" r="5"
            fill={c} opacity="0.08"
          />
          {/* Pupil — dark and deep */}
          <circle cx="40" cy="50.5" r={pupilR}
            fill={c}
            style={{ transition: 'r 0.1s' }}
          />
          {/* Single sharp shine */}
          <circle cx="42.5" cy="47.5" r="2" fill="#fff" opacity="0.95" />

          {/* RIGHT EYE */}
          <circle cx="60" cy="50" r="7"
            fill="#080808" stroke={c} strokeWidth="1.4"
          />
          <circle cx="60" cy="50" r="5"
            fill={c} opacity="0.08"
          />
          <circle cx="60" cy="50.5" r={pupilR}
            fill={c}
            style={{ transition: 'r 0.1s' }}
          />
          <circle cx="62.5" cy="47.5" r="2" fill="#fff" opacity="0.95" />

          {/* BEAK — small hooked, between and below eyes */}
          <path d="M 50 56 L 47 61 Q 50 63 53 61 Z"
            fill={c} opacity="0.8"
          />

          {/* Happy expression */}
          {isHappy && (
            <path d="M 45 64 Q 50 68 55 64"
              fill="none" stroke={c}
              strokeWidth="1.2" strokeLinecap="round" opacity="0.5"
            />
          )}

          {/* Sparkles for high levels */}
          {level >= 5 && (
            <>
              <circle cx="22" cy="40" r="1.8" fill={c}
                style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              <circle cx="78" cy="40" r="1.8" fill={c}
                style={{ animation: 'pulse 1.5s ease-in-out infinite 0.5s' }} />
              <circle cx="50" cy="22" r="1.8" fill={c}
                style={{ animation: 'pulse 1.5s ease-in-out infinite 1s' }} />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}