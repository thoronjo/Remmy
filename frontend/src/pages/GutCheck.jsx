import { useEffect, useState } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import Timer from '../components/Timer';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function GutCheck({ onNext }) {
  const {
    decision, realOptions, gamification,
    setGutChoice,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
    awardPoints, decisionStartTime,
    setFastDecision,
  } = useRemmyStore();

  const [timerDone, setTimerDone] = useState(false);
  const [chosen, setChosen] = useState(null);

  useEffect(() => {
    const load = async () => {
      setAiLoading(true);
      const reply = await askRemmy(
        `User narrowed to: ${realOptions.join(', ')} for "${decision}". Set up the 60-second gut check. Tell them: no analysis, just feel. Which one feels right in their body, not their head?`,
        'gut_check',
        { decision }
      );
      setAiMessage(reply);
      setAiLoading(false);
    };
    load();
  }, []);

  const handleChoice = async (opt) => {
    setChosen(opt);
    setGutChoice(opt);

    // Check if fast decision (under 24 hours)
    if (decisionStartTime && (Date.now() - decisionStartTime) < 86400000) {
      setFastDecision(true);
    }

    awardPoints(20, 'Completed gut check');
    onNext();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy stage="gut_check" level={gamification.level} />
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em' }}>
            60-SECOND GUT
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Feel. Don't think.
          </p>
        </div>
      </div>

      <AIMessage text={aiMessage} loading={aiLoading} />

      {!aiLoading && aiMessage && !timerDone && (
        <Timer seconds={60} onEnd={() => setTimerDone(true)} />
      )}

      {timerDone && (
        <div className="fade-in">
          <label className="label">Time's up. What did your gut say?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {realOptions.map((opt, i) => (
              <button
                key={i}
                className="option-card"
                onClick={() => handleChoice(opt)}
                style={{ fontSize: '1rem', padding: '18px 20px' }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}