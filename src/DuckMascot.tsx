type DuckLanguage = 'ru' | 'en' | 'ar' | 'ky' | 'kk';

const greetings: Record<DuckLanguage, string> = {
  ru: 'Бисмиллях. Давай изучать прекрасные имена Аллаха.',
  en: "Hi! Let's learn one little step at a time.",
  ar: 'مرحبًا! لنتعلّم خطوةً صغيرة كل يوم.',
  ky: 'Салам! Кел, күн сайын аз-аздан үйрөнөлү.',
  kk: 'Сәлем! Күн сайын аз-аздан үйренейік.',
};

const duckTitles: Record<DuckLanguage, string> = {
  ru: 'Милый жёлтый утёнок',
  en: 'Friendly yellow duck',
  ar: 'بطة صفراء لطيفة',
  ky: 'Сүйкүмдүү сары өрдөк',
  kk: 'Сүйкімді сары үйрек',
};

export function DuckMascot({ language }: { language: DuckLanguage }) {
  return (
    <aside className="duck-mascot">
      <div className="duck-speech" lang={language} dir={language === 'ar' ? 'rtl' : 'auto'}>{greetings[language]}</div>
      <svg className="duck-mascot-art" viewBox="0 0 220 190" role="img" aria-labelledby="duck-title">
        <title id="duck-title">{duckTitles[language]}</title>
        <ellipse cx="112" cy="166" rx="63" ry="11" fill="#dce8d9" />
        <path d="M54 122c-9-15-8-34 4-47 11-12 30-15 48-9 20-8 47-1 59 15 10 13 13 32 5 48-9 20-31 29-63 27-27-2-44-13-53-34Z" fill="#f6cf58" stroke="#d8a93b" strokeWidth="3" />
        <path d="M56 111c-16-9-27-6-35 4 15 3 24 10 29 21" fill="#efbd45" stroke="#d8a93b" strokeWidth="3" strokeLinejoin="round" />
        <path d="M77 146c-2 9-8 13-18 13m59-11c1 8 7 12 17 12" fill="none" stroke="#c58d35" strokeWidth="5" strokeLinecap="round" />
        <path d="M147 103c15-11 32-11 43-3-10 12-25 17-42 13" fill="#f2a34a" stroke="#d78b37" strokeWidth="3" strokeLinejoin="round" />
        <path d="M87 31c10-13 31-17 47-7 15 10 20 28 12 44-8 17-29 25-48 16-19-8-26-31-11-53Z" fill="#ffdc70" stroke="#d8a93b" strokeWidth="3" />
        <path d="M80 52c-8-10-19-12-29-7 4 13 14 20 28 20" fill="#f6cf58" stroke="#d8a93b" strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="113" cy="48" rx="3.8" ry="5" fill="#4d4638" />
        <ellipse cx="139" cy="48" rx="3.8" ry="5" fill="#4d4638" />
        <circle cx="99" cy="60" r="6" fill="#f3a18d" opacity=".7" />
        <circle cx="151" cy="60" r="6" fill="#f3a18d" opacity=".7" />
        <path d="M113 65c8 7 18 7 26 0-7 13-19 16-26 0Z" fill="#e99a45" />
        <path d="M94 20c-2-9 3-15 11-17m18 16c3-10 10-13 18-11" fill="none" stroke="#d8a93b" strokeWidth="3" strokeLinecap="round" />
        <path d="M164 88c8-9 17-10 24-5" fill="none" stroke="#fff1ba" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </aside>
  );
}
