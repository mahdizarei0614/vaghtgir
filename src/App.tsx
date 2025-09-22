import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const LOADING_DURATION_MS = 180_000;

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const remainingTimeRef = useRef(LOADING_DURATION_MS);
  const timerRef = useRef<number | null>(null);
  const lastStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const pauseTimer = () => {
      if (lastStartRef.current !== null) {
        const elapsed = Date.now() - lastStartRef.current;
        remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 0);
        lastStartRef.current = null;
      }
      clearTimer();
    };

    const completeLoading = () => {
      remainingTimeRef.current = 0;
      lastStartRef.current = null;
      setIsLoading(false);
    };

    const startTimer = () => {
      if (remainingTimeRef.current <= 0) {
        completeLoading();
        return;
      }

      lastStartRef.current = Date.now();
      clearTimer();
      timerRef.current = window.setTimeout(completeLoading, remainingTimeRef.current);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTimer();
      } else {
        startTimer();
      }
    };

    if (document.hidden) {
      pauseTimer();
    } else {
      startTimer();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      pauseTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoading]);

  return (
    <div className="App">
      {isLoading ? (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="loading-content">
            <div className="spinner" aria-hidden="true" />
            <p className="loading-text">در حال بارگذاری...</p>
            <p className="loading-subtext">لطفاً تا آماده شدن سامانه شکیبا باشید.</p>
          </div>
        </div>
      ) : (
        <div className="loaded-message">
          <h1>آماده شد!</h1>
          <p>این بخش می‌تواند محتوای اصلی سایت را نمایش دهد.</p>
        </div>
      )}
    </div>
  );
}

export default App;
