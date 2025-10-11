import React, { useCallback, useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import './App.css';
import { TIME_QUOTES } from './timeQuotes';

const MIN_LOADING_DURATION_MS = 180_000;
const MAX_LOADING_DURATION_MS = 240_000;
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

const getWindowSize = () => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0,
});

function App() {
  const loadingDurationMs = React.useMemo(
    () => Math.round(MIN_LOADING_DURATION_MS + Math.random() * (MAX_LOADING_DURATION_MS - MIN_LOADING_DURATION_MS)),
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  // const [liveElapsedMs, setLiveElapsedMs] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isQuoteVisible, setIsQuoteVisible] = useState(false);
  const [windowSize, setWindowSize] = useState(getWindowSize);
  const progressRef = useRef(0);
  const progressAnimationFrameRef = useRef<number | null>(null);
  const pendingProgressRef = useRef<number | null>(null);
  const isCompleteRef = useRef(false);
  const quoteOrderRef = useRef<number[]>([]);
  const quotePointerRef = useRef(0);
  const quoteIntervalRef = useRef<number | null>(null);
  const quoteFadeTimeoutRef = useRef<number | null>(null);

  const flushProgressUpdate = useCallback(() => {
    if (pendingProgressRef.current === null) {
      progressAnimationFrameRef.current = null;
      return;
    }

    setProgress(pendingProgressRef.current);
    pendingProgressRef.current = null;
    progressAnimationFrameRef.current = null;
  }, []);

  const queueProgressUpdate = useCallback(
    (value: number) => {
      if (
        Math.abs(progressRef.current - value) < 0.001 &&
        pendingProgressRef.current === null
      ) {
        return;
      }

      progressRef.current = value;
      pendingProgressRef.current = value;

      if (progressAnimationFrameRef.current === null) {
        progressAnimationFrameRef.current = window.requestAnimationFrame(flushProgressUpdate);
      }
    },
    [flushProgressUpdate]
  );

  const cancelQueuedProgressUpdate = useCallback(() => {
    if (progressAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(progressAnimationFrameRef.current);
      progressAnimationFrameRef.current = null;
    }
    pendingProgressRef.current = null;
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), loadingDurationMs);
    return () => window.clearTimeout(timer);
  }, [loadingDurationMs]);

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
      const normalized = Math.min(elapsed / loadingDurationMs, 1);
      // setLiveElapsedMs(elapsed);
      const currentNormalized = progressRef.current / 100;
      const eased = 1 - Math.pow(1 - normalized, 3);
      const progressHeadroom = Math.max(0, 1 - normalized);
      const waveAmplitude = progressHeadroom > 0 ? 0.22 * Math.pow(progressHeadroom, 0.6) : 0;
      const wave = Math.sin(now / 1800) * waveAmplitude + Math.sin(now / 3100 + 1.2) * waveAmplitude * 0.75;
      const jitter = (Math.random() - 0.5) * waveAmplitude * 0.9;

      const decorated = eased + wave + jitter;
      const guardNormalized = normalized < 1 ? 1 - Math.min(0.02, progressHeadroom * 0.9) : 1;
      const maxAllowed = Math.min(guardNormalized, normalized + waveAmplitude * 0.8, currentNormalized + 0.07);
      const minCandidate = Math.max(0, normalized - waveAmplitude, currentNormalized + 0.0025);
      const minAllowed = Math.min(minCandidate, guardNormalized);
      const boundedNormalized = Math.min(maxAllowed, Math.max(decorated, minAllowed));

      const nextValue = Number((boundedNormalized * 100).toFixed(2));

      queueProgressUpdate(nextValue);

      const remaining = Math.max(0, loadingDurationMs - elapsed);
      const delayBase = remaining > 4_000 ? 160 : 110;
      const delayJitter = remaining > 4_000 ? 520 : 260;
      const delay = delayBase + Math.random() * delayJitter;
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
      cancelQueuedProgressUpdate();
    };
  }, [loadingDurationMs, queueProgressUpdate, cancelQueuedProgressUpdate]);

  useEffect(() => {
    if (!isLoading) {
      isCompleteRef.current = true;
      queueProgressUpdate(100);

      const now = performance.now();
      const startTime = startTimeRef.current ?? now - loadingDurationMs;
      const totalElapsed = now - startTime - pausedDurationRef.current;
      setElapsedMs(totalElapsed);
      // setLiveElapsedMs(totalElapsed);
    }
  }, [isLoading, loadingDurationMs, queueProgressUpdate]);

  useEffect(
    () => () => {
      cancelQueuedProgressUpdate();
    },
    [cancelQueuedProgressUpdate]
  );

  useEffect(() => {
    const handleResize = () => setWindowSize(getWindowSize());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isLoading || !TIME_QUOTES.length) {
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

  const progressValue = Math.min(100, Math.round(progress));
  const progressIndicatorStyle = {
    '--progress': Math.min(progress, 100).toFixed(2),
  } as React.CSSProperties;
  const activeQuote = isLoading ? TIME_QUOTES[currentQuoteIndex] : undefined;
  // const elapsedForDisplay = isLoading ? liveElapsedMs : elapsedMs ?? loadingDurationMs;
  // const formattedElapsed = React.useMemo(() => {
  //   const totalSeconds = Math.max(0, Math.floor(elapsedForDisplay / 1000));
  //   const minutes = Math.floor(totalSeconds / 60);
  //   const seconds = totalSeconds % 60;
  //   const paddedMinutes = toPersianDigits(minutes).padStart(2, PERSIAN_DIGITS[0]);
  //   const paddedSeconds = toPersianDigits(seconds).padStart(2, PERSIAN_DIGITS[0]);
  //   return `${paddedMinutes}:${paddedSeconds}`;
  // }, [elapsedForDisplay]);

  return (
    <div className="App">
      {/*<div className="elapsed-counter" aria-live="polite">*/}
      {/*  <span className="elapsed-counter__label">زمان سپری‌شده</span>*/}
      {/*  <span className="elapsed-counter__value">{formattedElapsed}</span>*/}
      {/*</div>*/}
      {isLoading ? (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="loading-content">
            <span id="progress-indicator-label" className="visually-hidden">
              میزان پیشرفت بارگذاری وقتگیر
            </span>
            <div
              className="progress-indicator"
              style={progressIndicatorStyle}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressValue}
              aria-valuetext={`${progressValue} درصد تکمیل`}
              aria-labelledby="progress-indicator-label"
            >
              <div className="progress-indicator__inner">
                <span className="progress-indicator__value">{progressValue}</span>
                <span className="progress-indicator__suffix">%</span>
              </div>
            </div>
            <p className="loading-text">نفستو نگه دار؛ رمز به زودی لو می‌ره...</p>
            <p className="loading-subtext">لطفاً آرام بمانید و چشم از صفحه برندارید.</p>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="progress-note">میتونی تو این مدت به یه دوچرخه یا یه نون سنگک فکر کنی.</p>
            {/*<p className="progress-footnote">نفس را نگه دار؛ رمز به زودی لو می‌رود.</p>*/}
          </div>
        </div>
      ) : (
        <div className="loaded-state">
          <div className="confetti-layer" aria-hidden="true">
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={260}
              recycle
            />
          </div>
          <div className="loaded-message">
            <bdi>
              همین حالا{' '}
              <bdi className="wasted-duration">{formatDuration(elapsedMs ?? loadingDurationMs)}</bdi>{' '}
              از عمرت دود شد.
            </bdi>
            <bdi>حالا رفرش کن :)</bdi>
          </div>
        </div>
      )}
      {isLoading && activeQuote ? (
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
