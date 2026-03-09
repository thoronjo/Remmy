import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const LoadingDots = () => (
  <div style={{ display: 'flex', gap: 6, padding: '8px 0' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: '50%',
        background: '#E8FF47', opacity: 0.4,
        animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </div>
);

const generateTLDR = (text) => {
  if (!text) return null;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  if (sentences.length < 3) return null;
  // Return the last punchy sentence as the TLDR
  const candidates = sentences.filter(s =>
    s.length < 120 &&
    !s.toLowerCase().includes('research') &&
    !s.toLowerCase().includes('according')
  );
  return candidates[candidates.length - 1]?.trim() || null;
};

export default function AIMessage({ text, loading }) {
  const [showFull, setShowFull] = useState(false);

  if (!loading && !text) return null;

  const tldr = text ? generateTLDR(text) : null;
  const isLong = text && text.length > 400;

  return (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(232,255,71,0.03)',
      borderLeft: '3px solid #E8FF47',
      borderRadius: '0 8px 8px 0',
      fontSize: '0.88rem',
      lineHeight: 1.8,
      color: 'var(--text-dim)',
      fontFamily: 'var(--font-mono)',
    }}>
      {loading ? <LoadingDots /> : (
        <>
          {/* TL;DR pill â€” only for long messages */}
          {isLong && tldr && !showFull && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'inline-block',
                fontSize: '0.58rem',
                letterSpacing: '0.15em',
                color: '#E8FF47',
                textTransform: 'uppercase',
                marginBottom: 6,
                opacity: 0.7,
              }}>
                TL;DR
              </div>
              <div style={{
                fontSize: '0.88rem',
                color: '#fff',
                lineHeight: 1.6,
                marginBottom: 10,
              }}>
                {tldr}.
              </div>
              <button
                onClick={() => setShowFull(true)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(232,255,71,0.2)',
                  color: 'rgba(232,255,71,0.6)',
                  borderRadius: 20,
                  padding: '3px 12px',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                }}
              >
                Read full â†’
              </button>
            </div>
          )}

          {/* Full message */}
          {(!isLong || showFull || !tldr) && (
            <div className="fade-in">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p style={{ margin: '0 0 0.75rem 0' }}>{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: '#E8FF47', fontWeight: 600 }}>{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em style={{ color: 'var(--text-muted)' }}>{children}</em>
                  ),
                }}
              >
                {text}
              </ReactMarkdown>
              {isLong && showFull && (
                <button
                  onClick={() => setShowFull(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(232,255,71,0.4)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    padding: '4px 0',
                  }}
                >
                  â†‘ Collapse
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
