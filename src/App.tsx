import React, { useEffect, useState } from 'react';
import './App.css';

const LOADING_DURATION_MS = 180_000;

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), LOADING_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

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
