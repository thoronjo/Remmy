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

export default function AIMessage({ text, loading }) {
  if (!loading && !text) return null;

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
      )}
    </div>
  );
}