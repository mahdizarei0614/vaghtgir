import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const LOADING_DURATION_MS = 180_000;
const QUOTE_DISPLAY_DURATION_MS = 10_000;
const QUOTE_FADE_DURATION_MS = 900;

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

type Quote = {
  text: string;
  author: string;
};

const QUOTES: Quote[] = [
  { text: 'زمان خم می‌شود، اما قانونش شوخی ندارد.', author: 'آلبرت اینشتین' },
  { text: 'زمان مثل گرانش، فقط وقتی حسش می‌کنی که دیر شده.', author: 'ایزاک نیوتن' },
  { text: 'زمان، جریان برقی است که هر لحظه مدار تازه می‌سازد.', author: 'نیکولا تسلا' },
  { text: 'با زمان زیاد بازی نکن؛ او سیاهچاله‌ای بی‌رحم است.', author: 'استیون هاوکینگ' },
  { text: 'زمان گرد و غبار ستاره‌ها را به قصه تبدیل می‌کند.', author: 'کارل ساگان' },
  { text: 'زمان قلم‌موی من است؛ هر ضربه، سکوتی را روشن می‌کند.', author: 'لئوناردو داوینچی' },
  { text: 'زمان، آزمایشگاهی است که صبر را تقطیر می‌کند.', author: 'ماری کوری' },
  { text: 'زمان همان تغییر است؛ اگر نفهمی، فلسفه‌ات ناقص است.', author: 'ارسطو' },
  { text: 'زمان، ایده‌ها را غربال می‌کند و حقیقت را نگه می‌دارد.', author: 'افلاطون' },
  { text: 'زمان همان آموزگار خاموشی است که سوال‌های سخت می‌پرسد.', author: 'سقراط' },
  { text: 'با زمان دوستی کن؛ دشمنی با او فقط تو را پیر می‌کند.', author: 'سنکا' },
  { text: 'زمان، میدان نبرد ذهن است؛ نظم بده و پیروز شو.', author: 'مارکوس اورلیوس' },
  { text: 'زمان تنها چیزی است که برده‌ها و پادشاهان برابر دارند.', author: 'اپیکتتوس' },
  { text: 'همه چیز جاری است؛ زمان نام دیگر این سیلاب است.', author: 'هراکلیتوس' },
  { text: 'زمان مثل آب است؛ نرم اما کوه را می‌شکند.', author: 'لائوتسه' },
  { text: 'وقت را گم نکن؛ او استاد ساختن عادت‌هاست.', author: 'کنفوسیوس' },
  { text: 'هر نفس آگاه، یک لحظه آزاد از زنجیر زمان است.', author: 'بودا' },
  { text: 'زمان را خدمتکار آرمانت کن، نه ارباب ترس‌هایت.', author: 'مهاتما گاندی' },
  { text: 'زمان زخم‌ها را یاد می‌گیرد و تبدیل به شجاعت می‌کند.', author: 'نلسون ماندلا' },
  { text: 'برنده کسی است که نظم زمان را به نفع خود بشکند.', author: 'وینستون چرچیل' },
  { text: 'وقت همان سکه زندگی است؛ عاقلانه خرجش کن.', author: 'بنجامین فرانکلین' },
  { text: 'زمان خاموش، بهترین شریک اختراع است.', author: 'توماس ادیسون' },
  { text: 'هر دقیقه تأخیر، یک خط تولید از کار می‌اندازد.', author: 'هنری فورد' },
  { text: 'زمان محدود است؛ حماقت قرضی از دیگران نگیر.', author: 'استیو جابز' },
  { text: 'زمان درست، تفاوت بین فرصت و بحران است.', author: 'بیل گیتس' },
  { text: 'زمان، سخت‌ترین مهندس فضاست؛ با او هم‌تیم شو.', author: 'ایلان ماسک' },
  { text: 'هر چرخه زمانی، نقشه تازه‌ای برای گسترش می‌کشد.', author: 'جف بزوس' },
  { text: 'زمان، سرمایه‌ای است که فقط با جسارت تکثیر می‌شود.', author: 'جک ما' },
  { text: 'صبوری یعنی سرمایه‌گذاری دوباره روی زمان.', author: 'وارن بافت' },
  { text: 'زمان، پرده‌ای است که باید با صداقت کنار زد.', author: 'اپرا وینفری' },
  { text: 'زمان، وزن کلمات را تعیین می‌کند؛ سبک حرف نزن.', author: 'مایا آنجلو' },
  { text: 'زمان کوتاه است؛ هر لحظه را برای صدای تازه نگه دار.', author: 'ملاله یوسف‌زی' },
  { text: 'عدالت بدون زمان‌بندی، فقط یک شعار خسته‌کننده است.', author: 'مارتین لوتر کینگ جونیور' },
  { text: 'زمان، میدان آزمایشی برای اراده ملت‌هاست.', author: 'آبراهام لینکلن' },
  { text: 'زمان، ستون فقرات انقلاب‌های صبور است.', author: 'جورج واشینگتن' },
  { text: 'در بحران، زمان یا متحد توست یا دشمن تو.', author: 'فرانکلین روزولت' },
  { text: 'زمان، هیجان جست‌وجو را لبه‌دار نگه می‌دارد.', author: 'تئودور روزولت' },
  { text: 'از زمان نترس؛ از تصمیم بدون لحظه مناسب بترس.', author: 'جان اف کندی' },
  { text: 'زمان، دوست خردمند و طنز تلخ فیلسوفان است.', author: 'ولتر' },
  { text: 'زمان، قلم نویسنده را یا زنگ می‌زند یا زر می‌کند.', author: 'ویکتور هوگو' },
  { text: 'هر فصل زمان، لندنی جدید برای داستان است.', author: 'چارلز دیکنز' },
  { text: 'زمان صحنه‌ای است؛ نقش خودت را جدی بازی کن.', author: 'ویلیام شکسپیر' },
  { text: 'زمان، موسیقی خاموش طبیعت است؛ گوش کن.', author: 'یوهان ولفگانگ گوته' },
  { text: 'زمان، چاقوی بی‌صداست؛ مراقب معنا باش.', author: 'فریدریش نیچه' },
  { text: 'زمان، آینه رنج است؛ نگاه کن و آزاد شو.', author: 'آرتور شوپنهاور' },
  { text: 'زمان، قانون‌گذار خاموش عقل است.', author: 'ایمانوئل کانت' },
  { text: 'زمان، شرط‌بندی دل با بی‌نهایت است.', author: 'بلز پاسکال' },
  { text: 'زمان، نخستین اصل هندسه هستی است.', author: 'رنه دکارت' },
  { text: 'زمان، تلسکوپی است که حقیقت را نزدیک می‌آورد.', author: 'گالیله گالیله' },
  { text: 'با زمان درست، مدارها راز خود را می‌گویند.', author: 'یوهانس کپلر' },
  { text: 'زمان، کوانتومی از شگفتی‌های پیوسته است.', author: 'ماکس پلانک' },
  { text: 'هر ثانیه، موجی تازه در اتم می‌لرزد.', author: 'نیلز بور' },
  { text: 'زمان، بازی احتمالات است؛ به رقصش بخند.', author: 'ریچارد فاینمن' },
  { text: 'زمان، کدی است که باید رمزگشایی شود.', author: 'آلن تورینگ' },
  { text: 'زمان، موتور خیال مهندسان محاسبه است.', author: 'آدا لاولیس' },
  { text: 'زمان، کامپایلری است که خطاها را آشکار می‌کند.', author: 'گریس هاپر' },
  { text: 'زمان، مختصات طلایی ناوبری رویاست.', author: 'کاترین جانسون' },
  { text: 'تصویر هر لحظه، در زمان تازه‌ای ظهور می‌کند.', author: 'رزالین فرانکلین' },
  { text: 'زمان، صفحه سفیدی است که باید با شجاعت نوشت.', author: 'مارگارت اتوود' },
  { text: 'زمان، نجیب‌زاده‌ای است؛ با ادب پاسخ بده.', author: 'جین آستن' },
  { text: 'زمان، موجی است که ذهن‌های آزاد را صیقل می‌دهد.', author: 'ویرجینیا وولف' },
  { text: 'زمان، صحنه‌ای برای پرسش‌های بی‌رحم است.', author: 'سیمون دوبووار' },
  { text: 'زمان، سیاست را از شعار تهی می‌کند.', author: 'هانا آرنت' },
  { text: 'زبان بدون زمان، فقط صداست.', author: 'نوام چامسکی' },
  { text: 'زمان، داستان تکامل ذهن جمعی است.', author: 'یووال نوح هراری' },
  { text: 'زمان، متروی مخفی رویاست؛ هر شب حرکت می‌کند.', author: 'هاروکی موراکامی' },
  { text: 'زمان، کیمیای ساده جست‌وجوی دل است.', author: 'پائولو کوئلیو' },
  { text: 'زمان، باغی است که روح را هرس می‌کند.', author: 'جبران خلیل جبران' },
  { text: 'زمان، رقص سماع است؛ اگر بچرخی می‌شنوی.', author: 'مولانا جلال‌الدین محمد بلخی' },
  { text: 'زمان، ساقی شعر است؛ دیر برسی پیمانه خالی است.', author: 'حافظ شیرازی' },
  { text: 'زمان، راهروی ادب است؛ اگر بشتابی لیز می‌خوری.', author: 'سعدی شیرازی' },
  { text: 'زمان، ترازوی شراب و شرر است.', author: 'عمر خیام' },
  { text: 'زمان، کاخ سخن را از نو می‌سازد.', author: 'ابوالقاسم فردوسی' },
  { text: 'زمان، نفسی است که عطار در قفس نمی‌گذارد.', author: 'عطار نیشابوری' },
  { text: 'زمان، نخ قصه را محکم می‌بافد.', author: 'نظامی گنجوی' },
  { text: 'زمان، فریاد کوتاه شعرهای من است.', author: 'فروغ فرخزاد' },
  { text: 'زمان، ریتم غزل را سرخ‌تر می‌کند.', author: 'سیمین بهبهانی' },
  { text: 'زمان، واژه‌ها را به فریاد بلند تبدیل می‌کند.', author: 'احمد شاملو' },
  { text: 'زمان، آینه آب روشن چشمه است.', author: 'سهراب سپهری' },
  { text: 'زمان، وزن عدالت در ترازوست.', author: 'پروین اعتصامی' },
  { text: 'زمان، قلم اعتراض را تیزتر می‌کند.', author: 'جلال آل‌احمد' },
  { text: 'زمان، چراغ خاموش اتاق داستان است.', author: 'صادق هدایت' },
  { text: 'زمان، دوربین صبور روایت است.', author: 'ابراهیم گلستان' },
  { text: 'زمان، فریم‌های خالی را پر از نور می‌کند.', author: 'عباس کیارستمی' },
  { text: 'زمان، سکوت بین دو دیالوگ حیاتی است.', author: 'اصغر فرهادی' },
  { text: 'زمان، باد بانوی جنگل‌های خیال است.', author: 'هایائو میازاکی' },
  { text: 'زمان، تیغه‌ای است که سامورایی را محک می‌زند.', author: 'آکیرا کوروساوا' },
  { text: 'زمان، فاصله آرام دو قاب است.', author: 'یاسوجیرو اوزو' },
  { text: 'زمان، تعلیق را مثل سیم ویولن می‌کشد.', author: 'آلفرد هیچکاک' },
  { text: 'زمان، تدوین نهایی رؤیاهاست.', author: 'استنلی کوبریک' },
  { text: 'زمان، پیچ و خم روایت را می‌پیچاند.', author: 'کریستوفر نولان' },
  { text: 'زمان، میکس نهایی ضرباهنگ انتقام است.', author: 'کوئنتین تارانتینو' },
  { text: 'زمان، لنز تیز سینمای خیابان است.', author: 'مارتین اسکورسیزی' },
  { text: 'زمان، مه صبحگاهی خاطره‌هاست.', author: 'آندری تارکوفسکی' },
  { text: 'زمان، سکوت میان دو اعتراف است.', author: 'اینگمار برگمن' },
  { text: 'زمان، جدول معمایی است که حلش لذت دارد.', author: 'آگاتا کریستی' },
  { text: 'زمان، ذره‌بینی است روی ردپای سرنخ‌ها.', author: 'آرتور کانن دویل' },
  { text: 'زمان، قطاری است که داستان را به ماه می‌برد.', author: 'ژول ورن' },
  { text: 'زمان، ماشین سفر آگاهی است.', author: 'اچ. جی. ولز' },
  { text: 'زمان، قانون اول ربات‌های خیال‌انگیز است.', author: 'آیزاک آسیموف' },
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

const getNextQuoteIndex = (previous: number) => {
  let next = Math.floor(Math.random() * QUOTES.length);
  if (next === previous) {
    next = (previous + 1) % QUOTES.length;
  }
  return next;
};

const QuoteTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [isVisible, setIsVisible] = useState(true);
  const displayTimeoutRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const scheduleNext = () => {
      displayTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
        fadeTimeoutRef.current = window.setTimeout(() => {
          setCurrentIndex((prev) => getNextQuoteIndex(prev));
          setIsVisible(true);
          scheduleNext();
        }, QUOTE_FADE_DURATION_MS);
      }, QUOTE_DISPLAY_DURATION_MS);
    };

    scheduleNext();

    return () => {
      if (displayTimeoutRef.current !== null) {
        window.clearTimeout(displayTimeoutRef.current);
      }
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const quote = QUOTES[currentIndex];

  return (
    <div className={`quote-banner ${isVisible ? 'quote-banner--visible' : ''}`} aria-live="polite">
      <p className="quote-banner__text" dir="rtl">
        <span className="quote-banner__content">{quote.text}</span>
        <span className="quote-banner__author">— {quote.author}</span>
      </p>
    </div>
  );
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
      <div className="view-wrapper">
        <section
          className={`view-panel ${isLoading ? 'view-panel--active' : ''}`}
          aria-hidden={!isLoading}
        >
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
              <p className="loading-text">آرام بمان؛ عملیات جریان دارد.</p>
              <p className="loading-subtext">زمان تو سرمایه است و ما سرگرم سرمایه‌گذاری مخفی هستیم.</p>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <p className="progress-note">پشت صحنه بی‌صدا می‌جوشد.</p>
              <p className="progress-footnote">چشم برندار؛ لحظه مهم همین حوالی است.</p>
            </div>
          </div>
        </section>

        <section
          className={`view-panel ${!isLoading ? 'view-panel--active' : ''}`}
          aria-hidden={isLoading}
        >
          <div className="loaded-message">
            <h1>ماموریت تمام شد.</h1>
            <p>
              تو دقیقاً{' '}
              <span className="wasted-duration">{formatDuration(elapsedMs ?? LOADING_DURATION_MS)}</span>{' '}
              به این صفحه تعظیم کردی.
            </p>
            <p>ریفرش کن اگر مشتاقی دوباره همین شوخی تکرار شود.</p>
          </div>
        </section>
      </div>

      <QuoteTicker />
    </div>
  );
}

export default App;
