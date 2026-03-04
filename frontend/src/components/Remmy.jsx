import { useEffect, useState } from 'react';

const REMMY_STATES = {
  sleeping:  { eyeScale: 0.1,  color: '#444',    tilt: 0,   float: false, glow: false },
  waking:    { eyeScale: 0.5,  color: '#666',    tilt: 8,   float: false, glow: false },
  alert:     { eyeScale: 1.0,  color: '#E8FF47', tilt: 18,  float: true,  glow: false },
  charged:   { eyeScale: 1.0,  color: '#E8FF47', tilt: 15,  float: true,  glow: true  },
  glowing:   { eyeScale: 1.0,  color: '#E8FF47', tilt: 12,  float: true,  glow: true  },
  powerful:  { eyeScale: 1.1,  color: '#E8FF47', tilt: 15,  float: true,  glow: true  },
  legendary: { eyeScale: 1.1,  color: '#FFD700', tilt: 12,  float: true,  glow: true  },
  judging:   { eyeScale: 0.75, color: '#E8FF47', tilt: 28,  float: false, glow: false },
  zoomies:   { eyeScale: 1.2,  color: '#47ff8a', tilt: 6,   float: false, glow: true  },
  blocking:  { eyeScale: 1.0,  color: '#ff6b6b', tilt: 0,   float: false, glow: false },
  happy:     { eyeScale: 1.15, color: '#47ff8a', tilt: 10,  float: true,  glow: true  },
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
  const isJudging = mood === 'judging' || mood === 'sleeping';
  const bodyFill = isLegendary ? '#2a2200' : '#0e0e0e';
  const wingFill = isLegendary ? '#221800' : '#090909';
  const pupilR = blink ? 0.4 : 9 * state.eyeScale;
  const tilt = state.tilt;
  const wingSpread = isHappy ? 12 : 6;

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
        viewBox="0 0 160 200"
        width={size}
        height={size * 1.3}
        style={{ overflow: 'visible' }}
      >
        {/* Crown for legendary */}
        {isLegendary && (
          <>
            <path d="M 54 30 L 60 16 L 80 24 L 100 16 L 106 30"
              fill="none" stroke="#FFD700" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="54" cy="30" r="3" fill="#FFD700" />
            <circle cx="80" cy="24" r="3" fill="#FFD700" />
            <circle cx="106" cy="30" r="3" fill="#FFD700" />
          </>
        )}

        {/* POST */}
        <rect x="68" y="168" width="24" height="30" rx="3"
          fill={isLegendary ? '#2a2200' : '#141414'}
          stroke={isLegendary ? '#FFD700' : '#252525'}
          strokeWidth="1.5"
        />
        <rect x="64" y="165" width="32" height="6" rx="2"
          fill={isLegendary ? '#3a3000' : '#1c1c1c'}
          stroke={isLegendary ? '#FFD700' : '#2a2a2a'}
          strokeWidth="1"
        />

        {/* Feet */}
        {[
          [78, 68, 171], [78, 74, 173], [78, 80, 173], [78, 80, 173],
        ].map((_, i) => null)}
        <line x1="78" y1="165" x2="68" y2="171" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
        <line x1="78" y1="165" x2="74" y2="173" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
        <line x1="78" y1="165" x2="80" y2="173" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
        <line x1="82" y1="165" x2="80" y2="173" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
        <line x1="82" y1="165" x2="86" y2="173" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
        <line x1="82" y1="165" x2="92" y2="171" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>

        {/* BODY */}
        <ellipse cx="80" cy="138" rx="28" ry="34"
          fill={bodyFill} stroke={c} strokeWidth="1.8"
        />

        {/* Wings */}
        <ellipse cx="54" cy="138" rx="14" ry="26"
          fill={wingFill} stroke={c} strokeWidth="1.4"
          transform={`rotate(-${wingSpread} 54 138)`}
        />
        {[120, 130, 140, 150].map((y, i) => (
          <line key={`wl${i}`}
            x1={44 + i} y1={y - 6} x2={56} y2={y}
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.15)`}
            strokeWidth="0.8"
          />
        ))}

        <ellipse cx="106" cy="138" rx="14" ry="26"
          fill={wingFill} stroke={c} strokeWidth="1.4"
          transform={`rotate(${wingSpread} 106 138)`}
        />
        {[120, 130, 140, 150].map((y, i) => (
          <line key={`wr${i}`}
            x1={116 - i} y1={y - 6} x2={104} y2={y}
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.15)`}
            strokeWidth="0.8"
          />
        ))}

        {/* Chest */}
        <ellipse cx="80" cy="140" rx="16" ry="24"
          fill={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.04)`}
          stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.07)`}
          strokeWidth="1"
        />

        {/* Sparkles */}
        {level >= 5 && (
          <>
            <circle cx="14" cy="95" r="2.2" fill={c}
              style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            <circle cx="146" cy="95" r="2.2" fill={c}
              style={{ animation: 'pulse 1.5s ease-in-out infinite 0.5s' }} />
            <circle cx="80" cy="20" r="2.2" fill={c}
              style={{ animation: 'pulse 1.5s ease-in-out infinite 1s' }} />
          </>
        )}

        {/* HEAD GROUP — tilted like barn owl */}
        <g transform={`rotate(${-tilt}, 80, 105)`}
          style={{ transition: 'transform 0.6s ease' }}
        >
          {/* Head base */}
          <ellipse cx="80" cy="80" rx="38" ry="34"
            fill={bodyFill} stroke={c} strokeWidth="1.8"
          />

          {/* HEART-SHAPED FACIAL DISC — barn owl signature */}
          <path d="M 80 52 C 63 50, 44 59, 42 73 C 40 84, 46 93, 57 100 C 64 105, 72 108, 80 109 C 88 108, 96 105, 103 100 C 114 93, 120 84, 118 73 C 116 59, 97 50, 80 52 Z"
            fill={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.04)`}
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.2)`}
            strokeWidth="1.2"
          />
          {/* Disc inner detail lines */}
          <path d="M 55 57 C 44 63, 40 75, 46 87"
            fill="none"
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.12)`}
            strokeWidth="0.8"
          />
          <path d="M 105 57 C 116 63, 120 75, 114 87"
            fill="none"
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.12)`}
            strokeWidth="0.8"
          />

          {/* LEFT EYE — large glassy dark barn owl eye */}
          <circle cx="62" cy="74" r="16"
            fill="#050505" stroke={c} strokeWidth="1.8"
          />
          <circle cx="62" cy="74" r="12"
            fill="#080808"
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.18)`}
            strokeWidth="0.8"
          />
          {/* Iris */}
          <circle cx="62" cy="74" r={9 * state.eyeScale}
            fill={c} opacity={isJudging ? 0.5 : 0.9}
            style={{ transition: 'r 0.15s', transformOrigin: '62px 74px' }}
          />
          {/* Deep pupil */}
          <circle cx="62" cy="74" r={blink ? 0.3 : 5}
            fill="#020202"
            style={{ transition: 'r 0.1s' }}
          />
          {/* Judging eyelid */}
          {isJudging && (
            <path d="M 46 74 Q 62 59 78 74"
              fill={bodyFill} stroke="none"
            />
          )}
          {/* Glassy reflections like barn owl photo */}
          <circle cx="67" cy="68" r="3.5" fill="#fff" opacity="0.92" />
          <circle cx="59" cy="70" r="1.4" fill="#fff" opacity="0.5" />
          <circle cx="65" cy="79" r="0.8" fill="#fff" opacity="0.25" />

          {/* RIGHT EYE */}
          <circle cx="98" cy="74" r="16"
            fill="#050505" stroke={c} strokeWidth="1.8"
          />
          <circle cx="98" cy="74" r="12"
            fill="#080808"
            stroke={`rgba(${isLegendary ? '255,215,0' : '232,255,71'},0.18)`}
            strokeWidth="0.8"
          />
          <circle cx="98" cy="74" r={9 * state.eyeScale}
            fill={c} opacity={isJudging ? 0.5 : 0.9}
            style={{ transition: 'r 0.15s', transformOrigin: '98px 74px' }}
          />
          <circle cx="98" cy="74" r={blink ? 0.3 : 5}
            fill="#020202"
            style={{ transition: 'r 0.1s' }}
          />
          {isJudging && (
            <path d="M 82 74 Q 98 59 114 74"
              fill={bodyFill} stroke="none"
            />
          )}
          <circle cx="103" cy="68" r="3.5" fill="#fff" opacity="0.92" />
          <circle cx="95" cy="70" r="1.4" fill="#fff" opacity="0.5" />
          <circle cx="101" cy="79" r="0.8" fill="#fff" opacity="0.25" />

          {/* BEAK — small hooked barn owl beak */}
          <path d="M 80 84 L 76 92 Q 80 96 84 92 Z"
            fill={c} opacity="0.8"
            stroke={c} strokeWidth="0.4"
          />

          {/* Happy smile */}
          {isHappy && (
            <path d="M 72 97 Q 80 104 88 97"
              fill="none" stroke={c}
              strokeWidth="1.5" strokeLinecap="round" opacity="0.55"
            />
          )}
        </g>
      </svg>
    </div>
  );
}