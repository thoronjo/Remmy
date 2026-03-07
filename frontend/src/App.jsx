import { useState, useEffect, useRef } from 'react';
import useRemmyStore from './store/useRemmyStore';
import useAuthStore from './store/useAuthStore';
import ProgressBar from './components/ProgressBar';
import Intake from './pages/Intake';
import Narrowing from './pages/Narrowing';
import GutCheck from './pages/GutCheck';
import Resistance from './pages/Resistance';
import AnxietyAnalysis from './pages/AnxietyAnalysis';
import Deadline from './pages/Deadline';
import Committed from './pages/Committed';
import Implementation from './pages/Implementation';
import Checkin from './pages/Checkin';
import './styles/global.css';
import AchievementPopup from './components/AchievementPopup';
import LevelUpOverlay from './components/LevelUpOverlay';
import CPFlash from './components/CPFlash';
import AuthModal from './components/AuthModal';

const STAGES = [
  'intake', 'narrowing', 'gut_check', 'resistance',
  'anxiety_analysis', 'deadline', 'committed', 'implementation', 'checkin'
];

export default function App() {
  const { stage, setStage, gamification, getLevelInfo } = useRemmyStore();
  const { user, initialize, logout, syncGamification } = useAuthStore();

  const [stageIdx, setStageIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [levelUpShow, setLevelUpShow] = useState(null);
  const [cpFlash, setCpFlash] = useState(null);
  const [history, setHistory] = useState([0]);
  const [showAuth, setShowAuth] = useState(false);

  const clarityPoints = useRemmyStore(s => s.gamification.clarityPoints);
  const level = useRemmyStore(s => s.gamification.level);
  const achievements = useRemmyStore(s => s.gamification.achievements);

  const prevCPRef = useRef(null);
  const prevLevelRef = useRef(null);
  const prevAchievementsRef = useRef(null);
  const hasSyncedHistoryRef = useRef(false);

  // Scroll to top on stage change
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [stage]);

  // Initialize auth
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  // Sync gamification to Supabase when CP changes
  useEffect(() => {
    if (user) syncGamification();
  }, [clarityPoints, user]);

  // Push browser history state on stage change
  useEffect(() => {
    if (!hasSyncedHistoryRef.current) {
      hasSyncedHistoryRef.current = true;
      return;
    }

    window.history.pushState({ stageIdx }, '', window.location.pathname);
  }, [stageIdx]);

  // Intercept browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (stageIdx > 0) {
        const prevIdx = stageIdx - 1;
        setStageIdx(prevIdx);
        setStage(STAGES[prevIdx]);
        window.history.pushState({ stageIdx: prevIdx }, '', window.location.pathname);
      } else {
        window.history.pushState({ stageIdx: 0 }, '', window.location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [stageIdx]);

  // CP flash
  useEffect(() => {
    if (prevCPRef.current === null) {
      prevCPRef.current = clarityPoints;
      return;
    }
    if (clarityPoints > prevCPRef.current) {
      const diff = clarityPoints - prevCPRef.current;
      setCpFlash({ amount: diff, id: Date.now() });
    }
    prevCPRef.current = clarityPoints;
  }, [clarityPoints]);

  // Level up
  useEffect(() => {
    if (prevLevelRef.current === null) {
      prevLevelRef.current = level;
      return;
    }
    if (level > prevLevelRef.current) {
      setLevelUpShow(level);
    }
    prevLevelRef.current = level;
  }, [level]);

  // Achievements
  useEffect(() => {
    if (prevAchievementsRef.current === null) {
      prevAchievementsRef.current = achievements;
      return;
    }
    const newOnes = achievements.filter(
      a => !prevAchievementsRef.current.includes(a)
    );
    if (newOnes.length > 0) {
      setPendingAchievements(q => [...q, ...newOnes]);
    }
    prevAchievementsRef.current = achievements;
  }, [achievements]);

  // Queue achievements one at a time
  useEffect(() => {
    if (!currentAchievement && pendingAchievements.length > 0) {
      setCurrentAchievement(pendingAchievements[0]);
      setPendingAchievements(q => q.slice(1));
    }
  }, [pendingAchievements, currentAchievement]);

  const goNext = () => {
    const nextIdx = stageIdx + 1;
    if (nextIdx < STAGES.length) {
      setHistory(h => [...h, nextIdx]);
      setStageIdx(nextIdx);
      setStage(STAGES[nextIdx]);
      setKey(k => k + 1);
    }
  };

  const goBack = () => {
    if (stageIdx > 0) {
      const prevIdx = stageIdx - 1;
      setStageIdx(prevIdx);
      setStage(STAGES[prevIdx]);
    }
  };

  const goRestart = () => {
    setHistory([0]);
    setStageIdx(0);
    setStage('intake');
    setKey(k => k + 1);
  };

  const levelInfo = getLevelInfo();

  const renderStage = () => {
    switch (stage) {
      case 'intake':           return <Intake onNext={goNext} />;
      case 'narrowing':        return <Narrowing onNext={goNext} />;
      case 'gut_check':        return <GutCheck onNext={goNext} />;
      case 'resistance':       return <Resistance onNext={goNext} />;
      case 'anxiety_analysis': return <AnxietyAnalysis onNext={goNext} />;
      case 'deadline':         return <Deadline onNext={goNext} />;
      case 'committed':        return <Committed onNext={goNext} />;
      case 'implementation':   return <Implementation onNext={goNext} />;
      case 'checkin':          return <Checkin onRestart={goRestart} />;
      default:                 return <Intake onNext={goNext} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div
          onClick={goRestart} 
          style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.6rem', color: 'var(--yellow)', letterSpacing: '0.1em',
          cursor: 'pointer',
        }}>
          REMMY
        </div>

        {/* Right side — gamification + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* CP + level name */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '0.65rem', color: 'var(--text-muted)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {levelInfo.current.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--yellow)' }}>
              {gamification.clarityPoints} CP
            </div>
          </div>

          {/* Level progress ring */}
          <div style={{ position: 'relative', width: 36, height: 36 }}>
            <svg viewBox="0 0 36 36" width={36} height={36}>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#1a1a1a" strokeWidth="3"/>
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke="var(--yellow)" strokeWidth="3"
                strokeDasharray={`${levelInfo.progress * 0.879} 87.9`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', color: 'var(--yellow)', fontWeight: 700,
            }}>
              {gamification.level}
            </div>
          </div>

          {/* Streak */}
          {gamification.streak > 0 && (
            <div style={{
              fontSize: '0.75rem', color: 'var(--yellow)',
              background: 'var(--yellow-dim)',
              border: '1px solid var(--border-yellow)',
              borderRadius: 20, padding: '3px 10px',
            }}>
              🔥 {gamification.streak}
            </div>
          )}

          {/* Auth button */}
          {user ? (
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              style={{
                background: 'var(--yellow)',
                border: 'none',
                color: '#080808',
                borderRadius: 20,
                padding: '4px 14px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Progress bar */}
      {stage !== 'intake' && <ProgressBar stage={stage} />}

      {/* Back button */}
      {stageIdx > 0 && stage !== 'checkin' && (
        <div style={{
          maxWidth: 680, width: '100%',
          margin: '0 auto',
          padding: '0.75rem 1.25rem 0',
        }}>
          <button
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 0,
              textTransform: 'uppercase',
            }}
          >
            ← Back
          </button>
        </div>
      )}

      {/* Main */}
      <main style={{
        flex: 1, maxWidth: 680, width: '100%',
        margin: '0 auto', padding: '1.5rem 1.25rem 4rem',
      }}>
        <div key={key}>
          {renderStage()}
        </div>
      </main>

      {/* Gamification overlays */}
      <AchievementPopup
        achievement={currentAchievement}
        onDone={() => setCurrentAchievement(null)}
      />

      <LevelUpOverlay
        level={levelUpShow}
        onDone={() => setLevelUpShow(null)}
      />

      {cpFlash && (
        <CPFlash
          key={cpFlash.id}
          amount={cpFlash.amount}
          label={cpFlash.label}
          onDone={() => setCpFlash(null)}
        />
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}

