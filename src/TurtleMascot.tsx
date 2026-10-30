import { useEffect, useState } from 'react';
import './turtle-mascot.css';

type MascotLanguage = 'ru' | 'en' | 'ar' | 'ky' | 'kk';

type TurtleMascotProps = {
  language: MascotLanguage;
  praise?: string;
  progress: number;
};

const copy: Record<MascotLanguage, { greeting: string; label: string; close: string; progress: string }> = {
  ru: {
    greeting: 'Ассаляму алейкум! Давай изучать знания шаг за шагом.',
    label: 'Открыть подсказку от черепашки',
    close: 'Скрыть подсказку',
    progress: 'Ты уже изучил {count} из 99 имён. Продолжай в своём темпе!',
  },
  en: {
    greeting: 'Assalamu alaikum! Let’s learn step by step.',
    label: 'Open the turtle’s message',
    close: 'Hide the message',
    progress: 'You have learned {count} of 99 names. Keep going at your own pace!',
  },
  ar: {
    greeting: 'السلام عليكم! لنتعلّم خطوةً خطوة.',
    label: 'افتح رسالة السلحفاة',
    close: 'إخفاء الرسالة',
    progress: 'لقد تعلّمت {count} من ٩٩ اسمًا. واصل التعلّم على مهل!',
  },
  ky: {
    greeting: 'Ассаламу алейкум! Кел, билимди кадам сайын үйрөнөлү.',
    label: 'Таш баканын билдирүүсүн ачуу',
    close: 'Билдирүүнү жашыруу',
    progress: 'Сен 99 ысымдын {count} үйрөндүң. Өз ыргагың менен улант!',
  },
  kk: {
    greeting: 'Ассалаумағалейкум! Білімді біртіндеп үйренейік.',
    label: 'Тасбақаның хабарламасын ашу',
    close: 'Хабарламаны жасыру',
    progress: 'Сен 99 есімнің {count} үйрендің. Өз қарқыныңмен жалғастыр!',
  },
};

export function TurtleMascot({ language, praise, progress }: TurtleMascotProps) {
  const [messageOpen, setMessageOpen] = useState(true);
  const text = copy[language] ?? copy.ru;
  const progressMessage = text.progress.replace('{count}', String(progress));
  const message = praise || (progress > 0 ? progressMessage : text.greeting);

  useEffect(() => {
    if (praise) setMessageOpen(true);
  }, [praise]);

  return (
    <aside className={`turtle-mascot${praise ? ' is-celebrating' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {messageOpen && (
        <div className="turtle-mascot__bubble" role="status" aria-live="polite">
          <p>{message}</p>
          <button type="button" onClick={() => setMessageOpen(false)} aria-label={text.close}>×</button>
        </div>
      )}
      <button
        className="turtle-mascot__character"
        type="button"
        aria-label={text.label}
        aria-expanded={messageOpen}
        onClick={() => setMessageOpen(open => !open)}
      >
        <svg className="turtle-mascot__art" viewBox="0 0 260 250" role="img" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="turtle-skin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#b8d99b" />
              <stop offset=".48" stopColor="#83b879" />
              <stop offset="1" stopColor="#477f61" />
            </linearGradient>
            <linearGradient id="turtle-face" x1=".1" y1="0" x2=".85" y2="1">
              <stop offset="0" stopColor="#d4e9b2" />
              <stop offset=".55" stopColor="#a8cf8d" />
              <stop offset="1" stopColor="#6fa16e" />
            </linearGradient>
            <linearGradient id="turtle-shell" x1=".15" y1="0" x2=".9" y2="1">
              <stop offset="0" stopColor="#b9a16a" />
              <stop offset=".35" stopColor="#8b7950" />
              <stop offset=".72" stopColor="#5e6546" />
              <stop offset="1" stopColor="#354d3e" />
            </linearGradient>
            <linearGradient id="turtle-shell-panel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d8c18a" />
              <stop offset="1" stopColor="#88764d" />
            </linearGradient>
            <radialGradient id="turtle-eye" cx=".32" cy=".24" r=".8">
              <stop offset="0" stopColor="#6b5540" />
              <stop offset=".55" stopColor="#2d3029" />
              <stop offset="1" stopColor="#141d19" />
            </radialGradient>
            <radialGradient id="turtle-cheek">
              <stop offset="0" stopColor="#e9a18a" stopOpacity=".6" />
              <stop offset="1" stopColor="#e9a18a" stopOpacity="0" />
            </radialGradient>
            <filter id="turtle-shadow" x="-40%" y="-40%" width="180%" height="190%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <ellipse cx="132" cy="224" rx="82" ry="13" fill="#1b3025" opacity=".18" filter="url(#turtle-shadow)" />

          <g className="turtle-mascot__back-feet">
            <ellipse cx="78" cy="190" rx="26" ry="18" transform="rotate(-20 78 190)" fill="url(#turtle-skin)" />
            <ellipse cx="184" cy="190" rx="26" ry="18" transform="rotate(20 184 190)" fill="url(#turtle-skin)" />
            <path d="M64 190q8 5 15 2M171 192q8 4 16-1" fill="none" stroke="#d9e9c4" strokeWidth="2" strokeLinecap="round" opacity=".65" />
          </g>

          <g className="turtle-mascot__shell">
            <path d="M48 157c0-56 36-94 84-94s84 38 84 94c0 20-19 34-84 34s-84-14-84-34Z" fill="url(#turtle-shell)" stroke="#3d5945" strokeWidth="4" />
            <path d="M63 145c3-42 30-68 69-68s66 26 69 68c-17 14-40 21-69 21s-52-7-69-21Z" fill="url(#turtle-shell-panel)" stroke="#d5c18b" strokeOpacity=".55" strokeWidth="2" />
            <path d="M132 78v88M65 145l67-67 67 67M91 84l41 82M173 84l-41 82" fill="none" stroke="#59634a" strokeWidth="3" opacity=".72" />
            <path d="M83 112l49-34 49 34-49 33Z" fill="none" stroke="#e1d09c" strokeWidth="2" opacity=".65" />
            <path d="M54 156q78 28 156 0" fill="none" stroke="#d7c18b" strokeWidth="4" strokeLinecap="round" opacity=".8" />
            <path d="M77 111q15-27 40-32" fill="none" stroke="#f0dfb4" strokeWidth="5" strokeLinecap="round" opacity=".48" />
          </g>

          <g className="turtle-mascot__front-feet">
            <ellipse cx="91" cy="193" rx="25" ry="17" transform="rotate(-22 91 193)" fill="url(#turtle-skin)" stroke="#67976b" strokeWidth="1.5" />
            <ellipse cx="171" cy="193" rx="25" ry="17" transform="rotate(22 171 193)" fill="url(#turtle-skin)" stroke="#67976b" strokeWidth="1.5" />
            <path d="M77 193q7 5 14 2M158 195q7 4 14-2" fill="none" stroke="#e1edcf" strokeWidth="2" strokeLinecap="round" opacity=".7" />
          </g>

          <g className="turtle-mascot__neck">
            <path d="M94 142q38 16 76 0l-7 42q-31 18-62 0Z" fill="url(#turtle-skin)" />
          </g>

          <g className="turtle-mascot__head">
            <path d="M73 100c0-38 25-66 59-66s59 28 59 66c0 42-24 69-59 69s-59-27-59-69Z" fill="url(#turtle-face)" stroke="#67976b" strokeWidth="2" />
            <ellipse cx="70" cy="111" rx="13" ry="20" transform="rotate(-20 70 111)" fill="#8bbd7c" />
            <ellipse cx="194" cy="111" rx="13" ry="20" transform="rotate(20 194 111)" fill="#8bbd7c" />
            <ellipse cx="100" cy="125" rx="19" ry="11" fill="url(#turtle-cheek)" />
            <ellipse cx="162" cy="125" rx="19" ry="11" fill="url(#turtle-cheek)" />

            <g className="turtle-mascot__eyes">
              <ellipse cx="108" cy="98" rx="13" ry="17" fill="#f7f5e9" />
              <ellipse cx="151" cy="98" rx="13" ry="17" fill="#f7f5e9" />
              <ellipse cx="110" cy="100" rx="8.5" ry="12" fill="url(#turtle-eye)" />
              <ellipse cx="149" cy="100" rx="8.5" ry="12" fill="url(#turtle-eye)" />
              <ellipse cx="107" cy="94" rx="3.2" ry="4" fill="#fff" />
              <ellipse cx="146" cy="94" rx="3.2" ry="4" fill="#fff" />
              <path d="M96 79q12-8 23-1M140 78q12-7 23 1" fill="none" stroke="#5b835d" strokeWidth="3" strokeLinecap="round" />
            </g>

            <path d="M123 119q9 7 18 0" fill="none" stroke="#537b58" strokeWidth="3" strokeLinecap="round" />
            <path d="M115 132q15 14 30 0" fill="none" stroke="#4e7654" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M120 133q10 7 20 0" fill="none" stroke="#f8eee0" strokeWidth="2" strokeLinecap="round" />
            <path d="M83 64q18-22 42-20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".32" />
          </g>

          <g className="turtle-mascot__tail">
            <path d="M128 187q-8 15-2 23 8 5 16-1l-5-22Z" fill="url(#turtle-skin)" />
          </g>

          <g className="turtle-mascot__sparkles" fill="#d6b86e">
            <path d="M218 60l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" />
            <path d="M42 83l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5Z" />
            <circle cx="214" cy="111" r="3" />
          </g>
        </svg>
        <span className="turtle-mascot__glow" aria-hidden="true" />
      </button>
    </aside>
  );
}
