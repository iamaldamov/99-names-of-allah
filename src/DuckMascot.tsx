import './duck-mascot.css';

type DuckLanguage = 'ru' | 'en' | 'ar' | 'ky' | 'kk';

const greetings: Record<DuckLanguage, string> = {
  ru: 'Бисмиллях. Давай изучать прекрасные имена Аллаха.',
  en: "Let's learn one little step at a time.",
  ar: 'لنتعلّم خطوةً صغيرة كل يوم.',
  ky: 'Кел, күн сайын аз-аздан үйрөнөлү.',
  kk: 'Күн сайын аз-аздан үйренейік.',
};

const duckTitles: Record<DuckLanguage, string> = {
  ru: 'Милый жёлтый утёнок',
  en: 'Cute yellow duckling',
  ar: 'بطة صفراء لطيفة',
  ky: 'Сүйкүмдүү сары өрдөк',
  kk: 'Сүйкімді сары үйрек',
};

export function DuckMascot({ language }: { language: DuckLanguage }) {
  return (
    <aside className="duck-mascot">
      <div className="duck-speech" lang={language} dir={language === 'ar' ? 'rtl' : 'auto'}>{greetings[language]}</div>
      <svg className="duck-mascot-art" viewBox="0 0 240 210" role="img" aria-labelledby="duck-title">
        <title id="duck-title">{duckTitles[language]}</title>
        <ellipse cx="119" cy="190" rx="61" ry="8" fill="#dce8d9" />
        {/* Plump little body and soft wing */}
        <path d="M45 151c0-34 26-58 69-58 42 0 78 23 78 58 0 24-26 38-75 38-45 0-72-14-72-38Z" fill="#f8d75f" stroke="#d9b542" strokeWidth="3"/>
        <path d="M127 130c24-13 48 0 49 19-7 17-29 22-49 8-8-7-8-19 0-27Z" fill="#efc84c" stroke="#d9b542" strokeWidth="2.5"/>
        <path d="M181 127q25-12 29 3-7 15-29 12" fill="#f8d75f" stroke="#d9b542" strokeWidth="3" strokeLinejoin="round"/>
        {/* Big rounded duck head */}
        <circle cx="111" cy="76" r="57" fill="#ffe47b" stroke="#d9b542" strokeWidth="3"/>
        <path d="M77 29q-8-16 5-19 12 0 13 18M101 20q1-17 14-16 13 3 9 20" fill="#ffe47b" stroke="#d9b542" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Eyes and cheeks */}
        <ellipse cx="91" cy="73" rx="8" ry="11" fill="#fff"/>
        <ellipse cx="128" cy="73" rx="8" ry="11" fill="#fff"/>
        <ellipse cx="93" cy="75" rx="4.2" ry="6" fill="#342f28"/>
        <ellipse cx="130" cy="75" rx="4.2" ry="6" fill="#342f28"/>
        <circle cx="94.5" cy="72.5" r="1.8" fill="#fff"/>
        <circle cx="131.5" cy="72.5" r="1.8" fill="#fff"/>
        <ellipse cx="76" cy="94" rx="9" ry="5" fill="#f2a092" opacity=".7"/>
        <ellipse cx="143" cy="94" rx="9" ry="5" fill="#f2a092" opacity=".7"/>
        {/* Wide, soft orange duck bill directly under the eyes */}
        <path d="M91 94q20-9 40 0 8 5 0 13-20 11-40 0-8-8 0-13Z" fill="#f49b3f" stroke="#d77d2c" strokeWidth="2.5"/>
        <path d="M96 100q15 5 30 0" fill="none" stroke="#ffd69a" strokeWidth="2" strokeLinecap="round"/>
        {/* Tiny webbed feet */}
        <path d="M83 181q-10 5-15 12 14 5 30-1m37-11q-7 7-8 13 16 5 30-2" fill="none" stroke="#e99136" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </aside>
  );
}
