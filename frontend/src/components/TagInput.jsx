import { useState } from 'react';

export default function TagInput({ placeholder, tags, onAdd, onRemove, maxTags }) {
  const [val, setVal] = useState('');

  const submit = () => {
    const trimmed = val.trim().slice(0, 200);
    if (trimmed && (!maxTags || tags.length < maxTags)) {
      onAdd(trimmed);
      setVal('');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={placeholder}
          maxLength={200}
          disabled={maxTags && tags.length >= maxTags}
        />
        <button
          className="btn-secondary"
          onClick={submit}
          disabled={!val.trim() || (maxTags && tags.length >= maxTags)}
          style={{ whiteSpace: 'nowrap', width: 'auto' }}
        >
          Add
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((t, i) => (
          <div key={i} className="tag">
            <span>{t}</span>
            <button onClick={() => onRemove(i)}>×</button>
          </div>
        ))}
      </div>
      {maxTags && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
          {tags.length}/{maxTags} options
        </p>
      )}
    </div>
  );
}