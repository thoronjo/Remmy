import { useState } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import Timer from '../components/Timer';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const nowMs = () => nowMs();

export default function GutCheck({ onNext }) {
  const {
    decision, realOptions, gamification,
    setGutChoice,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
    awardPoints, decisionStartTime,
    setFastDecision,
  } = useRemmyStore();

  const [phase, setPhase] = useState('intro');
  const [showContinue, setShowContinue] = useState(false);

  const timerSeconds = Math.min(6 + (realOptions.length - 2) * 4, 20);

  const startTimer = () => setPhase('timer');
  const handleTimerEnd = () => setPhase('choose');

  const handleChoice = async (opt) => {
    setGutChoice(opt);
    setPhase('response');
    setShowContinue(false);

    if (decisionStartTime && (nowMs() - decisionStartTime) < 86400000) {
      setFastDecision(true);
    }
    awardPoints(20, 'Completed gut check');

    setAiLoading(true);
    setAiMessage('');

    // Show "continue without AI" after 3 seconds
    const fallbackTimer = setTimeout(() => setShowContinue(true), 3000);

    const reply = await askRemmy(
      `User's gut chose "${opt}" over "${realOptions.filter(o => o !== opt).join(', ')}" for "${decision}". They chose without thinking. Now challenge why they might be second-guessing it. Be direct and brief.`,
      'gut_check',
      { decision, gutChoice: opt }
    );

    clearTimeout(fallbackTimer);
    setAiMessage(reply);
    setAiLoading(false);
    setShowContinue(false);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy
          stage="gut_check"
          level={gamification.level}
          mood={phase === 'response' ? 'charged' : 'judging'}
        />
        <div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em'
          }}>
            {phase === 'intro' && `${timerSeconds}-SECOND GUT`}
            {phase === 'timer' && 'FEEL IT.'}
            {phase === 'choose' && "TIME'S UP."}
            {phase === 'response' && 'YOUR GUT SPOKE.'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {phase === 'intro' && 'No analysis. Just feel.'}
            {phase === 'timer' && 'Which option feels right in your body?'}
            {phase === 'choose' && 'Pick without thinking. Now.'}
            {phase === 'response' && 'Now stop second-guessing it.'}
          </p>
        </div>
      </div>

      {/* INTRO */}
      {phase === 'intro' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ lineHeight: 1.8, fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            <p>
              You have <strong style={{ color: 'var(--yellow)' }}>{timerSeconds} seconds</strong> to sit with your options.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              No researching. No analyzing. Just notice which option your body pulls toward.
            </p>
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Your gut processes information faster than your conscious mind. Trust it.
            </p>
          </div>

          {/* Options */}
          <div style={{
            display: 'flex',
            flexWrap: realOptions.length > 2 ? 'wrap' : 'nowrap',
            gap: 12,
          }}>
            {realOptions.map((opt, i) => (
              <div key={i} style={{
                flex: realOptions.length > 2 ? '1 1 calc(50% - 6px)' : '1',
                padding: '16px',
                background: 'rgba(232,255,71,0.04)',
                border: '1px solid var(--border-yellow)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--yellow)',
                lineHeight: 1.5,
              }}>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  Option {OPTION_LABELS[i]}
                </div>
                {opt}
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={startTimer}>
            START THE CLOCK â†’
          </button>
        </div>
      )}

      {/* TIMER */}
      {phase === 'timer' && (
        <div className="fade-in">
          <div style={{
            display: 'flex',
            flexWrap: realOptions.length > 2 ? 'wrap' : 'nowrap',
            gap: 12,
            marginBottom: '1.5rem',
          }}>
            {realOptions.map((opt, i) => (
              <div key={i} style={{
                flex: realOptions.length > 2 ? '1 1 calc(50% - 6px)' : '1',
                padding: '16px',
                background: 'rgba(232,255,71,0.04)',
                border: '1px solid var(--border-yellow)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--yellow)',
                lineHeight: 1.5,
              }}>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  Option {OPTION_LABELS[i]}
                </div>
                {opt}
              </div>
            ))}
          </div>
          <Timer seconds={timerSeconds} onEnd={handleTimerEnd} />
        </div>
      )}

      {/* CHOOSE */}
      {phase === 'choose' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            padding: '14px 16px',
            background: 'rgba(232,255,71,0.06)',
            border: '1px solid var(--border-yellow)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            color: 'var(--yellow)',
            textAlign: 'center',
          }}>
            Which one were you hoping the timer would end on?
          </div>

          {realOptions.map((opt, i) => (
            <button
              key={i}
              className="option-card"
              onClick={() => handleChoice(opt)}
              style={{ fontSize: '1rem', padding: '20px' }}
            >
              <span style={{
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}>
                Option {OPTION_LABELS[i]}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* RESPONSE */}
      {phase === 'response' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AIMessage text={aiMessage} loading={aiLoading} />

          {/* Continue without AI fallback */}
          {aiLoading && showContinue && (
            <button
              className="btn-secondary"
              onClick={onNext}
              style={{ opacity: 0.7, fontSize: '0.8rem' }}
            >
              Continue without Remmy's response â†’
            </button>
          )}

          {!aiLoading && aiMessage && (
            <button className="btn-primary" onClick={onNext}>
              FACE MY FEARS â†’
            </button>
          )}
        </div>
      )}
    </div>
  );
}
