const MOODS = {
  sleeping:  { tilt: 0,   filter: 'brightness(0.3) saturate(0)',                    float: false, glow: 'none' },
  waking:    { tilt: 5,   filter: 'brightness(0.6) saturate(0.5)',                  float: false, glow: 'none' },
  alert:     { tilt: 18,  filter: 'brightness(1) saturate(1)',                      float: true,  glow: '0 0 30px rgba(232,255,71,0.6)' },
  charged:   { tilt: 15,  filter: 'brightness(1.1) saturate(1.2)',                  float: true,  glow: '0 0 40px rgba(232,255,71,0.7)' },
  glowing:   { tilt: 12,  filter: 'brightness(1.2) saturate(1.3)',                  float: true,  glow: '0 0 50px rgba(232,255,71,0.8)' },
  powerful:  { tilt: 15,  filter: 'brightness(1.3) saturate(1.4)',                  float: true,  glow: '0 0 60px rgba(232,255,71,0.9)' },
  legendary: { tilt: 12,  filter: 'brightness(1.3) sepia(1) saturate(3) hue-rotate(5deg)', float: true, glow: '0 0 60px rgba(255,215,0,0.9)' },
  judging:   { tilt: 30,  filter: 'brightness(0.85) saturate(0.8)',                 float: false, glow: 'none' },
  zoomies:   { tilt: 6,   filter: 'brightness(1.2) saturate(2) hue-rotate(80deg)', float: false, glow: '0 0 40px rgba(71,255,138,0.8)' },
  blocking:  { tilt: 0,   filter: 'brightness(1) sepia(1) saturate(3) hue-rotate(300deg)', float: false, glow: '0 0 30px rgba(255,107,107,0.6)' },
  happy:     { tilt: 10,  filter: 'brightness(1.2) saturate(2) hue-rotate(80deg)', float: true,  glow: '0 0 50px rgba(71,255,138,0.8)' },
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
  const mood = forcedMood || getMoodFromStage(stage, level);
  const state = MOODS[mood] || MOODS.alert;

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      animation: mood === 'zoomies'
        ? 'zoomies 0.5s ease-in-out infinite'
        : state.float ? 'float 3s ease-in-out infinite' : 'none',
      transition: 'all 0.5s ease',
    }}>
      <img
        src="/remmy.png"
        alt="Remmy"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          transform: `rotate(${state.tilt}deg)`,
          filter: state.filter,
          borderRadius: size * 0.22,
          boxShadow: state.glow,
          transition: 'transform 0.6s ease, filter 0.5s ease, box-shadow 0.5s ease',
        }}
      />
    </div>
  );
}