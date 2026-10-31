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
      <svg className="duck-mascot-art" viewBox="0 0 240 205" role="img" aria-labelledby="duck-title">
        <title id="duck-title">{duckTitles[language]}</title>
        <ellipse cx="116" cy="185" rx="66" ry="8" fill="#dce8d9" />
        {/* Round, fluffy body */}
        <ellipse cx="112" cy="137" rx="77" ry="43" fill="#ffdc68" stroke="#e5b94f" strokeWidth="3" />
        {/* Small tail */}
        <path d="M181 125 Q204 111 211 124 Q207 139 184 140Z" fill="#ffdc68" stroke="#e5b94f" strokeWidth="3" strokeLinejoin="round"/>
        {/* Soft wing on the body */}
        <path d="M91 126 Q119 105 143 128 Q153 148 130 161 Q105 166 91 145Z" fill="#f6c94f" stroke="#e5b94f" strokeWidth="2.5"/>
        {/* Head sits clearly above the body */}
        <circle cx="111" cy="72" r="53" fill="#ffe27a" stroke="#e5b94f" strokeWidth="3"/>
        {/* Three tiny feathers */}
        <path d="M81 25 Q73 9 86 7 Q98 11 96 29 M101 20 Q101 2 115 3 Q126 10 117 26 M121 25 Q133 10 143 19 Q147 30 132 36" fill="#ffe27a" stroke="#e5b94f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Big friendly eyes */}
        <ellipse cx="94" cy="72" rx="10" ry="13" fill="#fff"/>
        <ellipse cx="128" cy="72" rx="10" ry="13" fill="#fff"/>
        <ellipse cx="97" cy="74" rx="5" ry="7" fill="#3e352d"/>
        <ellipse cx="131" cy="74" rx="5" ry="7" fill="#3e352d"/>
        <circle cx="99" cy="71" r="2.2" fill="#fff"/>
        <circle cx="133" cy="71" r="2.2" fill="#fff"/>
        {/* Cheeks */}
        <ellipse cx="79" cy="94" rx="9" ry="5.5" fill="#f3a18e" opacity=".7"/>
        <ellipse cx="144" cy="94" rx="9" ry="5.5" fill="#f3a18e" opacity=".7"/>
        {/* Wide, unmistakable duck bill */}
        <path d="M151 82 Q174 76 194 86 Q201 91 194 99 Q174 107 151 96Z" fill="#f49a35" stroke="#d77d27" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M163 91 Q178 93 191 90" fill="none" stroke="#ffd18b" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Two little orange feet */}
        <path d="M82 169 Q73 175 68 181 Q81 186 99 180 M129 172 Q124 178 123 183 Q140 188 155 180" fill="none" stroke="#e99136" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </aside>
  );
}
