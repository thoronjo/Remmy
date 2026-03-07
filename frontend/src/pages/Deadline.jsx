import { useEffect, useMemo, useState } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

const DEADLINE_OPTIONS = [3, 5, 7, 14];
const LOCK_OPTIONS = [14, 30, 60, 90];

export default function Deadline({ onNext }) {
  const {
    decision,
    gutChoice,
    daysStuck,
    gamification,
    deadlineDays,
    setDeadlineDays,
    lockDays,
    setLockDays,
    aiMessage,
    setAiMessage,
    aiLoading,
    setAiLoading,
  } = useRemmyStore();

  const [showAdjust, setShowAdjust] = useState(false);

  const recommendation = useMemo(() => {
    const normalized = (daysStuck || '').toLowerCase();

    if (normalized.includes('year') || normalized.includes('3+ months')) {
      return { deadline: 3, lock: 30 };
    }

    if (normalized.includes('month')) {
      return { deadline: 5, lock: 30 };
    }

    return { deadline: 7, lock: 14 };
  }, [daysStuck]);

  useEffect(() => {
    const load = async () => {
      setAiLoading(true);
      const reply = await askRemmy(
        `User analyzed fears around "${gutChoice}" for "${decision}". Give a direct TLDR with one clear plan: decision date plus lock period. Keep it short, practical, and firm.`,
        'deadline',
        { decision, gutChoice }
      );
      setAiMessage(reply);
      setAiLoading(false);
    };

    load();
  }, []);

  const applyRecommendation = () => {
    setDeadlineDays(recommendation.deadline);
    setLockDays(recommendation.lock);
  };

  const handleUseRecommended = () => {
    applyRecommendation();
    onNext();
  };

  const decisionDate = new Date();
  decisionDate.setDate(decisionDate.getDate() + deadlineDays);

  const lockUntilDate = new Date();
  lockUntilDate.setDate(lockUntilDate.getDate() + deadlineDays + lockDays);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy stage="deadline" level={gamification.level} mood="charged" />
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em' }}>
            I WILL GUIDE THIS PART
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            One solid plan now. You can adjust if needed.
          </p>
        </div>
      </div>

      <AIMessage text={aiMessage} loading={aiLoading} />

      {!aiLoading && aiMessage && !showAdjust && (
        <>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Recommended plan
            </p>
            <p style={{ fontSize: '0.92rem', color: '#fff', lineHeight: 1.7 }}>
              Decide in <strong style={{ color: 'var(--yellow)' }}>{recommendation.deadline} days</strong>, then run with it for <strong style={{ color: 'var(--yellow)' }}>{recommendation.lock} days</strong> without second-guessing.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              This keeps momentum high and prevents analysis loops.
            </p>
          </div>

          <button className="btn-primary" onClick={handleUseRecommended}>
            USE THIS PLAN
          </button>

          <button
            className="btn-secondary"
            onClick={() => {
              applyRecommendation();
              setShowAdjust(true);
            }}
          >
            Adjust plan
          </button>
        </>
      )}

      {!aiLoading && aiMessage && showAdjust && (
        <>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Step 1: Pick your decision date</label>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 10 }}>
                By this date, you choose one path.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {DEADLINE_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDeadlineDays(d)}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      borderColor: deadlineDays === d ? 'var(--border-yellow)' : undefined,
                      color: deadlineDays === d ? 'var(--yellow)' : undefined,
                      background: deadlineDays === d ? 'var(--yellow-dim)' : undefined,
                    }}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Step 2: How long will you stick to it?</label>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 10 }}>
                No reopening this decision during this lock period.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {LOCK_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setLockDays(d)}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      borderColor: lockDays === d ? 'var(--border-yellow)' : undefined,
                      color: lockDays === d ? 'var(--yellow)' : undefined,
                      background: lockDays === d ? 'var(--yellow-dim)' : undefined,
                    }}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(232,255,71,0.04)',
              border: '1px solid var(--border-yellow)',
              borderRadius: 'var(--radius)',
              fontSize: '0.82rem',
              color: 'var(--text-dim)',
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: '#fff' }}>Your commitment:</strong> Decide by{' '}
            <strong style={{ color: 'var(--yellow)' }}>{decisionDate.toDateString()}</strong>, then stay locked in until{' '}
            <strong style={{ color: 'var(--yellow)' }}>{lockUntilDate.toDateString()}</strong>.
          </div>

          <button className="btn-primary" onClick={onNext}>
            THIS PLAN LOOKS RIGHT
          </button>

          <button className="btn-secondary" onClick={() => setShowAdjust(false)}>
            Back to recommended plan
          </button>
        </>
      )}
    </div>
  );
}
