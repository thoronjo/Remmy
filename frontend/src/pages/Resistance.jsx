import { useEffect } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import TagInput from '../components/TagInput';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function Resistance({ onNext }) {
  const {
    decision, gutChoice, gamification,
    fears, setFears,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
  } = useRemmyStore();

  useEffect(() => {
    const load = async () => {
      setAiLoading(true);
      const reply = await askRemmy(
        `User's gut said "${gutChoice}" for "${decision}". Challenge them: why aren't they trusting that? Ask them to brain-dump every single fear, doubt, and resistance — no filter.`,
        'resistance',
        { decision, gutChoice }
      );
      setAiMessage(reply);
      setAiLoading(false);
    };
    load();
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy stage="resistance" level={gamification.level} mood="judging" />
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em' }}>
            YOUR FEARS
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Get it all out. No filter.
          </p>
        </div>
      </div>

      {gutChoice && (
        <div style={{
          background: 'var(--yellow-dim)',
          border: '1px solid var(--border-yellow)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          fontSize: '0.85rem', color: 'var(--yellow)',
        }}>
          Your gut said: <strong>{gutChoice}</strong>
        </div>
      )}

      <AIMessage text={aiMessage} loading={aiLoading} />

      {!aiLoading && aiMessage && (
        <>
          <div>
            <label className="label">List every fear. Press Enter after each.</label>
            <TagInput
              placeholder="What scares you about this choice?"
              tags={fears}
              onAdd={f => setFears([...fears, f])}
              onRemove={i => setFears(fears.filter((_, idx) => idx !== i))}
            />
          </div>

          <button
            className="btn-primary"
            onClick={onNext}
            disabled={fears.length === 0}
          >
            ANALYZE MY FEARS →
          </button>

          {fears.length === 0 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              You have fears. Everyone does. Name them.
            </p>
          )}
        </>
      )}
    </div>
  );
}