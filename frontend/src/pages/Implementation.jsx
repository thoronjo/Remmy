import { useEffect } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function Implementation({ onNext }) {
  const {
    decision, gutChoice, gamification,
    firstAction, setFirstAction,
    actionTime, setActionTime,
    obstacle, setObstacle,
    obstacleIf, setObstacleIf,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
    awardPoints,
  } = useRemmyStore();

  useEffect(() => {
    const load = async () => {
      setAiLoading(true);
      const reply = await askRemmy(
        `User committed to "${gutChoice}". Decision is locked. Now build their implementation intention using Gollwitzer's research. Ask: what is the single smallest, most concrete first action? Must be completable in under 2 hours with a clear done/not-done state. Give examples of bad vs good first actions.`,
        'implementation',
        { decision, gutChoice }
      );
      setAiMessage(reply);
      setAiLoading(false);
    };
    load();
  }, []);

  const handleSubmit = () => {
    if (!firstAction.trim() || !actionTime.trim() || !obstacle.trim() || !obstacleIf.trim()) return;
    awardPoints(40, 'Built implementation plan');
    onNext();
  };

  const allFilled = firstAction.trim() && actionTime.trim() && obstacle.trim() && obstacleIf.trim();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy stage="implementation" level={gamification.level} mood="glowing" />
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em' }}>
            FIRST ACTION
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Gollwitzer: if-then plans = 91% follow-through.
          </p>
        </div>
      </div>

      <AIMessage text={aiMessage} loading={aiLoading} />

      {!aiLoading && aiMessage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="label">Your first action (completable in under 2 hours)</label>
            <input
              value={firstAction}
              onChange={e => setFirstAction(e.target.value.slice(0, 300))}
              placeholder="e.g. Email John about his experience starting a business"
              maxLength={300}
            />
          </div>

          <div>
            <label className="label">When exactly? (day + time)</label>
            <input
              value={actionTime}
              onChange={e => setActionTime(e.target.value.slice(0, 100))}
              placeholder="e.g. Monday 9:00am"
              maxLength={100}
            />
          </div>

          <div>
            <label className="label">What might prevent you?</label>
            <input
              value={obstacle}
              onChange={e => setObstacle(e.target.value.slice(0, 200))}
              placeholder="e.g. I'll be too tired / something will come up"
              maxLength={200}
            />
          </div>

          <div>
            <label className="label">If that happens, then you will...</label>
            <input
              value={obstacleIf}
              onChange={e => setObstacleIf(e.target.value.slice(0, 200))}
              placeholder="e.g. Do it at 8pm instead, no exceptions"
              maxLength={200}
            />
          </div>

          {allFilled && (
            <div className="card fade-in" style={{
              background: 'var(--yellow-dim)',
              borderColor: 'var(--border-yellow)',
              fontSize: '0.82rem', lineHeight: 1.8,
              color: 'var(--text-dim)',
            }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Your implementation intention</p>
              IF it is <strong style={{ color: 'var(--yellow)' }}>{actionTime}</strong>, THEN I will <strong style={{ color: 'var(--yellow)' }}>{firstAction}</strong>.<br />
              IF <strong style={{ color: 'var(--yellow)' }}>{obstacle}</strong>, THEN I will <strong style={{ color: 'var(--yellow)' }}>{obstacleIf}</strong>.
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!allFilled}
          >
            SEAL THE PLAN →
          </button>
        </div>
      )}
    </div>
  );
}