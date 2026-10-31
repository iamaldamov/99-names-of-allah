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
        <ellipse cx="108" cy="169" rx="65" ry="8" fill="#dce8d9" />
        {/* Plump little duck body */}
        <ellipse cx="105" cy="128" rx="68" ry="39" fill="#ffda70" stroke="#d7a545" strokeWidth="3" />
        <path className="duck-mascot-tail" d="M163 117c17-12 29-8 34 2-10 10-21 12-34 7" fill="#f8cd60" stroke="#d7a545" strokeWidth="3" strokeLinejoin="round" />
        {/* Far wing */}
        <path d="M66 119c-1-17 13-27 29-22 13 4 19 17 14 29-10 13-28 15-43-7Z" fill="#f5c957" stroke="#d7a545" strokeWidth="2.5" />
        {/* Neck and round head */}
        <path d="M103 111c-10-14-15-27-12-42l43-2c-2 21 5 31 19 42Z" fill="#ffdc72" />
        <circle cx="119" cy="59" r="43" fill="#ffdc72" stroke="#d7a545" strokeWidth="3" />
        {/* Three soft feathers */}
        <path d="M94 22c-8-12-3-19 6-20 7 7 7 13 2 22m10-23c-1-13 7-17 15-12 3 9 0 15-7 19" fill="#ffdc72" stroke="#d7a545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Little wing waving */}
        <path className="duck-mascot-wing duck-mascot-wing--left" d="M55 116c-18-7-29 2-26 17 13-3 24 3 34 13 8-10 5-23-8-30Z" fill="#f5c957" stroke="#d7a545" strokeWidth="3" strokeLinejoin="round" />
        {/* Eyes, looking happily forward */}
        <ellipse cx="108" cy="61" rx="8" ry="10" fill="#fff" />
        <ellipse cx="139" cy="61" rx="8" ry="10" fill="#fff" />
        <ellipse className="duck-mascot-eye" cx="110" cy="63" rx="4" ry="6" fill="#40382f" />
        <ellipse className="duck-mascot-eye" cx="137" cy="63" rx="4" ry="6" fill="#40382f" />
        <circle cx="111.5" cy="60.5" r="1.7" fill="#fff" />
        <circle cx="138.5" cy="60.5" r="1.7" fill="#fff" />
        <ellipse cx="96" cy="80" rx="7" ry="4.5" fill="#f2a18d" opacity=".65" />
        <ellipse cx="150" cy="80" rx="7" ry="4.5" fill="#f2a18d" opacity=".65" />
        {/* Distinct duck bill, projecting from the face */}
        <path className="duck-mascot-beak" d="M151 69c13-5 29-3 35 3 3 4-1 9-8 11-10 3-21 1-29-4Z" fill="#f39a3f" stroke="#d47c2e" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M159 74c7 1 14 1 20-1" fill="none" stroke="#ffd08a" strokeWidth="2" strokeLinecap="round" />
        {/* Feet */}
        <path d="M78 158c-5 2-9 6-10 10 8 3 17 2 24-2m25-7c-4 3-6 7-6 10 8 3 17 2 24-2" fill="none" stroke="#e9913b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </aside>
  );
}
