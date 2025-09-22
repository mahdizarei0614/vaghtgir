import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const LOADING_DURATION_MS = 180_000;
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const QUOTES: { text: string; author: string }[] = [
  { text: 'زمان بی‌رحم‌ترین داور است.', author: 'سوفوکل' },
  { text: 'زمان همان سرمایه پنهان زندگی است.', author: 'بنجامین فرانکلین' },
  { text: 'زمان همه نقاب‌ها را کنار می‌زند.', author: 'ویلیام شکسپیر' },
  { text: 'زمان عادلانه‌ترین قاضی جهان است.', author: 'ژان دو لافونتن' },
  { text: 'زمان شاگرد فرزانه حقیقت است.', author: 'افلاطون' },
  { text: 'زمان دروغ را خسته می‌کند.', author: 'آیسخلوس' },
  { text: 'زمان معمار تغییر است.', author: 'نلسون ماندلا' },
  { text: 'زمان موجی است که جرئت می‌خواهد.', author: 'ناپلئون بناپارت' },
  { text: 'زمان دشمن تنبلی است.', author: 'توماس جفرسون' },
  { text: 'زمان میدان آزمون اراده است.', author: 'مهاتما گاندی' },
  { text: 'زمان تیزتر از شمشیر است.', author: 'جلال‌الدین محمد بلخی' },
  { text: 'زمان بعد چهارم اندیشه است.', author: 'آلبرت اینشتین' },
  { text: 'زمان کارگاه آرام نبوغ است.', author: 'لئوناردو داوینچی' },
  { text: 'زمان شعر خاموش زندگی است.', author: 'ویکتور هوگو' },
  { text: 'زمان موتور انقلاب‌هاست.', author: 'ولادیمیر لنین' },
  { text: 'زمان غربالگر روح است.', author: 'سعدی شیرازی' },
  { text: 'زمان گوهر بردباران است.', author: 'امام علی (ع)' },
  { text: 'زمان متحد قهرمانان است.', author: 'وینستون چرچیل' },
  { text: 'زمان شعر طبیعت است.', author: 'هنری دیوید ثورو' },
  { text: 'زمان صدای عدالت است.', author: 'مارتین لوتر کینگ جونیور' },
  { text: 'زمان شاعر خاطره‌هاست.', author: 'خلیل جبران' },
  { text: 'زمان نفس خرد است.', author: 'رنه دکارت' },
  { text: 'زمان رنگ هنر را می‌سازد.', author: 'پابلو پیکاسو' },
  { text: 'زمان سپر حقیقت است.', author: 'ژرژ برنارد شاو' },
  { text: 'زمان افق علم را می‌گشاید.', author: 'استیون هاوکینگ' },
  { text: 'زمان زر ناب زندگی است.', author: 'یوهان ولفگانگ گوته' },
  { text: 'زمان قلم تاریخ است.', author: 'هرودوت' },
  { text: 'زمان چراغ راه سیاست است.', author: 'بنجامین دیزرائیلی' },
  { text: 'زمان طب روح انسان است.', author: 'الکساندر پوشکین' },
  { text: 'زمان سلطان بی‌تاج طبیعت است.', author: 'ویلیام وردزورث' },
  { text: 'زمان قلب ریاضیات است.', author: 'کارل فریدریش گاوس' },
  { text: 'زمان داور نهایی تاریخ است.', author: 'جان اف کندی' },
  { text: 'زمان یار پنهان امید است.', author: 'آنه فرانک' },
  { text: 'زمان ضربان شعر است.', author: 'امیلی دیکنسون' },
  { text: 'زمان میدان رقص قدرت است.', author: 'فریدریش نیچه' },
  { text: 'زمان شکل‌ دهنده اندیشه است.', author: 'ارسطو' },
  { text: 'زمان مادر فضیلت‌هاست.', author: 'کنفوسیوس' },
  { text: 'زمان رود آرام رؤیاهاست.', author: 'سهراب سپهری' },
  { text: 'زمان ساقی رازهای عشق است.', author: 'حافظ' },
  { text: 'زمان آینه اندازه‌گیری است.', author: 'عمر خیام' },
  { text: 'زمان ستون مسیرهای یخ‌زده است.', author: 'رابرت فراست' },
  { text: 'زمان آزمایشگاه کشف است.', author: 'ماری کوری' },
  { text: 'زمان ویراستار روح است.', author: 'جین آستن' },
  { text: 'زمان نفس آرام تائو است.', author: 'لائوتسه' },
  { text: 'زمان فرمانده نهایی میدان است.', author: 'سان تزو' },
  { text: 'زمان شاخص تکامل است.', author: 'چارلز داروین' },
  { text: 'زمان سیم نازک الهام است.', author: 'نیکولا تسلا' },
  { text: 'زمان قانون بزرگ طبیعت است.', author: 'آیزاک نیوتن' },
  { text: 'زمان سایه بلند خاطره است.', author: 'ادگار آلن پو' },
  { text: 'زمان تپش آرام روح است.', author: 'هرمان هسه' },
  { text: 'زمان عطر ماندگار شعر است.', author: 'رابیندرانات تاگور' },
  { text: 'زمان به هر داستان جان می‌دهد.', author: 'گابریل گارسیا مارکز' },
  { text: 'زمان استاد تلخ آگاهی است.', author: 'آرتور شوپنهاور' },
  { text: 'زمان بذر پرواز خیال است.', author: 'آنتوان دو سنت‌اگزوپری' },
  { text: 'زمان قاضی بی‌چهره ماست.', author: 'ژان پل سارتر' },
  { text: 'زمان فریاد رهایی است.', author: 'فریدریش شیلر' },
  { text: 'زمان ستون جمهوریت است.', author: 'جرج واشینگتن' },
  { text: 'زمان هنرمند قدرت است.', author: 'نیکولو ماکیاولی' },
  { text: 'زمان میدان نبرد برابری است.', author: 'سیمون دوبووار' },
  { text: 'زمان رود خاموش شعر است.', author: 'تی. اس. الیوت' },
  { text: 'زمان همسایه وجدان است.', author: 'لئو تولستوی' },
  { text: 'زمان بازیگر سکوت است.', author: 'اوژن یونسکو' },
  { text: 'زمان افق دل هواپیماست.', author: 'آملیا ارهارت' },
  { text: 'زمان کلید تجربه است.', author: 'فرانسیس بیکن' },
  { text: 'زمان روح سنگ را نرم می‌کند.', author: 'میکل‌آنژ' },
  { text: 'زمان هندسه اخلاق است.', author: 'باروخ اسپینوزا' },
  { text: 'زمان ناخدای قصه‌هاست.', author: 'ژوزف کنراد' },
  { text: 'زمان قطب‌نمای ماجراجو است.', author: 'ارنست همینگوی' },
  { text: 'زمان شمشیر هنرهای رزمی است.', author: 'بروس لی' },
  { text: 'زمان ابزار دقیق خلاقیت است.', author: 'استیو جابز' },
  { text: 'زمان وزنه سنجش تمرکز است.', author: 'بیل گیتس' },
  { text: 'زمان شعر علم کیهان است.', author: 'کارل ساگان' },
  { text: 'زمان آینه ناخودآگاه است.', author: 'کارل گوستاو یونگ' },
  { text: 'زمان معمار استدلال است.', author: 'برتراند راسل' },
  { text: 'زمان اندازه شور زیستن است.', author: 'آلبر کامو' },
  { text: 'زمان تیغ نقد اجتماع است.', author: 'جلال آل احمد' },
  { text: 'زمان سیم طلایی شعر است.', author: 'پروین اعتصامی' },
  { text: 'زمان نبض جسارت شعر است.', author: 'فروغ فرخزاد' },
  { text: 'زمان سفرنامه حقیقت است.', author: 'ناصرخسرو' },
  { text: 'زمان چراغ پژوهش است.', author: 'ابوریحان بیرونی' },
  { text: 'زمان ضربه‌گیر نبوغ است.', author: 'لودویگ فان بتهوون' },
  { text: 'زمان مترونوم الهام است.', author: 'ولفگانگ آمادئوس موتسارت' },
  { text: 'زمان زبان منطق است.', author: 'لودویگ ویتگنشتاین' },
  { text: 'زمان تپش فلسفه است.', author: 'آلن واتس' },
  { text: 'زمان استاد طنز جهان است.', author: 'مارک تواین' },
  { text: 'زمان ملوان دریای خیال است.', author: 'هرمان ملویل' },
  { text: 'زمان نامه‌رسان حیرت است.', author: 'فرانتس کافکا' },
  { text: 'زمان نسیم شعله‌ور شعر است.', author: 'سیلویا پلات' },
  { text: 'زمان چراغ نقد قدرت است.', author: 'جورج اورول' },
  { text: 'زمان آهنگ جان انسان است.', author: 'فیودور داستایفسکی' },
  { text: 'زمان آیینه حماسه است.', author: 'ابوالقاسم فردوسی' },
  { text: 'زمان معیار آزادی است.', author: 'جان استوارت میل' },
  { text: 'زمان زیست‌شناسی جامعه است.', author: 'اگوست کنت' },
  { text: 'زمان رمز ذهن ماشینی است.', author: 'آلن تورینگ' },
  { text: 'زمان سبک بیان را می‌سازد.', author: 'کوکو شانل' },
  { text: 'زمان آیینه خنده ماست.', author: 'رابین ویلیامز' },
  { text: 'زمان فرصت جسارت است.', author: 'اپرا وینفری' },
  { text: 'زمان ساز امید نسل‌هاست.', author: 'مالالا یوسفزی' },
  { text: 'زمان چرخه شجاعت است.', author: 'رزا پارکس' }
];

const createRandomOrder = () => {
  const indices = Array.from({ length: QUOTES.length }, (_, index) => index);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [quoteOrder, setQuoteOrder] = useState<number[]>(() => createRandomOrder());
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);
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

  useEffect(() => {
    if (!quoteOrder.length) {
      return undefined;
    }

    setIsQuoteVisible(true);

    const displayDuration = 10_000;
    const fadeDuration = 800;
    let fadeTimeout: number | undefined;

    const intervalId = window.setInterval(() => {
      setIsQuoteVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setCurrentQuoteIndex((previous) => {
          const nextIndex = previous + 1;
          if (nextIndex >= quoteOrder.length) {
            setQuoteOrder(createRandomOrder());
            return 0;
          }
          return nextIndex;
        });
        setIsQuoteVisible(true);
      }, fadeDuration);
    }, displayDuration);

    return () => {
      window.clearInterval(intervalId);
      if (fadeTimeout !== undefined) {
        window.clearTimeout(fadeTimeout);
      }
    };
  }, [quoteOrder]);

  const progressValue = Math.min(100, Math.round(progress));
  const progressIndicatorStyle = {
    '--progress': progress.toFixed(2),
  } as React.CSSProperties;
  const activeQuote = quoteOrder.length ? QUOTES[quoteOrder[currentQuoteIndex]] : undefined;

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
            <p className="loading-text">آرام بمان. مأموریت سرد و جدی است.</p>
            <p className="loading-subtext">چشم از زمان برندار. ثانیه‌ها حساب می‌شوند.</p>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-note">در مسیر بمان. زمان حریف ندارد.</p>
            <p className="progress-footnote">نفس عمیق. عملیات خودش تو را نگه می‌دارد.</p>
          </div>
        </div>
      ) : (
        <div className="loaded-message">
          <h1>مأموریت تموم شد، یا شاید نه.</h1>
          <p>
            تو همین حالا{' '}
            <span className="wasted-duration">{formatDuration(elapsedMs ?? LOADING_DURATION_MS)}</span>{' '}
            را دود کردی.
          </p>
          <p>ریفرش کن تا دوباره زمان را قربانی افسانه کنیم.</p>
        </div>
      )}
      {activeQuote ? (
        <div className={`quote-banner ${isQuoteVisible ? 'quote-banner--visible' : ''}`} aria-live="polite">
          <p>
            <span className="quote-text">«{activeQuote.text}»</span>
            <span className="quote-author">— {activeQuote.author}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default App;
