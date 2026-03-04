import { useEffect, useState } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function Narrowing({ onNext }) {
  const {
    decision, options,
    realOptions, setRealOptions,
    daysStuck, gamification,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
    awardPoints,
  } = useRemmyStore();

  const isBinary = options.length <= 2;

  useEffect(() => {
    // If only 2 options, auto-select both and skip selection UI
    if (isBinary) {
      setRealOptions(options);
    }

    const load = async () => {
      setAiLoading(true);
      const reply = await askRemmy(
        isBinary
          ? `User has exactly 2 options for "${decision}": ${options.join(' vs ')}. Stuck for: ${daysStuck}. Call out which one is the real choice and which might be avoidance. Be surgical and direct. Set up the gut check.`
          : `User has ${options.length} options for "${decision}": ${options.join(', ')}. Stuck for: ${daysStuck}. Tell them to identify which are REAL contenders vs safety options they're keeping out of fear. Be direct.`,
        'narrowing',
        { decision, daysStuck }
      );
      setAiMessage(reply);
      setAiLoading(false);
    };
    load();
  }, []);

  const toggle = (opt) => {
    if (realOptions.includes(opt)) {
      setRealOptions(realOptions.filter(o => o !== opt));
    } else if (realOptions.length < 5) {
      setRealOptions([...realOptions, opt]);
    }
  };

  const handleNext = () => {
    const cut = options.length - realOptions.length;
    if (cut > 0) awardPoints(cut * 15, 'Cut safety options');
    onNext();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy stage="narrowing" level={gamification.level} />
        <div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em'
          }}>
            {isBinary ? 'THE REAL CHOICE' : 'ELIMINATE'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {isBinary ? 'Two options. One decision.' : 'Keep only REAL contenders. Max 5.'}
          </p>
        </div>
      </div>

      <AIMessage text={aiMessage} loading={aiLoading} />

      {!aiLoading && (
        <>
          {/* Binary — show both as a face-off, no selection needed */}
          {isBinary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {options.map((opt, i) => (
                <div key={i} style={{
                  padding: '18px 20px',
                  background: 'rgba(232,255,71,0.04)',
                  border: '1px solid var(--border-yellow)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--yellow)',
                  fontSize: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>{opt}</span>
                  {i === 0 && (
                    <span style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.12em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>Option A</span>
                  )}
                  {i === 1 && (
                    <span style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.12em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>Option B</span>
                  )}
                </div>
              ))}

              <div style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                padding: '4px 0',
              }}>
                Your gut will decide between these two. Ready?
              </div>
            </div>
          ) : (
            /* Multiple options — show selection UI */
            <>
              <div>
                <label className="label">Which are real contenders?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {options.map((opt, i) => {
                    const isReal = realOptions.includes(opt);
                    return (
                      <button
                        key={i}
                        onClick={() => toggle(opt)}
                        className={`option-card ${isReal ? 'selected' : ''}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>{opt}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.08em',
                          opacity: 0.7
                        }}>
                          {isReal ? 'REAL ✓' : 'tap to keep'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {realOptions.length >= 2 && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255,107,107,0.06)',
                  border: '1px solid rgba(255,107,107,0.2)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.8rem', color: '#ff9999',
                }}>
                  Cutting {options.length - realOptions.length} option
                  {options.length - realOptions.length !== 1 ? 's' : ''}. Good. That's the work.
                </div>
              )}
            </>
          )}

          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={!isBinary && realOptions.length < 2}
          >
            {isBinary ? 'START THE GUT CHECK →' : 'CUT THE REST →'}
          </button>
        </>
      )}
    </div>
  );
}