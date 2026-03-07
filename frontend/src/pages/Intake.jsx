import { useEffect } from 'react';
import Remmy from '../components/Remmy';
import TagInput from '../components/TagInput';
import AIMessage from '../components/AIMessage';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function Intake({ onNext }) {
  const {
    decision, setDecision,
    options, setOptions,
    daysStuck, setDaysStuck,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
    gamification,
    setDecisionStartTime,
  } = useRemmyStore();

  const handleStart = async () => {
    if (!decision.trim() || options.length < 2) return;
    setDecisionStartTime(Date.now());
    setAiLoading(true);
    setAiMessage('');
    const reply = await askRemmy(
      `User can't decide: "${decision}". Options: ${options.join(', ')}. Stuck for: ${daysStuck || 'a while'}. Call out how long they've been overthinking this, then tell them what happens next in this process. Be direct and brief.`,
      'intake',
      { decision, daysStuck }
    );
    setAiMessage(reply);
    setAiLoading(false);
  };

  const canProceed = !aiLoading && aiMessage;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Remmy stage="intake" level={gamification.level} />
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(2.2rem, 8vw, 3.8rem)',
          color: '#fff', lineHeight: 0.95,
          marginBottom: '0.75rem',
        }}>
          WHAT ARE YOU<br />
          <span style={{ color: 'var(--yellow)' }}>AFRAID TO</span><br />
          DECIDE?
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
          Built on CBT · ACT · Behavioral Science
        </p>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label className="label">WHAT'S ON YOUR MIND</label>
          <textarea
            value={decision}
            onChange={e => setDecision(e.target.value.slice(0, 500))}
            placeholder="e.g. I can't decide whether to quit my job and go all-in on my startup"
            rows={2}
            maxLength={500}
          />
        </div>

        <div>
          <label className="label">What are your options? (min 2, max 8)</label>
          <TagInput
            placeholder="Type an option and press Enter..."
            tags={options}
            onAdd={opt => options.length < 8 && setOptions([...options, opt])}
            onRemove={i => setOptions(options.filter((_, idx) => idx !== i))}
            maxTags={8}
          />
        </div>

        <div>
          <label className="label">How long have you been stuck?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['A few days', '1–2 weeks', '1 month', '3+ months', 'Over a year'].map(d => (
              <button
                key={d}
                onClick={() => setDaysStuck(d)}
                className="btn-secondary"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  borderColor: daysStuck === d ? 'var(--border-yellow)' : undefined,
                  color: daysStuck === d ? 'var(--yellow)' : undefined,
                  background: daysStuck === d ? 'var(--yellow-dim)' : undefined,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Response */}
      <AIMessage text={aiMessage} loading={aiLoading} />

      {/* CTA */}
      {!aiMessage && !aiLoading && (
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={!decision.trim() || options.length < 2}
        >
          STOP OVERTHINKING →
        </button>
      )}

      {canProceed && (
        <button className="btn-primary" onClick={onNext}>
          LET'S GO →
        </button>
      )}

      {/* Info */}
      <div className="card" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>What happens next</p>
        Eliminate fake options → 60-second gut check → translate your fears → set a deadline → lock your decision → first action plan → accountability check-in.
      </div>
    </div>
  );
}