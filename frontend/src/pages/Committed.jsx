import { useEffect, useRef, useState } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function Committed({ onNext }) {
  const {
    decision, gutChoice, deadlineDays, lockDays,
    gamification, setLocked,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
    awardPoints, incrementStreak,
  } = useRemmyStore();

  const [showCommit, setShowCommit] = useState(false);
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    const load = async () => {
      setAiLoading(true);
      const reply = await askRemmy(
        `User is about to commit to "${gutChoice}" for "${decision}" with a ${deadlineDays}-day deadline and ${lockDays}-day lock. Make the weight of this feel real. Tell them what happens when they click commit â€” decision is locked, no going back for ${lockDays} days. Be direct and powerful.`,
        'committed',
        { decision, gutChoice }
      );
      setAiMessage(reply);
      setAiLoading(false);
      setShowCommit(true);
    };
    load();
  }, [decision, gutChoice, deadlineDays, lockDays, setAiLoading, setAiMessage]);

  const handleCommit = () => {
    setLocked(true);
    awardPoints(50, 'Committed to decision');
    incrementStreak();
    onNext();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Remmy stage="committed" level={gamification.level} mood="happy" size={140} />
        </div>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2.2rem', color: '#fff',
          letterSpacing: '0.05em',
        }}>
          THE MOMENT OF TRUTH
        </h2>
      </div>

      <div style={{
        padding: '1.5rem',
        background: 'var(--yellow-dim)',
        border: '2px solid var(--border-yellow)',
        borderRadius: 'var(--radius)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Your Decision
        </p>
        <p style={{ fontSize: '1.2rem', color: 'var(--yellow)', fontWeight: 600, lineHeight: 1.4 }}>
          {gutChoice}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Locked for {lockDays} days Â· No reconsidering
        </p>
      </div>

      <AIMessage text={aiMessage} loading={aiLoading} />

      {showCommit && (
        <div className="fade-in">
          <button
            className="btn-primary"
            onClick={handleCommit}
            style={{ fontSize: '1.1rem', padding: '18px', letterSpacing: '0.08em' }}
          >
            ðŸ”’ I COMMIT. LOCK IT.
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
            This cannot be undone for {lockDays} days.
          </p>
        </div>
      )}
    </div>
  );
}
