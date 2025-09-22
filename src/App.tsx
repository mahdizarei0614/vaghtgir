import React, { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import './App.css';
import { TIME_QUOTES } from './timeQuotes';

const LOADING_DURATION_MS = 180_000;
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const QUOTE_DISPLAY_DURATION_MS = 10_000;
const QUOTE_FADE_DURATION_MS = 1_000;

const shuffleArray = <T,>(items: readonly T[]) => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const getWindowSize = () =>
  typeof window === 'undefined'
    ? { width: 0, height: 0 }
    : { width: window.innerWidth, height: window.innerHeight };

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
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isQuoteVisible, setIsQuoteVisible] = useState(false);
  const progressRef = useRef(0);
  const isCompleteRef = useRef(false);
  const quoteOrderRef = useRef<number[]>([]);
  const quotePointerRef = useRef(0);
  const quoteIntervalRef = useRef<number | null>(null);
  const quoteFadeTimeoutRef = useRef<number | null>(null);
  const [windowSize, setWindowSize] = useState(getWindowSize);

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

  useEffect(() => {
    if (!TIME_QUOTES.length) {
      return undefined;
    }

    if (!isLoading) {
      setIsQuoteVisible(false);
      return undefined;
    }

    const indexes = TIME_QUOTES.map((_, index) => index);
    quoteOrderRef.current = shuffleArray(indexes);
    quotePointerRef.current = 0;
    setCurrentQuoteIndex(quoteOrderRef.current[0] ?? 0);

    const fadeInTimer = window.setTimeout(() => setIsQuoteVisible(true), 80);

    const cycleQuotes = () => {
      setIsQuoteVisible(false);

      if (quoteFadeTimeoutRef.current !== null) {
        window.clearTimeout(quoteFadeTimeoutRef.current);
      }

      quoteFadeTimeoutRef.current = window.setTimeout(() => {
        const order = quoteOrderRef.current;
        if (!order.length) {
          return;
        }
        quotePointerRef.current = (quotePointerRef.current + 1) % order.length;
        setCurrentQuoteIndex(order[quotePointerRef.current]);
        setIsQuoteVisible(true);
      }, QUOTE_FADE_DURATION_MS);
    };

    quoteIntervalRef.current = window.setInterval(cycleQuotes, QUOTE_DISPLAY_DURATION_MS);

    return () => {
      window.clearTimeout(fadeInTimer);
      if (quoteIntervalRef.current !== null) {
        window.clearInterval(quoteIntervalRef.current);
      }
      if (quoteFadeTimeoutRef.current !== null) {
        window.clearTimeout(quoteFadeTimeoutRef.current);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progressValue = Math.min(100, Math.round(progress));
  const progressIndicatorStyle = {
    '--progress': progress.toFixed(2),
  } as React.CSSProperties;
  const activeQuote = isLoading ? TIME_QUOTES[currentQuoteIndex] : undefined;
  const showConfetti = !isLoading;

  return (
    <div className="App">
      {showConfetti ? (
        <Confetti
          className="confetti-canvas"
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={280}
          recycle
          run
        />
      ) : null}
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
            <p className="loading-text">نفستو نگه دار؛ رمز به زودی لو می‌ره...</p>
            {/*<p className="loading-subtext">سامانه در سکوت می‌تازد؛ تو فقط مراقب باش.</p>*/}
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-note">میتونی تو این مدت به یه دوچرخه یا یه نون سنگک فکر کنی.</p>
            {/*<p className="progress-footnote">نفس را نگه دار؛ رمز به زودی لو می‌رود.</p>*/}
          </div>
        </div>
      ) : (
        <div className="loaded-message">
          <bdi>
            همین حالا{' '}
            <bdi className="wasted-duration">{formatDuration(elapsedMs ?? LOADING_DURATION_MS)}</bdi>{' '}
            از عمرت دود شد.
          </bdi>
          <bdi>حالا رفرش کن :)</bdi>
        </div>
      )}
      {activeQuote ? (
        <div
          className={`quote-banner${isQuoteVisible ? ' quote-banner--visible' : ''}`}
          aria-live="polite"
        >
          <div className="quote-banner__content">
            <span className="quote-banner__text">{activeQuote.text}</span>
            <span className="quote-banner__separator">—</span>
            <span className="quote-banner__author">{activeQuote.author}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
