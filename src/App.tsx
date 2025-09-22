import React from 'react';
import './App.css';

const LOADING_DURATION = 3 * 60 * 1000; // three minutes

function App() {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const start = Date.now();

    const tick = () => {
      const now = Date.now();
      setElapsed((prevElapsed) => {
        const nextElapsed = Math.min(now - start, LOADING_DURATION);
        if (nextElapsed === LOADING_DURATION) {
          window.clearInterval(intervalId);
        }
        return nextElapsed;
      });
    };

    const intervalId = window.setInterval(tick, 100);
    tick();

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const progress = Math.min(elapsed / LOADING_DURATION, 1);
  const percentage = Math.round(progress * 100);
  const isComplete = progress >= 1;

  return (
    <div className="App">
      <div className="App-background" aria-hidden="true" />
      <main className="Loading" role="status" aria-live="polite">
        <div className="Loading-glow" aria-hidden="true" />
        <div className="Loading-indicator">
          <svg
            className="Loading-ring"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <circle className="Loading-ring__track" cx="60" cy="60" r="54" />
            <circle
              className="Loading-ring__progress"
              cx="60"
              cy="60"
              r="54"
              style={{ strokeDashoffset: 339.292 - 339.292 * progress }}
            />
          </svg>
          <span className="Loading-percentage">
            {percentage.toLocaleString('fa-IR')}%
          </span>
        </div>
        <h1 className="Loading-title">
          {isComplete ? 'آماده شد' : 'در حال بارگذاری'}
        </h1>
        <p className="Loading-subtitle">
          {isComplete
            ? 'با سپاس از شکیبایی شما'
            : 'برای تجربه‌ای بهتر، چند دقیقه شکیبا باشید'}
        </p>
      </main>
    </div>
  );
}

export default App;
