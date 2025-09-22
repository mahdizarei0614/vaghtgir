import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const LOADING_DURATION_MS = 180_000;
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const toPersianDigits = (value: number) =>
  value
    .toString()
    .split('')
    .map((char) => (/[0-9]/.test(char) ? PERSIAN_DIGITS[Number(char)] : char))
    .join('');

const formatDuration = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minuteText = minutes > 0 ? `${toPersianDigits(minutes)} دقیقه` : '';
  const secondText = `${toPersianDigits(seconds)} ثانیه`;
  return minuteText ? `${minuteText} و ${secondText}` : secondText;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const progressRef = useRef(0);
  const isCompleteRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), LOADING_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const startTimeRef = useRef<number | null>(null);
  const pausedDurationRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const clearExistingTimeout = () => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    const updateProgress = () => {
      if (isCompleteRef.current) {
        return;
      }

      if (pauseStartRef.current !== null) {
        return;
      }

      const now = performance.now();
      const startTime = startTimeRef.current ?? now;
      const elapsed = now - startTime - pausedDurationRef.current;
      const normalized = Math.min(elapsed / LOADING_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - normalized, 3);
      const wave = Math.sin(now / 1800) * 0.08 + Math.sin(now / 3100 + 1.2) * 0.06;
      const jitter = (Math.random() - 0.5) * 0.06;

      const projected = (eased + wave + jitter) * 100;
      const maxAllowed = normalized * 100 + 12;
      const minAllowed = normalized * 100 - 14;

      const nextValue = Math.max(
        Math.min(projected, maxAllowed, progressRef.current + 5.5, 99.5),
        Math.max(minAllowed, progressRef.current + 0.25)
      );

      progressRef.current = Number(nextValue.toFixed(2));
      setProgress(progressRef.current);

      const delay = 160 + Math.random() * 520;
      scheduleUpdate(delay);
    };

    function scheduleUpdate(delay: number) {
      if (isCompleteRef.current) {
        clearExistingTimeout();
        return;
      }

      clearExistingTimeout();
      timeoutIdRef.current = window.setTimeout(updateProgress, delay);
    }

    const pause = () => {
      if (pauseStartRef.current === null) {
        pauseStartRef.current = performance.now();
      }
      clearExistingTimeout();
    };

    const resume = () => {
      if (pauseStartRef.current !== null) {
        pausedDurationRef.current += performance.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      scheduleUpdate(180);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pause();
      } else {
        resume();
      }
    };

    const handleBlur = () => pause();
    const handleFocus = () => resume();

    scheduleUpdate(280);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearExistingTimeout();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      isCompleteRef.current = true;
      progressRef.current = 100;
      setProgress(100);

      const now = performance.now();
      const startTime = startTimeRef.current ?? now - LOADING_DURATION_MS;
      const totalElapsed = now - startTime - pausedDurationRef.current;
      setElapsedMs(totalElapsed);
    }
  }, [isLoading]);

  const progressValue = Math.min(100, Math.round(progress));
  const progressIndicatorStyle = {
    '--progress': progress.toFixed(2),
  } as React.CSSProperties;

  return (
    <div className="App">
      {isLoading ? (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="loading-content">
            <div
              className="progress-indicator"
              style={progressIndicatorStyle}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressValue}
              aria-valuetext={`${progressValue} درصد تکمیل`}
            >
              <div className="progress-indicator__inner">
                <span className="progress-indicator__value">{progressValue}</span>
                <span className="progress-indicator__suffix">%</span>
              </div>
            </div>
            <p className="loading-text">در حال اتلاف وقت فوق‌حرفه‌ای...</p>
            <p className="loading-subtext">
              سامانه دارد برای سه دقیقه آینده داستانی حماسی دربارهٔ بارگذاری شما می‌نویسد.
            </p>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-note">تا آن موقع به دوچرخه‌ای فکر کنید که سربالایی می‌رود و غر نمی‌زند.</p>
            <p className="progress-footnote">
              هر بار که خسته شدید، یک زنگ خیالی بزنید تا بدانیم هنوز اینجایید.
            </p>
          </div>
        </div>
      ) : (
        <div className="loaded-message">
          <h1>ماموریت اتلاف وقت با موفقیت انجام شد!</h1>
          <p>
            شما رسماً <span className="wasted-duration">{formatDuration(elapsedMs ?? LOADING_DURATION_MS)}</span>{' '}
            از عمر عزیزتان را به این صفحه تقدیم کردید.
          </p>
          <p>
            اگر هنوز توان حرکت دارید، دوچرخه خیالی‌تان را بردارید و یک دور افتخار بزنید، یا صفحه را تازه‌سازی
            کنید تا دوباره به اوج بی‌مصرفی بازگردید.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
