import { useEffect, useRef, useState } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function Checkin({ onRestart }) {
  const {
    gutChoice, firstAction, actionTime,
    obstacle, obstacleIf, gamification,
    lockDays,
    setCheckinResult,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
    awardPoints, resetDecision,
    getAchievements,
  } = useRemmyStore();

  const [result, setResult] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setAiLoading(true);
      setShowContinue(false);

      const fallbackTimer = setTimeout(() => {
        if (isActive) setShowContinue(true);
      }, 3000);

      try {
        const reply = await askRemmy(
          `User committed to "${gutChoice}". Their implementation intention: IF ${actionTime} THEN "${firstAction}". IF obstacle (${obstacle}) THEN ${obstacleIf}. Check in - did they do it? Present 3 options and hold them accountable.`,
          'checkin',
          { gutChoice }
        );
        if (isActive) {
          setAiMessage(reply);
        }
      } finally {
        clearTimeout(fallbackTimer);
        if (isActive) {
          setAiLoading(false);
          setShowContinue(false);
        }
      }
    };

    load();
    return () => { isActive = false; };
  }, [actionTime, firstAction, gutChoice, obstacle, obstacleIf, setAiLoading, setAiMessage]);

  const handleResult = async (r) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setResult(r);
    setCheckinResult(r);
    setShowContinue(false);

    if (r === 'yes') {
      awardPoints(100, 'Completed first action');
      const { recoveryBonus, streakMessage, newStreak } = processStreak();
      if (recoveryBonus > 0) {
        awardPoints(recoveryBonus, 'Recovery bonus');
      }
    }

    setAiLoading(true);

    const fallbackTimer = setTimeout(() => {
      if (requestIdRef.current === requestId) setShowContinue(true);
    }, 3000);

    try {
      const prompts = {
        yes: `User completed "${firstAction}" on time. Celebrate briefly - not too much, this is what they're supposed to do. Then immediately pivot: what's the next action? Keep momentum.`,
        rescheduled: `User rescheduled "${firstAction}". Ask directly: legitimate reason or avoidance? Don't let them off the hook. Make them commit to a specific new time right now.`,
        no: `User did NOT complete "${firstAction}". This is critical. Call out the pattern: they decided, committed, made a plan, and still didn't act. Ask what story they told themselves. Be direct but not cruel.`,
      };

      const reply = await askRemmy(prompts[r], 'checkin', { gutChoice, firstAction });

      if (requestIdRef.current === requestId) {
        setAiMessage(reply);
        if (r === 'yes') setShowStats(true);
      }
    } finally {
      clearTimeout(fallbackTimer);
      if (requestIdRef.current === requestId) {
        setAiLoading(false);
        setShowContinue(false);
      }
    }
  };

  const achievements = getAchievements().filter(a => a.unlocked);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy
          stage="checkin"
          level={gamification.level}
          mood={result === 'yes' ? 'zoomies' : result === 'no' ? 'judging' : 'alert'}
        />
        <div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em'
          }}>
            IMMEDIATE CHECK
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No hiding. Did you do it?
          </p>
        </div>
      </div>

      <div className="card" style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
        <p style={{
          fontSize: '0.65rem', color: 'var(--text-muted)',
          letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
        }}>
          Your commitment
        </p>
        <p><strong style={{ color: 'var(--yellow)' }}>{firstAction}</strong></p>
        <p style={{ marginTop: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Planned for: {actionTime}
        </p>
      </div>

      <AIMessage text={aiMessage} loading={aiLoading} />

      {/* Continue without AI fallback */}
      {aiLoading && showContinue && (
        <button
          className="btn-secondary"
          onClick={() => { setAiLoading(false); setShowContinue(false); }}
          style={{ opacity: 0.7, fontSize: '0.8rem' }}
        >
          Continue without Remmy's response →
        </button>
      )}

      {!aiLoading && !result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn-primary"
            onClick={() => handleResult('yes')}
            style={{ background: 'var(--success)', color: '#0a0a0a' }}
          >
            Yes, I did it
          </button>
          <button className="btn-secondary" onClick={() => handleResult('rescheduled')}>
            No, but I rescheduled
          </button>
          <button className="btn-danger" onClick={() => handleResult('no')}>
            No, I did not do it
          </button>
        </div>
      )}

      {showStats && achievements.length > 0 && (
        <div className="card fade-in">
          <p style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            Achievements Unlocked
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {achievements.map(a => (
              <div key={a.id} className="pop-in tag" style={{
                background: 'var(--yellow-dim)',
                borderColor: 'var(--border-yellow)',
                color: 'var(--yellow)',
                fontSize: '0.85rem',
              }}>
                {a.emoji} {a.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && !aiLoading && (
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            className="btn-secondary"
            style={{ flex: 1 }}
            onClick={() => { resetDecision(); onRestart(); }}
          >
            New Decision
          </button>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--yellow-dim)', border: '1px solid var(--border-yellow)',
            borderRadius: 'var(--radius)', padding: '12px',
            fontSize: '0.8rem', color: 'var(--yellow)', textAlign: 'center',
          }}>
            🔒 Locked: {lockDays} days
          </div>
        </div>
      )}
    </div>
  );
}