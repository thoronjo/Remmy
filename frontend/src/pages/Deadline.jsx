import { useEffect } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function Deadline({ onNext }) {
  const {
    decision, gutChoice, gamification,
    deadlineDays, setDeadlineDays,
    lockDays, setLockDays,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
  } = useRemmyStore();

  useEffect(() => {
    const load = async () => {
      setAiLoading(true);
      const reply = await askRemmy(
        `User analyzed their fears about "${gutChoice}" for "${decision}". Now set the stakes. Tell them they're setting a decision deadline and a commitment lock. Make the weight of this commitment feel real. Cite Ariely's deadline research briefly.`,
        'deadline',
        { decision, gutChoice }
      );
      setAiMessage(reply);
      setAiLoading(false);
    };
    load();
  }, []);

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);

  const lockDate = new Date();
  lockDate.setDate(lockDate.getDate() + deadlineDays + lockDays);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy stage="deadline" level={gamification.level} mood="charged" />
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em' }}>
            SET THE CLOCK
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Deadlines improve decision quality. Science.
          </p>
        </div>
      </div>

      <AIMessage text={aiMessage} loading={aiLoading} />

      {!aiLoading && aiMessage && (
        <>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Decision deadline (days)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[3, 5, 7, 14].map(d => (
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
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Decide by: <span style={{ color: 'var(--yellow)' }}>{deadlineDate.toDateString()}</span>
              </p>
            </div>

            <div>
              <label className="label">Commitment lock (days — no reconsidering)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[14, 30, 60, 90].map(d => (
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
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                No reconsidering until: <span style={{ color: 'var(--yellow)' }}>{lockDate.toDateString()}</span>
              </p>
            </div>
          </div>

          <div style={{
            padding: '14px 16px',
            background: 'rgba(232,255,71,0.04)',
            border: '1px solid var(--border-yellow)',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.7,
          }}>
            You have <strong style={{ color: 'var(--yellow)' }}>{deadlineDays} days</strong> to decide. Then <strong style={{ color: 'var(--yellow)' }}>{lockDays} days</strong> of execution only — no second-guessing, no reconsidering. Just building.
          </div>

          <button className="btn-primary" onClick={onNext}>
            LOCK IT IN →
          </button>
        </>
      )}
    </div>
  );
}