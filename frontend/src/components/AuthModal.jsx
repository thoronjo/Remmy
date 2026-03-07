import { useState } from 'react';
import { signIn, signUp, signInWithGoogle } from '../services/auth';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signup') {
        await signUp(email, password);
        setSuccess('Check your email to confirm your account.');
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 20000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: '#0d0d0d',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '2rem',
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <img
            src="/remmy.png"
            alt="Remmy"
            style={{ width: 64, height: 64, borderRadius: 14, marginBottom: 12 }}
          />
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.8rem', color: '#fff',
            letterSpacing: '0.05em', margin: 0,
          }}>
            {mode === 'signin' ? 'WELCOME BACK' : 'JOIN REMMY'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
            {mode === 'signin'
              ? 'Your decisions are waiting.'
              : 'Start making decisions that stick.'}
          </p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#fff',
            color: '#111',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7l-6.5 5C9.6 40 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C41 35.2 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'var(--text-muted)', fontSize: '0.75rem',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          or
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: '#fff',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-mono)',
            boxSizing: 'border-box',
          }}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: '#fff',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-mono)',
            boxSizing: 'border-box',
          }}
        />

        {/* Error / Success */}
        {error && (
          <p style={{ color: '#ff6b6b', fontSize: '0.8rem', margin: 0 }}>{error}</p>
        )}
        {success && (
          <p style={{ color: '#47ff8a', fontSize: '0.8rem', margin: 0 }}>{success}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'LOADING...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
        </button>

        {/* Toggle mode */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          margin: 0,
        }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--yellow)', cursor: 'pointer',
              fontSize: '0.8rem', padding: 0,
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '0.75rem', textAlign: 'center',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
          }}
        >
          CONTINUE WITHOUT ACCOUNT
        </button>
      </div>
    </div>
  );
}