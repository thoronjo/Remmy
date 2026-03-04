import { useEffect } from 'react';
import Remmy from '../components/Remmy';
import AIMessage from '../components/AIMessage';
import useRemmyStore from '../store/useRemmyStore';
import { askRemmy } from '../services/api';

export default function AnxietyAnalysis({ onNext }) {
  const {
    decision, gutChoice, fears, gamification,
    aiMessage, setAiMessage,
    aiLoading, setAiLoading,
    awardPoints,
  } = useRemmyStore();

  useEffect(() => {
    const load = async () => {
      setAiLoading(true);
      const reply = await askRemmy(
        `Analyze these fears about choosing "${gutChoice}" for "${decision}":
${fears.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Separate rational concerns from anxiety masquerading as wisdom. Be surgical and direct. Cite CBT briefly. End with a clear push forward. Under 200 words.`,
        'anxiety_analysis',
        { decision, gutChoice }
      );
      setAiMessage(reply);
      setAiLoading(false);
      awardPoints(30, 'Faced fears');
    };
    load();
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Remmy stage="anxiety_analysis" level={gamification.level} mood="charged" />
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: '0.05em' }}>
            TRUTH CHECK
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Rational concern vs anxiety.
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4,
      }}>
        {fears.map((f, i) => (
          <div key={i} className="tag" style={{ background: 'rgba(255,107,107,0.06)', borderColor: 'rgba(255,107,107,0.2)', color: '#ff9999' }}>
            {f}
          </div>
        ))}
      </div>

      <AIMessage text={aiMessage} loading={aiLoading} />

      {!aiLoading && aiMessage && (
        <button className="btn-primary" onClick={onNext}>
          I UNDERSTAND. SET MY DEADLINE →
        </button>
      )}
    </div>
  );
}