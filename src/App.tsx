import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const LOADING_DURATION_MS = 180_000;
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const QUOTE_DISPLAY_DURATION_MS = 10_000;
const QUOTE_FADE_DURATION_MS = 800;

const TIME_QUOTES = [
  { quote: 'زمان همان چیزی است که ما بیش از همه می‌خواهیم و بدترین استفاده را از آن می‌کنیم.', author: 'ویلیام پن' },
  { quote: 'آینده چیزی است که هر کس در نرخ شصت دقیقه در ساعت به آن می‌رسد، هر چه کند یا تنبل باشد.', author: 'سی. اس. لوئیس' },
  { quote: 'زمان بزرگ‌ترین آموزگار است، اما متأسفانه تمام شاگردانش را می‌کشد.', author: 'هکتور برلیوز' },
  { quote: 'زمان به ما می‌آموزد چگونه چیزها را از دست بدهیم.', author: 'الیزابت بیشاپ' },
  { quote: 'راز آن است که وقتی در حال ساختن ثانیه‌ای هستی، لبخند بزنی.', author: 'مارلن دیتریش' },
  { quote: 'زمان چیزی است که انسان همیشه می‌کوشد آن را بکشد، اما در پایان همان زمان است که او را می‌کشد.', author: 'هربرت اسپنسر' },
  { quote: 'تمام وقت‌های تو چیزی جز لحظه‌ای نیست که اکنون در آن ایستاده‌ای.', author: 'مارکوس آئورلیوس' },
  { quote: 'دیروز گذشته است، فردا هنوز نیامده؛ تنها امروز است که می‌توانیم کاری انجام دهیم.', author: 'مادر ترزا' },
  { quote: 'زمان هرگز به اندازه کافی نیست، مگر این‌که از آن چیزی بسازی.', author: 'چارلز باکستون' },
  { quote: 'زمان یک رودخانه است و تو همان موجی هستی که به رفتن ادامه می‌دهد.', author: 'جلال‌الدین مولوی' },
  { quote: 'آن‌ها همیشه می‌گویند زمان چیزها را تغییر می‌دهد، اما تو باید خودت آن‌ها را تغییر دهی.', author: 'اندی وارهول' },
  { quote: 'زمانی که از دست می‌دهیم، دیگر هرگز باز نمی‌گردد.', author: 'بنجامین فرانکلین' },
  { quote: 'قدر زمان را بدان؛ زیرا از جمع هر لحظه، عمر ساخته می‌شود.', author: 'حکیم عمر خیام' },
  { quote: 'زمان مانند باد است؛ اگر در کنار گوش تو آوازی خواند، به آن گوش بسپار.', author: 'ویلیام شکسپیر' },
  { quote: 'تو نمی‌توانی زمان را نگه داری، اما می‌توانی با آن همراه شوی.', author: 'جک کورنفلد' },
  { quote: 'لحظه‌های کوچک را جدی بگیر؛ زندگی از همان‌ها ساخته شده است.', author: 'امیلی دیکنسون' },
  { quote: 'لحظه اکنون تنها زمانی است که داری. آن را زنده کن.', author: 'تای نات هان' },
  { quote: 'زمان آینه‌ای است که واقعیت در آن تمرین می‌کند.', author: 'خورخه لوئیس بورخس' },
  { quote: 'زمان بهترین درمانگر و بدترین نویسنده خاطرات است.', author: 'اسکار وایلد' },
  { quote: 'با زمان می‌توان همه چیز را یافت، جز وقت از دست رفته را.', author: 'میگل د سروانتس' },
  { quote: 'زمان هرگز به عقب برنمی‌گردد؛ پس با سرعت قلبت جلو برو.', author: 'نلسون ماندلا' },
  { quote: 'در زمان خودت قدم بزن، اما هرگز در همان نقطه نمان.', author: 'بودا' },
  { quote: 'زمان آزمونی است که حقیقت را آشکار می‌کند.', author: 'لئوناردو داوینچی' },
  { quote: 'زمان دشمن نیست؛ زمان همان استاد سخت‌گیر است.', author: 'کالین پاول' },
  { quote: 'زندگی چیزی جز جمع دقایق نیست؛ آن‌ها را با نور پر کن.', author: 'رابرت اچ. شولر' },
  { quote: 'وقتی که می‌گویی وقت ندارم، یعنی مهم‌تر از این را برگزیده‌ام.', author: 'لائوتسه' },
  { quote: 'زمان از ما می‌گذرد، اما رد پایمان را می‌سنجد.', author: 'رابرت فراست' },
  { quote: 'زمان چیزی است که در نبود آن همه چیز اتفاق می‌افتد.', author: 'ریچارد فاینمن' },
  { quote: 'هر دقیقه‌ای که ناراحت باشی، شصت ثانیه شادی را هدر داده‌ای.', author: 'رالف والدو امرسون' },
  { quote: 'صبر، هنرِ پوشیدن لباس زمان است.', author: 'آناتول فرانس' },
  { quote: 'زمان همان پرده‌ای است که روی حقیقت کشیده‌اند.', author: 'خلیل جبران' },
  { quote: 'اگر زمانت را برای چیزی که دوست داری خرج نکنی، فردا از تو قرض می‌گیرد.', author: 'لئو بوسکالیا' },
  { quote: 'می‌توانی ساعت را متوقف کنی، اما نه ثانیه را.', author: 'آلبرت انیشتین' },
  { quote: 'درنگ کردن باکی ندارد، اگر بدانیم به کدام سو می‌رویم.', author: 'سوزان سانتاگ' },
  { quote: 'زمان، عدالتِ خاموشِ جهان است.', author: 'آنری برگسون' },
  { quote: 'زمان می‌گذرد، خواه تو انجامش دهی یا نه.', author: 'جان ماکسول' },
  { quote: 'امروز همان فردایی است که دیروز درباره‌اش نگران بودی.', author: 'دیل کارنگی' },
  { quote: 'هر لحظه راهی است برای آغاز تازه.', author: 'مریم میرزاخانی' },
  { quote: 'زمان مانند سایه‌ای است که همراهت می‌دود، اما هرگز گرفتار نمی‌شود.', author: 'ناظم حکمت' },
  { quote: 'ساعت‌ها گاهی بلندتر از واژه‌ها صحبت می‌کنند.', author: 'پیتر دراکر' },
  { quote: 'زندگی کوتاه است، اما کافی است اگر قلبت را به کار بگیری.', author: 'مایا آنجلو' },
  { quote: 'آنچه را امروز می‌توانی انجام دهی به لحظه بعد نسپار.', author: 'توماس جفرسون' },
  { quote: 'زمان می‌لغزد، اما رد سرنوشت را بر جا می‌گذارد.', author: 'پابلو نرودا' },
  { quote: 'زمان در سکوت می‌تراود؛ گوش کن تا صدایش را بشنوی.', author: 'نیکوس کازانتزاکیس' },
  { quote: 'زمان، مرز میان رؤیا و واقعیت را ترسیم می‌کند.', author: 'آنا آخماتووا' },
  { quote: 'لحظه‌ای که می‌گذرد، تاریخ می‌شود؛ مراقب امضایت باش.', author: 'محمدعلی فروغی' },
  { quote: 'زمان را نمی‌توان پس داد، اما می‌توان آن را معنادار کرد.', author: 'استیو جابز' },
  { quote: 'زمان کمان آزادی است؛ تیرش همان انتخاب‌های ماست.', author: 'مالکوم ایکس' },
  { quote: 'زمان دروغ نمی‌گوید، فقط صبورانه حقیقت را نشان می‌دهد.', author: 'برتا بنز' },
  { quote: 'زمان، شعر بی‌کلمۀ کیهان است.', author: 'کارل ساگان' },
  { quote: 'هر لحظه فرصتی است برای تبدیل شدن به آنچه می‌توانی باشی.', author: 'مارتین لوتر کینگ جونیور' },
  { quote: 'زمان باید خرج شود، نه کشته.', author: 'چارلز داروین' },
  { quote: 'زمان همیشه فرصت دیگری برای کسی دارد که از نو شروع کند.', author: 'جی. کی. رولینگ' },
  { quote: 'زمان، صحنه‌ای است که در آن صدای تو باید شنیده شود.', author: 'فرانک لوید رایت' },
  { quote: 'زمان دوست بهترین اندیشه‌هاست.', author: 'آنتوان دو سن‌تگزوپری' },
  { quote: 'به زمان اجازه بده تو را کامل کند، نه عجله.', author: 'لئون تروتسکی' },
  { quote: 'هر لحظه‌ای که در سکوت می‌گذرد، گنجی از شناخت می‌سازد.', author: 'برتراند راسل' },
  { quote: 'زمان، آهنگ غیرقابل توقف زندگی است؛ با آن هماهنگ شو.', author: 'باب مارلی' },
  { quote: 'زمان را باید اندازه گرفت، زیرا زندگی را اندازه می‌گیرد.', author: 'پل والری' },
  { quote: 'لحظه‌ها را بنویس؛ تاریخ از همان‌ها شکل می‌گیرد.', author: 'آن بولین' },
  { quote: 'زمان، آینه عدالت است؛ هر چه کاشتی نشان می‌دهد.', author: 'مهاتما گاندی' },
  { quote: 'زمان، فرزند حرکت و پدر فرصت است.', author: 'فرانسیس بیکن' },
  { quote: 'هیچ چیز مانند زمان، رازها را آشکار نمی‌کند.', author: 'اگاتا کریستی' },
  { quote: 'هر ثانیه می‌تواند جرقه‌ای برای تغییری بزرگ باشد.', author: 'الون ماسک' },
  { quote: 'آنچه را که زمان از تو می‌گیرد با دانستن جبران کن.', author: 'ماری کوری' },
  { quote: 'لحظه اکنون کوچک است، اما بی‌نهایت را در خود دارد.', author: 'بلز پاسکال' },
  { quote: 'زمان، زبان مشترک همه انسان‌هاست.', author: 'ویکتور هوگو' },
  { quote: 'زمانی که می‌دوی، ثانیه‌ها دو برابر سریع می‌گذرند.', author: 'یوسین بولت' },
  { quote: 'زمانی که آرام می‌شوی، حقیقت را می‌شنوی.', author: 'اپرا وینفری' },
  { quote: 'بزرگ‌ترین هدیه‌ای که می‌توانی بدهی، دقایقی از زندگی خودت است.', author: 'ریچارد برانسون' },
  { quote: 'زمان مانند آب است؛ اگر مسیرش را نسازی، خودش راهی پیدا می‌کند.', author: 'ایزابل آلنده' },
  { quote: 'زمان بدون هدف، مثل آسمانی بدون ستاره است.', author: 'جیمی هندریکس' },
  { quote: 'زمان، اقیانوس بی‌کران تجربه است؛ تا می‌توانی شنا کن.', author: 'ارنست همینگوی' },
  { quote: 'هر بار که به ساعت نگاه می‌کنی، فرصتی تازه می‌بینی.', author: 'آدری هپبورن' },
  { quote: 'زمان برای کسی صبر نمی‌کند، اما برای رویاپردازان مسیر می‌سازد.', author: 'والت دیزنی' },
  { quote: 'بگذار زمان تو را صیقل دهد، نه فرسوده.', author: 'کنفوسیوس' },
  { quote: 'زمان، معمار خاموش سرنوشت است.', author: 'آندره مالرو' },
  { quote: 'ثانیه‌ها کشتی‌های کوچکی‌اند که خاطره‌ها را حمل می‌کنند.', author: 'ویرجینیا وولف' },
  { quote: 'زمان فرصتی است برای بهتر شدن، نه صرفاً پیر شدن.', author: 'جورج برنارد شاو' },
  { quote: 'زمان، رفیق کسانی است که با عشق حرکت می‌کنند.', author: 'جان لنون' },
  { quote: 'با زمان مثل دوستت رفتار کن؛ صادق، مهربان و دقیق.', author: 'دزموند توتو' },
  { quote: 'زمان می‌تواند دشمن باشد، مگر این‌که آن را رام کنی.', author: 'آملیا ارهارت' },
  { quote: 'ثانیه‌ای که می‌گذرد، شانس دیگری است برای گفتن بله به زندگی.', author: 'سارا برنارد' },
  { quote: 'زمان بهترین داور برای ارزش‌های ماست.', author: 'آبراهام لینکلن' },
  { quote: 'لحظه‌ها را جمع کن، نه بهانه‌ها را.', author: 'هیلاری کلینتون' },
  { quote: 'زمان دروغ را دوام نمی‌دهد؛ حقیقت را بپرس.', author: 'آیزاک نیوتن' },
  { quote: 'هر زمان که می‌ایستی، تاریخ نفسش را نگه می‌دارد.', author: 'جیمز بالدوین' },
  { quote: 'زمان همچون تیغی است که با تلاش کند می‌شود.', author: 'الکساندر دوما' },
  { quote: 'زمان، قاضی بی‌نام جهان است.', author: 'امانوئل کانت' },
  { quote: 'هر دم چون نفسی است که باز نمی‌آید؛ آن را به حکمت صرف کن.', author: 'سعدی شیرازی' },
  { quote: 'زمان همچون موسیقی است؛ اگر گوش ندهی، از دست می‌رود.', author: 'ایگور استراوینسکی' },
  { quote: 'زمان برای کسانی که قلبشان می‌تپد، کافی است.', author: 'گابریل گارسیا مارکز' },
  { quote: 'زمان همان استاد صبور است که هیچ جلسه‌ای را لغو نمی‌کند.', author: 'استیون هاوکینگ' },
  { quote: 'زمان را نمی‌توان ذخیره کرد، فقط می‌توان آن را خرج حقیقت کرد.', author: 'زیگموند فروید' },
  { quote: 'زمان، تنها سرمایه‌ای است که هر انسان به طور مساوی دریافت می‌کند.', author: 'هنری فورد' },
  { quote: 'زمان به ما فرصت می‌دهد که خودمان را از نو بسازیم.', author: 'النور روزولت' },
  { quote: 'زمانِ درست، همان زمانی است که شروع می‌کنی.', author: 'شریل سندبرگ' },
  { quote: 'زمان دروغ را پاک می‌کند، اما حقیقت را پررنگ‌تر.', author: 'رنه دکارت' },
  { quote: 'زمان، زبانی است که جهان با ما صحبت می‌کند.', author: 'آلبر کامو' },
  { quote: 'لحظه اکنون، اوج زندگی است؛ آن را حس کن.', author: 'اکهارت تله' },
];

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
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() =>
    Math.floor(Math.random() * TIME_QUOTES.length)
  );
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
    let displayTimeout: number;
    let switchTimeout: number;

    const scheduleNext = () => {
      displayTimeout = window.setTimeout(() => {
        setIsQuoteVisible(false);
        switchTimeout = window.setTimeout(() => {
          setCurrentQuoteIndex((previousIndex) => {
            if (TIME_QUOTES.length <= 1) {
              return previousIndex;
            }

            let nextIndex = previousIndex;
            while (nextIndex === previousIndex) {
              nextIndex = Math.floor(Math.random() * TIME_QUOTES.length);
            }
            return nextIndex;
          });
          setIsQuoteVisible(true);
          scheduleNext();
        }, QUOTE_FADE_DURATION_MS);
      }, QUOTE_DISPLAY_DURATION_MS);
    };

    scheduleNext();

    return () => {
      window.clearTimeout(displayTimeout);
      window.clearTimeout(switchTimeout);
    };
  }, []);

  const progressValue = Math.min(100, Math.round(progress));
  const progressIndicatorStyle = {
    '--progress': progress.toFixed(2),
  } as React.CSSProperties;
  const currentQuote = TIME_QUOTES[currentQuoteIndex];

  return (
    <div className={`App ${isLoading ? 'is-loading' : 'is-loaded'}`}>
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
            <p className="loading-text">آرام باش؛ عملیات زمان در حال چیدمان است.</p>
            <p className="loading-subtext">سیستم در سکوت می‌تپد، بدون شوخی و بدون توقف.</p>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-note">داده‌ها صاف می‌شوند؛ چشمک نزن.</p>
            <p className="progress-footnote">جای خودت بمان؛ زمان دارد نفس می‌کشد.</p>
          </div>
        </div>
      ) : (
        <div className="loaded-message">
          <h1>ماموریت تمام شد.</h1>
          <p>
            تو همین حالا{' '}
            <span className="wasted-duration">{formatDuration(elapsedMs ?? LOADING_DURATION_MS)}</span>{' '}
            را به تماشای یک نوار پیشرفت تقدیم کردی.
          </p>
          <p>اگر این شوخی را دوست داشتی، صفحه را تازه کن و دوباره بخند.</p>
        </div>
      )}
      <div className={`quote-banner ${isQuoteVisible ? 'quote-banner--visible' : ''}`} aria-live="polite">
        <p className="quote-banner__text">«{currentQuote.quote}»</p>
        <span className="quote-banner__author">— {currentQuote.author}</span>
      </div>
    </div>
  );
}

export default App;
