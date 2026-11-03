import './duck-mascot.css';
import { DucklingSvg } from './DucklingSvg';

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
      <DucklingSvg className="duck-mascot-svg" label={duckTitles[language]} />
    </aside>
  );
}
