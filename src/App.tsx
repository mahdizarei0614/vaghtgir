import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const LOADING_DURATION_MS = 3 * 60 * 1000;

const formatTime = (milliseconds: number): string => {
  const remainingSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
};

function App() {
  const [remainingTime, setRemainingTime] = useState<number>(LOADING_DURATION_MS);

  useEffect(() => {
    const startTime = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextRemainingTime = Math.max(LOADING_DURATION_MS - elapsed, 0);

      setRemainingTime(nextRemainingTime);

      if (elapsed >= LOADING_DURATION_MS) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const progress = useMemo(() => {
    const rawProgress = 1 - remainingTime / LOADING_DURATION_MS;
    if (!Number.isFinite(rawProgress)) {
      return 0;
    }

    return Math.min(Math.max(rawProgress, 0), 1);
  }, [remainingTime]);

  const isComplete = remainingTime === 0;
  const statusText = isComplete ? 'آماده شد' : 'در حال بارگذاری...';
  const subtitleText = isComplete
    ? 'با تشکر از شکیبایی شما'
    : 'لطفاً کمی صبر کنید، یک تجربه‌ی ویژه در راه است.';

  return (
    <div className="app-shell">
      <div className="gradient-layer" aria-hidden="true" />
      <div className="loading-card" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true">
          <div className="spinner-core" />
        </div>
        <p className="loading-title">{statusText}</p>
        <p className="loading-subtitle">{subtitleText}</p>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="time-remaining" aria-label={`زمان باقی‌مانده ${formatTime(remainingTime)}`}>
          {formatTime(remainingTime)}
        </p>
      </div>
    </div>
  );
}

export default App;
