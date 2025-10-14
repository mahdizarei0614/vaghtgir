import React, { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Confetti from 'react-confetti';
import './App.css';
import { TIME_QUOTES } from './timeQuotes';

declare global {
  interface ViewTransition {
    ready: Promise<void>;
  }

  interface Document {
    startViewTransition?: (callback: () => void) => ViewTransition;
  }
}

const MIN_LOADING_DURATION_MS = 180_000;
const MAX_LOADING_DURATION_MS = 240_000;
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const QUOTE_DISPLAY_DURATION_MS = 10_000;
const QUOTE_FADE_DURATION_MS = 1_000;

type ThemeTransitionContext = {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  currentTheme: 'light' | 'dark';
  nextTheme: 'light' | 'dark';
  index: number;
};

type ThemeTransition = (root: HTMLElement, context: ThemeTransitionContext) => void;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const softFadeTransition: ThemeTransition = (root) => {
  root.animate(
    [
      { opacity: 0, filter: 'blur(28px) saturate(120%)' },
      { opacity: 1, filter: 'blur(0px) saturate(100%)' },
    ],
    {
      duration: 460,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      pseudoElement: '::view-transition-new(root)',
    }
  );

  root.animate(
    [
      { opacity: 1, filter: 'blur(0px) saturate(100%)' },
      { opacity: 0, filter: 'blur(20px) saturate(80%)' },
    ],
    {
      duration: 380,
      easing: 'cubic-bezier(0.64, 0, 0.78, 0)',
      pseudoElement: '::view-transition-old(root)',
    }
  );
};

const horizonSlideTransition: ThemeTransition = (root, { nextTheme }) => {
  const direction = nextTheme === 'dark' ? -1 : 1;
  const offset = 48 * direction;

  root.animate(
    [
      { transform: `translateX(${offset}px) scale(0.96)`, opacity: 0 },
      { transform: 'translateX(0px) scale(1)', opacity: 1 },
    ],
    {
      duration: 520,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      pseudoElement: '::view-transition-new(root)',
    }
  );

  root.animate(
    [
      { transform: 'translateX(0px) scale(1)', opacity: 1 },
      { transform: `translateX(${-offset * 0.45}px) scale(1.02)`, opacity: 0 },
    ],
    {
      duration: 420,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      pseudoElement: '::view-transition-old(root)',
    }
  );
};

const angledRevealTransition: ThemeTransition = (root, { x, y, viewportWidth, viewportHeight }) => {
  const horizontalBias = clamp(x / Math.max(viewportWidth, 1), 0, 1);
  const verticalBias = clamp(y / Math.max(viewportHeight, 1), 0, 1);
  const startX = Math.round(horizontalBias * 40);
  const startY = Math.round((1 - verticalBias) * 40);

  root.animate(
    {
      clipPath: [
        `polygon(0% 0%, ${startX}% 0%, 0% ${startY}%, 0% 0%)`,
        'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      ],
    },
    {
      duration: 560,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      pseudoElement: '::view-transition-new(root)',
    }
  );

  root.animate(
    {
      clipPath: [
        'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        `polygon(${100 - startX}% 100%, 100% ${100 - startY}%, 100% 100%, ${100 - startX}% 100%)`,
      ],
    },
    {
      duration: 480,
      easing: 'cubic-bezier(0.7, 0, 0.84, 0)',
      pseudoElement: '::view-transition-old(root)',
    }
  );
};

const verticalCurtainTransition: ThemeTransition = (root, { nextTheme }) => {
  const fromBottom = nextTheme === 'light';
  root.animate(
    {
      clipPath: fromBottom
        ? ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']
        : ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'],
    },
    {
      duration: 620,
      easing: 'cubic-bezier(0.3, 1, 0.3, 1)',
      pseudoElement: '::view-transition-new(root)',
    }
  );

  root.animate(
    {
      clipPath: fromBottom
        ? ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)']
        : ['inset(0% 0% 0% 0%)', 'inset(100% 0% 0% 0%)'],
    },
    {
      duration: 480,
      easing: 'cubic-bezier(0.7, 0, 0.84, 0)',
      pseudoElement: '::view-transition-old(root)',
    }
  );
};

const THEME_TRANSITIONS: readonly ThemeTransition[] = [
  softFadeTransition,
  horizonSlideTransition,
  angledRevealTransition,
  verticalCurtainTransition,
];

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = 'light';
      }
      return false;
    }

    const storedPreference = window.localStorage.getItem('theme');
    let initial = false;

    if (storedPreference === 'dark') {
      initial = true;
    } else if (storedPreference === 'light') {
      initial = false;
    } else {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)');
      initial = prefersDark ? prefersDark.matches : false;
    }

    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = initial ? 'dark' : 'light';
    }

    return initial;
  });
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  const themeAnimationIndexRef = useRef(0);

  const toggleTheme = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof document === 'undefined') {
      setIsDarkMode((prev) => !prev);
      return;
    }

    const root = document.documentElement;
    const currentTheme = root.dataset.theme === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const selectTransition = () => {
      const index = themeAnimationIndexRef.current % THEME_TRANSITIONS.length;
      themeAnimationIndexRef.current = (themeAnimationIndexRef.current + 1) % THEME_TRANSITIONS.length;
      return { index, transition: THEME_TRANSITIONS[index] };
    };

    const updateTheme = () => {
      flushSync(() => {
        setIsDarkMode(nextTheme === 'dark');
      });
    };

    const { index, transition } = selectTransition();

    if (!document.startViewTransition || !transition) {
      updateTheme();
      return;
    }

    try {
      const viewTransition = document.startViewTransition(updateTheme);

      viewTransition.ready
        .then(() => {
          const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : root.clientWidth;
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : root.clientHeight;
          transition(root, {
            x,
            y,
            viewportWidth,
            viewportHeight,
            currentTheme,
            nextTheme,
            index,
          });
        })
        .catch(() => {
          /* no-op: allow the theme change without the reveal animation */
        });
    } catch {
      updateTheme();
    }
  }, []);

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
  const progressIndicatorBackground = React.useMemo(() => {
    const clamped = Math.min(Math.max(progress, 0), 100);
    const leadingColor = isDarkMode
      ? 'rgba(56, 189, 248, 0.88)'
      : 'rgba(255, 140, 105, 0.9)';
    const trailingColor = isDarkMode
      ? 'rgba(15, 23, 42, 0.65)'
      : 'rgba(255, 255, 255, 0.5)';

    return `conic-gradient(${leadingColor} ${clamped}%, ${trailingColor} ${clamped}%), var(--progress-indicator-radial)`;
  }, [isDarkMode, progress]);

  const progressIndicatorStyle = React.useMemo<React.CSSProperties>(
    () => ({
      background: progressIndicatorBackground,
    }),
    [progressIndicatorBackground]
  );
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
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={isDarkMode ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
        title={isDarkMode ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
      >
        <span aria-hidden="true" className="theme-toggle__icon">
          {isDarkMode ? '☀️' : '🌙'}
        </span>
      </button>
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
