const STAGES = [
  'intake', 'narrowing', 'gut_check', 'resistance',
  'anxiety_analysis', 'deadline', 'committed', 'implementation', 'checkin'
];

const STAGE_LABELS = {
  intake:           'Decision',
  narrowing:        'Eliminate',
  gut_check:        '60-Sec Gut',
  resistance:       'Fears',
  anxiety_analysis: 'Truth Check',
  deadline:         'Deadline',
  committed:        'Committed',
  implementation:   'First Action',
  checkin:          'Accountability',
};

export default function ProgressBar({ stage }) {
  const idx = STAGES.indexOf(stage);
  const pct = (idx / (STAGES.length - 1)) * 100;

  return (
    <div>
      <div style={{
        height: 2, background: '#111',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: 'var(--yellow)',
          width: `${pct}%`, transition: 'width 0.6s ease',
          boxShadow: '0 0 8px var(--yellow-glow)',
        }} />
      </div>
      <div style={{
        padding: '6px 1.5rem',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {STAGE_LABELS[stage]}
        </span>
        <span style={{
          fontSize: '0.65rem', color: 'var(--yellow)',
          background: 'rgba(232,255,71,0.08)',
          padding: '2px 8px', borderRadius: 10,
          border: '1px solid rgba(232,255,71,0.15)',
        }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}