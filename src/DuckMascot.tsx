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
        <ellipse cx="110" cy="169" rx="62" ry="9" fill="#dce8d9" />
        {/* A single rounded silhouette makes the head and body read as one little duck. */}
        <path d="M48 128c-8-17-5-39 7-54 10-13 25-20 43-21 5-20 21-34 42-34 24 0 42 19 42 43 0 7-2 13-5 19 13 12 20 29 17 47-4 25-26 39-69 39-39 0-65-12-77-39Z" fill="#ffda68" stroke="#d5a13c" strokeWidth="3.5" strokeLinejoin="round" />
        <path className="duck-mascot-wing duck-mascot-wing--left" d="M58 104c-15-8-28-2-31 13 11-2 20 3 28 14 8-8 9-18 3-27Z" fill="#f2c04e" stroke="#d5a13c" strokeWidth="3" strokeLinejoin="round" />
        <path className="duck-mascot-tail" d="M183 111c13-10 23-8 29 0-8 10-18 13-29 9" fill="#f6c653" stroke="#d5a13c" strokeWidth="3" strokeLinejoin="round" />
        <path d="M83 160c-2 5-7 8-14 9m64-9c2 5 7 8 14 9" fill="none" stroke="#d98b35" strokeWidth="5" strokeLinecap="round" />
        <path d="M90 22c-1-8 3-13 9-16m18 13c4-8 10-10 16-8" fill="none" stroke="#d5a13c" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="94" cy="75" rx="10" ry="12" fill="#fff" />
        <ellipse cx="139" cy="75" rx="10" ry="12" fill="#fff" />
        <ellipse className="duck-mascot-eye" cx="97" cy="77" rx="4.5" ry="6" fill="#3e382f" />
        <ellipse className="duck-mascot-eye" cx="136" cy="77" rx="4.5" ry="6" fill="#3e382f" />
        <circle cx="99" cy="74" r="1.8" fill="#fff" />
        <circle cx="138" cy="74" r="1.8" fill="#fff" />
        <ellipse cx="79" cy="94" rx="8" ry="5" fill="#f3a18d" opacity=".65" />
        <ellipse cx="154" cy="94" rx="8" ry="5" fill="#f3a18d" opacity=".65" />
        {/* Broad, flat orange bill: the clearest visual cue that this is a duck. */}
        <path className="duck-mascot-beak" d="M101 91c7-5 24-5 32 0 7 4 7 10 0 14-9 5-24 5-32 0-7-4-7-10 0-14Z" fill="#ee963e" stroke="#d47c2e" strokeWidth="2.5" />
        <path d="M107 96c6 2 15 2 21 0" fill="none" stroke="#ffd08a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </aside>
  );
}
