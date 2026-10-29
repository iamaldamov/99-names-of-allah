import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, LockKeyhole, LogOut, Mail, Share2, Sparkles, X, UserRound, Bookmark, Heart } from 'lucide-react';
import { supabase } from './lib/supabase';
import { names as completeNames, studyPrinciples, coreReferences } from './data/names';

type NameItem = (typeof completeNames)[number];
const previewNames: NameItem[] = completeNames;
type ReviewRecord = { box: number; dueAt: string; seen: number; correct: number; lastReviewedAt: string | null };
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
const addDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

function localDayKey(date = new Date()): string {
  const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function loadStudyDays(): Record<string, number> {
  try { const value: unknown = JSON.parse(localStorage.getItem('99-names-study-days') || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([key, count]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && typeof count === 'number' && Number.isInteger(count) && count > 0).slice(-90).map(([key, count]) => [key, Number(count)]));
  } catch { return {}; }
}
function loadProgress(): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('asma-ul-husna-progress') || '[]');
    return Array.isArray(value)
      ? Array.from(new Set(value.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 99)))
      : [];
  } catch { return []; }
}

function loadReviewData(): Record<number, ReviewRecord> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('asma-ul-husna-review-v1') || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).flatMap(([key, raw]) => {
      const id = Number(key);
      if (!Number.isInteger(id) || id < 1 || id > 99 || !raw || typeof raw !== 'object') return [];
      const item = raw as Partial<ReviewRecord>;
      const dueAt = typeof item.dueAt === 'string' && Number.isFinite(Date.parse(item.dueAt))
        ? item.dueAt : new Date().toISOString();
      return [[id, {
        box: Number.isFinite(item.box) ? Math.max(0, Math.min(REVIEW_INTERVALS.length - 1, Math.floor(item.box!))) : 0,
        dueAt,
        seen: Number.isFinite(item.seen) ? Math.max(0, Math.floor(item.seen!)) : 0,
        correct: Number.isFinite(item.correct) ? Math.max(0, Math.floor(item.correct!)) : 0,
        lastReviewedAt: typeof item.lastReviewedAt === 'string' ? item.lastReviewedAt : null,
      }]];
    }));
  } catch { return {}; }
}

const BOOK_URL = 'https://iamaldamov.github.io/ochishchenie-nafsa/';
const SITE_URL = 'https://iamaldamov.github.io/99-names-of-allah/';

const languageText: Record<string, Record<string, string>> = {
 ky: {
 '99 имён Аллаха':'Аллахтын 99 ысымы','Войти':'Кирүү','Выйти':'Чыгуу','ПУТЬ ПОЗНАНИЯ':'ТААНЫП-БИЛҮҮ ЖОЛУ',
 'Познакомься с именами':'Сени жараткан Заттын','Того, Кто создал тебя.':'ысымдары менен тааныш.','Начать обучение':'Үйрөнүүнү баштоо',
 'ТВОЙ ПУТЬ':'СЕНИН ЖОЛУҢ','Твой прогресс обучения':'Үйрөнүүдөгү жетишкендигиң','99 имён. Одно путешествие.':'99 ысым. Бир сапар.','изучено':'үйрөнүлдү',
 'Прогресс сохраняется на этом устройстве':'Жетишкендигиң ушул түзмөктө сакталат','ПЕРВЫЕ ШАГИ':'АЛГАЧКЫ КАДАМДАР',
 'Изучай имена по порядку':'Ысымдарды ирети менен үйрөн','Открыть каталог имён':'Ысымдардын тизмесин ачуу','Свернуть каталог':'Тизмени жабуу',
 'Найти имя, перевод или транскрипцию…':'Ысымды, котормосун же транскрипциясын издөө…','Все 99':'Бардыгы 99','Повторить':'Кайталоо',
 'Ничего не найдено. Попробуй изменить запрос или фильтр.':'Эч нерсе табылган жок. Издөөнү же чыпканы өзгөртүп көр.',
 'Проверить знания':'Билимиңди текшер','Короткий тест по именам':'Ысымдар боюнча кыска тест','ЗАКРЕПЛЕНИЕ ЗНАНИЙ':'БИЛИМДИ БЕКЕМДӨӨ',
 'Проверь, что запомнил':'Эмнени эстеп калганыңды текшер','Мини-тест':'Кыска тест','КАК ПЕРЕВОДИТСЯ ИМЯ?':'БУЛ ЫСЫМ КАНДАЙ КОТОРУЛАТ?',
 'Верно! Повтори смысл имени своими словами.':'Туура! Ысымдын маанисин өз сөзүң менен кайтала.','Не совсем. Правильный ответ: ':'Туура эмес. Туура жооп: ',
 'Следующий вопрос':'Кийинки суроо','Методика обучения':'Үйрөнүү ыкмасы','Как запоминать и повторять':'Кантип жаттап, кайталоо керек',
 'Источники и достоверность':'Булактар жана ишенимдүүлүк','О создателе':'Долбоордун автору','Ассаляму алейкум!':'Ассаламу алейкум!',
 'Закрыть':'Жабуу','Поддержать проект':'Долбоорду колдоо','Перейти к изучению':'Үйрөнүүгө өтүү','ДОБРО ПОЖАЛОВАТЬ':'КОШ КЕЛИҢИЗ',
 'Отметить как изученное':'Үйрөнүлдү деп белгилөө','Это имя уже отмечено как изученное':'Бул ысым үйрөнүлдү деп белгиленген',
 'Сохраняем…':'Сакталууда…','Связанный источник:':'Байланыштуу булак:'
 },
   kk: {
  '99 имён Аллаха':'Алланың 99 көркем есімі','Войти':'Кіру','Выйти':'Шығу','ПУТЬ ПОЗНАНИЯ':'ТАНЫМ ЖОЛЫ',
  'Познакомься с именами':'Сені жаратқан Алланың','Того, Кто создал тебя.':'көркем есімдерімен таныс.','Начать обучение':'Үйренуді бастау',
  'ТВОЙ ПУТЬ':'СЕНІҢ ЖОЛЫҢ','Твой прогресс обучения':'Оқу барысындағы жетістігің','99 имён. Одно путешествие.':'99 есім. Бір сапар.','изучено':'үйренілді',
  'Прогресс сохраняется на этом устройстве':'Жетістігің осы құрылғыда сақталады','ПЕРВЫЕ ШАГИ':'АЛҒАШҚЫ ҚАДАМДАР',
  'Изучай имена по порядку':'Есімдерді ретімен үйрен','Открыть каталог имён':'Есімдер тізімін ашу','Свернуть каталог':'Тізімді жабу',
  'Найти имя, перевод или транскрипцию…':'Есімді, аудармасын немесе транскрипциясын іздеу…','Все 99':'Барлығы 99','Повторить':'Қайталау',
  'Ничего не найдено. Попробуй изменить запрос или фильтр.':'Ештеңе табылмады. Іздеу сұрауын немесе сүзгіні өзгертіп көр.',
  'Проверить знания':'Біліміңді тексер','Короткий тест по именам':'Есімдер бойынша қысқа тест','ЗАКРЕПЛЕНИЕ ЗНАНИЙ':'БІЛІМДІ БЕКІТУ',
  'Проверь, что запомнил':'Нені есте сақтағаныңды тексер','Мини-тест':'Қысқа тест','КАК ПЕРЕВОДИТСЯ ИМЯ?':'БҰЛ ЕСІМНІҢ МАҒЫНАСЫ ҚАНДАЙ?',
  'Верно! Повтори смысл имени своими словами.':'Дұрыс! Есімнің мағынасын өз сөзіңмен қайтала.','Не совсем. Правильный ответ: ':'Дәл емес. Дұрыс жауап: ',
  'Следующий вопрос':'Келесі сұрақ','Методика обучения':'Оқу әдісі','Как запоминать и повторять':'Қалай жаттау және қайталау керек',
  'Источники и достоверность':'Дереккөздер мен сенімділік','О создателе':'Жоба авторы','Ассаляму алейкум!':'Әссәләму алейкум!',
  'Закрыть':'Жабу','Поддержать проект':'Жобаны қолдау','Перейти к изучению':'Үйренуге өту','ДОБРО ПОЖАЛОВАТЬ':'ҚОШ КЕЛДІҢ!',
  'Отметить как изученное':'Үйренілді деп белгілеу','Это имя уже отмечено как изученное':'Бұл есім үйренілді деп белгіленген',
  'Сохраняем…':'Сақталуда…','Связанный источник:':'Қатысты дереккөз:'
  },
 en: {
 '99 имён Аллаха':'99 Names of Allah','Войти':'Sign in','Выйти':'Sign out','ПУТЬ ПОЗНАНИЯ':'A JOURNEY OF KNOWLEDGE',
 'Познакомься с именами':'Discover the names','Того, Кто создал тебя.':'of the One who created you.',
 'Начать обучение':'Start learning','ТВОЙ ПУТЬ':'YOUR JOURNEY','Твой прогресс обучения':'Your learning progress',
 '99 имён. Одно путешествие.':'99 names. One journey.','изучено':'learned','Прогресс сохраняется на этом устройстве':'Your progress is saved on this device',
 'ПЕРВЫЕ ШАГИ':'GETTING STARTED','Изучай имена по порядку':'Study the names in order','Открыть каталог имён':'Open name catalogue',
 'Свернуть каталог':'Close catalogue','Найти имя, перевод или транскрипцию…':'Search a name, meaning or transliteration…',
 'Все 99':'All 99','Повторить':'Review','Ничего не найдено. Попробуй изменить запрос или фильтр.':'Nothing found. Try another search or filter.',
 'Проверить знания':'Test your knowledge','Короткий тест по именам':'A short quiz about the names','ЗАКРЕПЛЕНИЕ ЗНАНИЙ':'REVIEW',
 'Проверь, что запомнил':'Test what you remember','Мини-тест':'Quick quiz','КАК ПЕРЕВОДИТСЯ ИМЯ?':'WHAT DOES THIS NAME MEAN?',
 'Верно! Повтори смысл имени своими словами.':'Correct! Repeat the meaning in your own words.',
 'Не совсем. Правильный ответ: ':'Not quite. The correct answer is: ','Следующий вопрос':'Next question',
 'Методика обучения':'Learning method','Как запоминать и повторять':'How to memorise and review',
 'Источники и достоверность':'Sources and accuracy','О создателе':'About the creator',
 'Ассаляму алейкум!':'Assalamu alaikum!','Закрыть':'Close','Поддержать проект':'Support the project',
 'Перейти к изучению':'Start studying','ДОБРО ПОЖАЛОВАТЬ':'WELCOME','Подумай:':'Reflect:',
 'Отметить как изученное':'Mark as learned','Это имя уже отмечено как изученное':'This name is already marked as learned',
 'Сохраняем…':'Saving…','Связанный источник:':'Related reference:'
 },
 ar: {
 '99 имён Аллаха':'أسماء الله الحسنى','Войти':'دخول','Выйти':'خروج','ПУТЬ ПОЗНАНИЯ':'رحلة المعرفة',
 'Познакомься с именами':'تعرّف على أسماء','Того, Кто создал тебя.':'من خلقك.','Начать обучение':'ابدأ التعلّم',
 'ТВОЙ ПУТЬ':'رحلتك','Твой прогресс обучения':'تقدّمك في التعلّم','99 имён. Одно путешествие.':'٩٩ اسمًا. رحلة واحدة.',
 'изучено':'تم تعلّمها','Прогресс сохраняется на этом устройстве':'يُحفظ تقدّمك على هذا الجهاز',
 'ПЕРВЫЕ ШАГИ':'الخطوات الأولى','Изучай имена по порядку':'تعلّم الأسماء بالترتيب','Открыть каталог имён':'افتح قائمة الأسماء',
 'Свернуть каталог':'إغلاق القائمة','Найти имя, перевод или транскрипцию…':'ابحث عن اسم أو معنى…',
 'Все 99':'جميع الأسماء','Повторить':'مراجعة','Ничего не найдено. Попробуй изменить запрос или фильтр.':'لم يتم العثور على نتائج. جرّب تغيير البحث أو التصفية.',
 'Проверить знания':'اختبر معرفتك','Короткий тест по именам':'اختبار قصير حول الأسماء','ЗАКРЕПЛЕНИЕ ЗНАНИЙ':'مراجعة المعرفة',
 'Проверь, что запомнил':'اختبر ما تذكّرته','Мини-тест':'اختبار قصير','КАК ПЕРЕВОДИТСЯ ИМЯ؟':'ما معنى هذا الاسم؟',
 'Верно! Повтори смысл имени своими словами.':'صحيح! اشرح معنى الاسم بكلماتك.',
 'Не совсем. Правильный ответ: ':'ليس تمامًا. الإجابة الصحيحة: ','Следующий вопрос':'السؤال التالي',
 'Методика обучения':'منهجية التعلّم','Как запоминать и повторять':'كيف تحفظ وتراجع',
 'Источники и достоверность':'المصادر والتوثيق','О создателе':'عن المنشئ','Ассаляму алейкум!':'السلام عليكم',
 'Закрыть':'إغلاق','Поддержать проект':'ادعم المشروع','Перейти к изучению':'ابدأ التعلّم',
 'ДОБРО ПОЖАЛОВАТЬ':'مرحبًا بك','Подумай:':'تأمّل:','Отметить как изученное':'وضع علامة تم التعلّم',
 'Это имя уже отмечено как изученное':'تم وضع علامة التعلّم على هذا الاسم','Сохраняем…':'جارٍ الحفظ…',
 'Связанный источник:':'المصدر المرتبط:'
 }
};
const russianTransliterations: Record<number, string> = {
  1:'Ар-Рахмаан', 2:'Ар-Рахиим', 3:'Аль-Малик', 4:'Аль-Куддус', 5:'Ас-Саляам',
  6:'Аль-Муъмин', 7:'Аль-Мухаймин', 8:'Аль-Азииз', 9:'Аль-Джаббаар', 10:'Аль-Мутакаббир',
  11:'Аль-Хаалик', 12:'Аль-Баари', 13:'Аль-Мусаввир', 14:'Аль-Гаффаар', 15:'Аль-Каххаар',
  16:'Аль-Ваххааб', 17:'Ар-Раззаак', 18:'Аль-Фаттаах', 19:'Аль-Алиим', 20:'Аль-Каабид',
  21:'Аль-Баасит', 22:'Аль-Хаафид', 23:'Ар-Рафи', 24:'Аль-Муизз', 25:'Аль-Музилль',
  26:'Ас-Сами', 27:'Аль-Басиир', 28:'Аль-Хакам', 29:'Аль-Адль', 30:'Аль-Латыиф',
  31:'Аль-Хабиир', 32:'Аль-Халиим', 33:'Аль-Азым', 34:'Аль-Гафуур', 35:'Аш-Шакуур',
  36:'Аль-Алий', 37:'Аль-Кабиир', 38:'Аль-Хафииз', 39:'Аль-Мукиит', 40:'Аль-Хасиб',
  41:'Аль-Джалииль', 42:'Аль-Кариим', 43:'Ар-Ракыиб', 44:'Аль-Муджииб', 45:'Аль-Вааси',
  46:'Аль-Хакиим', 47:'Аль-Вадууд', 48:'Аль-Маджид', 49:'Аль-Баис', 50:'Аш-Шахиид',
  51:'Аль-Хакк', 52:'Аль-Вакииль', 53:'Аль-Кавий', 54:'Аль-Матиин', 55:'Аль-Валий',
  56:'Аль-Хамиид', 57:'Аль-Мухсы', 58:'Аль-Мубди', 59:'Аль-Муиид', 60:'Аль-Мухйи',
  61:'Аль-Мумиит', 62:'Аль-Хайй', 63:'Аль-Каййуум', 64:'Аль-Вааджид', 65:'Аль-Мааджид',
  66:'Аль-Ваахид', 67:'Ас-Самад', 68:'Аль-Каадир', 69:'Аль-Муктадир', 70:'Аль-Мукаддим',
  71:'Аль-Муаххир', 72:'Аль-Авваль', 73:'Аль-Аахир', 74:'Аз-Заахир', 75:'Аль-Баатин',
  76:'Аль-Ваали', 77:'Аль-Мутааали', 78:'Аль-Барр', 79:'Ат-Таввааб', 80:'Аль-Мунтаким',
  81:'Аль-Афувв', 82:'Ар-Рауф', 83:'Мааликуль-Мульк', 84:'Зуль-Джаляяли валь-Икраам',
  85:'Аль-Муксит', 86:'Аль-Джаами', 87:'Аль-Ганий', 88:'Аль-Мугнии', 89:'Аль-Маани',
  90:'Ад-Даарр', 91:'Ан-Наафи', 92:'Ан-Нуур', 93:'Аль-Хаади', 94:'Аль-Бадии',
  95:'Аль-Баакы', 96:'Аль-Ваарис', 97:'Ар-Рашиид', 98:'Ас-Сабуур', 99:'Аллаах'
};



async function makeNameCard(name: NameItem, transliteration: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');
  const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
  bg.addColorStop(0, '#10251d');
  bg.addColorStop(1, '#263f32');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = 'rgba(225,239,220,.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, 996, 1266);
  ctx.strokeStyle = 'rgba(225,239,220,.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, 956, 1226);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d7e6d4';
  ctx.font = '500 27px Arial';
  ctx.fillText('99 ПРЕКРАСНЫХ ИМЁН АЛЛАХА', 540, 145);
  ctx.fillStyle = '#f4f6ed';
  ctx.font = 'bold 100px Amiri, serif';
  ctx.direction = 'rtl';
  ctx.fillText(name.arabic, 540, 430, 900);
  ctx.direction = 'ltr';
  ctx.fillStyle = '#e7c98a';
  ctx.font = '600 62px Arial';
  ctx.fillText(name.translation, 540, 570, 900);
  ctx.fillStyle = '#d8e5d5';
  ctx.font = '36px Arial';
  ctx.fillText(transliteration, 540, 640, 900);
  ctx.fillStyle = '#f1f3ed';
  ctx.font = '32px Arial';
  const words = name.explanation.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > 820 && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, 5).forEach((item, i) => ctx.fillText(item, 540, 790 + i * 52, 850));
  ctx.fillStyle = '#d7e6d4';
  ctx.font = '28px Arial';
  ctx.fillText('Изучай бесплатно', 540, 1160);
  ctx.font = '25px Arial';
  ctx.fillText('iamaldamov.github.io/99-names-of-allah', 540, 1210);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image export failed')), 'image/png'));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function App() {
  const [language, setLanguage] = useState<'ru'|'en'|'ar'|'ky'|'kk'>(() => { try { return (localStorage.getItem('99-names-language') as 'ru'|'en'|'ar'|'ky'|'kk') || 'ru'; } catch { return 'ru'; } });
  const tr = (value: string) => language === 'ru' ? value : languageText[language][value] || value;
  const shownTransliteration = (name: NameItem) => language === 'ru' ? russianTransliterations[name.id] ?? name.transliteration : name.transliteration;
  useEffect(() => { try { localStorage.setItem('99-names-language', language); } catch { /* ignore */ } document.documentElement.lang = language; document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'; }, [language]);
  const [names, setNames] = useState<NameItem[]>(previewNames);
  const [publishedCount, setPublishedCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<number[]>(loadProgress);
  const [progressLoadedFor, setProgressLoadedFor] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<Record<number, ReviewRecord>>(loadReviewData);
  const [selected, setSelected] = useState<NameItem | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'login' | 'signup' | 'reset'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [praise, setPraise] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'light'|'dark'>(() => { try { return localStorage.getItem('99-names-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  const [favorites, setFavorites] = useState<number[]>(() => { try { const v=JSON.parse(localStorage.getItem('99-names-favorites') || '[]'); return Array.isArray(v) ? v.filter((x): x is number => Number.isInteger(x) && x>=1 && x<=99) : []; } catch { return []; } });
  const [dailyGoal, setDailyGoal] = useState<number>(() => { try { const n=Number(localStorage.getItem('99-names-daily-goal')); return [1,3,5].includes(n) ? n : 1; } catch { return 1; } });
  const [learnedToday, setLearnedToday] = useState<number[]>(() => { try { const v=JSON.parse(localStorage.getItem('99-names-learned-today') || '{}'); return v.date === new Date().toDateString() && Array.isArray(v.ids) ? v.ids : []; } catch { return []; } });
  const [studyDays, setStudyDays] = useState<Record<string, number>>(loadStudyDays);
  const [challengeAnswers, setChallengeAnswers] = useState<number[]>(() => { try { const saved = JSON.parse(localStorage.getItem('99-names-daily-challenge') || '{}'); return saved.date === localDayKey() && Array.isArray(saved.answers) ? saved.answers.filter((id: unknown) => Number.isInteger(id) && Number(id) >= 1 && Number(id) <= 99).slice(0, 5) : []; } catch { return []; } });
  const [challengeCurrentAnswer, setChallengeCurrentAnswer] = useState<number | null>(null);
  const [challengeBest, setChallengeBest] = useState<number>(() => { try { const score = Number(localStorage.getItem('99-names-challenge-best')); return Number.isInteger(score) && score >= 0 && score <= 5 ? score : 0; } catch { return 0; } });
  const soundContextRef = useRef<AudioContext | null>(null);
  const playFeedbackSound = (kind: 'tap' | 'correct' | 'wrong') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;
      const context = soundContextRef.current || (soundContextRef.current = new AudioContextClass());
      if (context.state === 'suspended') void context.resume();
      const now = context.currentTime;
      const tone = (frequency: number, startAt: number, duration: number, volume: number) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, now + startAt);
        if (kind === 'tap') oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.76, now + startAt + duration);
        gain.gain.setValueAtTime(0.0001, now + startAt);
        gain.gain.exponentialRampToValueAtTime(volume, now + startAt + 0.009);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + startAt + duration);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(now + startAt); oscillator.stop(now + startAt + duration + 0.015);
      };
      if (kind === 'tap') tone(620, 0, 0.055, 0.028);
      else if (kind === 'correct') {
        tone(660, 0, 0.13, 0.036); tone(830, 0.075, 0.16, 0.032); tone(990, 0.15, 0.2, 0.026);
      } else {
        tone(390, 0, 0.09, 0.018); tone(330, 0.065, 0.11, 0.014);
      }
    } catch { /* Audio is optional; the learning experience remains usable. */ }
  };
  const [activeTab, setActiveTab] = useState<'all' | 'learned' | 'review' | 'favorites'>('all');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [visibleNamesCount, setVisibleNamesCount] = useState(12);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('99-names-theme', theme); } catch {} }, [theme]);
  useEffect(() => { try { localStorage.setItem('99-names-favorites', JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => { try { localStorage.setItem('99-names-daily-goal', String(dailyGoal)); } catch {} }, [dailyGoal]);
  useEffect(() => { try { localStorage.setItem('99-names-learned-today', JSON.stringify({date:new Date().toDateString(),ids:learnedToday})); } catch {} }, [learnedToday]);
  useEffect(() => { try { localStorage.setItem('99-names-study-days', JSON.stringify(studyDays)); } catch {} }, [studyDays]);
  useEffect(() => { try { localStorage.setItem('99-names-daily-challenge', JSON.stringify({ date: localDayKey(), answers: challengeAnswers })); } catch {} }, [challengeAnswers]);
  useEffect(() => {
    if (challengeAnswers.length !== 5) return;
    const score = challengeScore;
    setChallengeBest(old => { const next = Math.max(old, score); try { localStorage.setItem('99-names-challenge-best', String(next)); } catch {} return next; });
  }, [challengeAnswers]);
  const toggleFavorite = (id:number) => setFavorites(old => old.includes(id) ? old.filter(x=>x!==id) : [...old,id]);
  const shareName = async (name: NameItem) => {
    const text = `${name.translation} — ${shownTransliteration(name)}\\nИзучай 99 прекрасных имён Аллаха бесплатно: ${SITE_URL}`;
    try {
      const blob = await makeNameCard(name, shownTransliteration(name));
      const file = new File([blob], `allah-name-${name.id}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: name.translation, text, files: [file] });
      } else {
        downloadBlob(blob, file.name);
        if (navigator.share) await navigator.share({ title: name.translation, text, url: SITE_URL });
        else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        setNotice('Карточка PNG скачана. Прикрепи её к публикации в Threads.');
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === 'AbortError')) setNotice('Не удалось поделиться. Попробуй ещё раз.');
    }
  };
  const closeWelcome = () => setWelcomeOpen(false);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.from('names').select('id,arabic,transliteration,translation,explanation,source_references').eq('content_status', 'published').order('id')
      .then(({ data, error: fetchError }) => {
        if (!alive) return;
        if (!fetchError && data && data.length) {
          const remote = data as NameItem[];
          setNames(completeNames.map(local => remote.find(item => item.id === local.id) ?? local));
          setPublishedCount(data.length);
        }
      });
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setUser(session?.user ?? null);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { try { localStorage.setItem('asma-ul-husna-progress', JSON.stringify(progress)); } catch { /* Storage unavailable */ } }, [progress]);
  useEffect(() => { try { localStorage.setItem('asma-ul-husna-review-v1', JSON.stringify(reviewData)); } catch { /* Storage unavailable */ } }, [reviewData]);
  useEffect(() => { setReviewData(old => { const missing = progress.filter(id => !old[id]); if (!missing.length) return old; const next = { ...old }; missing.forEach(id => { next[id] = { box: 0, dueAt: new Date().toISOString(), seen: 0, correct: 0, lastReviewedAt: null }; }); return next; }); }, [progress]);
  useEffect(() => {
    if (!supabase || !user) { setProgressLoadedFor(null); return; }
    let alive = true;
    setProgressLoadedFor(null);
    supabase.from('user_progress').select('name_id,status').eq('user_id', user.id).then(({ data, error: loadError }) => {
      if (!alive) return;
      if (loadError) {
        setNotice('Не удалось загрузить прогресс из аккаунта. Локальные данные сохранены; попробуй обновить страницу.');
        return;
      }
      const cloudIds = (data || []).filter((item: any) => item.status === 'learned').map((item: any) => Number(item.name_id)).filter((id: number) => Number.isInteger(id) && id >= 1 && id <= 99);
      setProgress(current => Array.from(new Set([...current, ...cloudIds])));
      setProgressLoadedFor(user.id);
    }, () => {
      if (alive) setNotice('Не удалось связаться с хранилищем прогресса. Локальные данные не удалены.');
    });
    return () => { alive = false; };
  }, [user]);
  useEffect(() => {
    if (!supabase || !user || progressLoadedFor !== user.id || !progress.length) return;
    const rows = progress.map(name_id => ({ user_id: user.id, name_id, status: 'learned', confidence: 3, times_seen: 1, times_correct: 0, last_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
    void supabase.from('user_progress').upsert(rows, { onConflict: 'user_id,name_id', ignoreDuplicates: true })
      .then(({ error: saveError }) => {
        if (saveError) setNotice('Прогресс есть на этом устройстве, но не удалось синхронизировать его с аккаунтом.');
      });
  }, [user, progressLoadedFor, progress]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const shareSite = async () => {
    try {
      if (navigator.share) await navigator.share({ title: '99 прекрасных имён Аллаха', text: 'Бесплатный сайт для изучения 99 прекрасных имён Аллаха.', url: SITE_URL });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(SITE_URL); setNotice('Ссылка скопирована. Отправь её близким.'); }
      else setNotice('Скопируй адрес сайта из строки браузера и отправь его близким.');
    } catch (e) { if (!(e instanceof Error && e.name === 'AbortError')) setNotice('Не удалось открыть меню отправки. Скопируй адрес сайта вручную.'); }
  };

  const submitAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) { setError('Подключение аккаунтов ещё не настроено. Администратору сайта нужно завершить настройку Supabase.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      if (accountMode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (authError) throw authError;
        if (data.session) { setMessage('Аккаунт создан. Ты вошёл в систему.'); setAccountOpen(false); }
        else setMessage('Почти готово! Проверь почту и перейди по ссылке подтверждения, чтобы активировать аккаунт.');
      } else if (accountMode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        setAccountOpen(false); setMessage('Ты успешно вошёл. Прогресс будет сохраняться в аккаунте.');
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: SITE_URL });
        if (authError) throw authError;
        setMessage('Если адрес зарегистрирован, на почту придёт ссылка для смены пароля.');
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось выполнить запрос. Попробуй ещё раз.'); }
    finally { setBusy(false); }
  };

  const praiseFor = (kind: 'correct' | 'learned') => {
    const messages: Record<string, Record<'correct' | 'learned', string[]>> = {
      ru: { correct: ['Машаллах! Отличный ответ!', 'Машаллах! Ты справился!', 'Прекрасно! Продолжай учиться!'], learned: ['Машаллах! Ещё одно имя выучено!', 'Баракаллаху фик! Продолжай в том же духе!'] },
      en: { correct: ['MashaAllah! Great answer!', 'MashaAllah! You got it right!', 'Wonderful! Keep learning!'], learned: ['MashaAllah! Another name learned!', 'BarakAllahu feek! Keep going!'] },
      ar: { correct: ['ما شاء الله! إجابة رائعة!', 'أحسنت! بارك الله فيك!'], learned: ['ما شاء الله! تعلّمت اسمًا جديدًا!', 'بارك الله فيك، واصل التعلّم!'] },
      ky: { correct: ['МашаАллах! Туура жооп!', 'Азаматсың! Ушундай улант!'], learned: ['МашаАллах! Дагы бир ысымды үйрөндүң!', 'Аллах илимиңе береке берсин!'] },
      kk: { correct: ['МашаАлла! Дұрыс жауап!', 'Жарайсың! Осылай жалғастыр!', 'Керемет! Білімің арта берсін!'], learned: ['МашаАлла! Тағы бір есімді үйрендің!', 'Алла біліміңе береке берсін!'] }
    };
    const options = messages[language]?.[kind] || messages.ru[kind];
    setPraise(options[Math.floor(Math.random() * options.length)]);
    window.setTimeout(() => setPraise(''), 2600);
  };

  const markLearned = async () => {
    if (!selected || busy) return;
    const nameId = selected.id;
    setBusy(true); setError('');
    if (!progress.includes(nameId)) praiseFor('learned');
    setProgress(old => old.includes(nameId) ? old : [...old, nameId]);
    setLearnedToday(old => Array.from(new Set([...old, nameId])));
    setStudyDays(old => ({ ...old, [localDayKey()]: old[localDayKey()] || 1 }));
    setReviewData(old => old[nameId] ? old : { ...old, [nameId]: { box: 0, dueAt: addDays(1), seen: 0, correct: 0, lastReviewedAt: null } });
    setNotice('Имя отмечено как изученное. Первое повторение запланировано на завтра.');
    if (supabase && user) {
      try {
        const { error: saveError } = await supabase.from('user_progress').upsert({
          user_id: user.id, name_id: nameId, status: 'learned', confidence: 3,
          times_seen: 1, times_correct: 0, last_reviewed_at: new Date().toISOString(),
          next_review_at: new Date(Date.now() + 86400000).toISOString(), updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,name_id' });
        if (!saveError) setNotice('Готово! Имя отмечено и сохранено в аккаунте.');
        else setNotice('Имя сохранено на этом устройстве. Синхронизация аккаунта пока недоступна: каталог имён в базе ещё не заполнен.');
      } catch { setNotice('Имя сохранено на этом устройстве. Облачное сохранение временно недоступно.'); }
    }
    setBusy(false);
  };

  const signOut = async () => { if (supabase) await supabase.auth.signOut(); setMessage('Ты вышел из аккаунта. Прогресс на этом устройстве сохранён.'); };
  const percent = Math.round((progress.length / 99) * 100);
  const nextName = names.find(name => !progress.includes(name.id));
  const todayKey = localDayKey();
  const weekActivity = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = localDayKey(date); return { key, label: new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : language === 'ky' ? 'ky-KG' : language === 'ar' ? 'ar' : 'en', { weekday: 'short' }).format(date), count: studyDays[key] || 0, today: key === todayKey }; }), [language, studyDays, todayKey]);
  const activeDaysThisWeek = weekActivity.filter(day => day.count > 0).length;
  const currentStreak = useMemo(() => { let cursor = new Date(); if (!studyDays[localDayKey(cursor)]) cursor.setDate(cursor.getDate() - 1); let streak = 0; while (studyDays[localDayKey(cursor)] && streak < 90) { streak++; cursor.setDate(cursor.getDate() - 1); } return streak; }, [studyDays, todayKey]);
  const nextMilestone = [1, 5, 10, 25, 50, 75, 99].find(value => value > progress.length) ?? 99;
  const milestoneProgress = Math.min(100, progress.length / nextMilestone * 100);
  const dailyChallenge = useMemo(() => {
    const seed = Number(todayKey.replace(/-/g, ''));
    const rank = (id: number, salt: number) => (id * 9301 + seed * 49297 + salt * 233280) % 1000003;
    const ordered = [...names].sort((a, b) => rank(a.id, 17) - rank(b.id, 17));
    return ordered.slice(0, 5).map((item, index) => ({
      item,
      options: [item, ...names.filter(name => name.id !== item.id).sort((a, b) => rank(a.id, index * 31 + 7) - rank(b.id, index * 31 + 7)).slice(0, 3)].sort((a, b) => rank(a.id, index * 97 + 3) - rank(b.id, index * 97 + 3))
    }));
  }, [names, todayKey]);
  const dueReviewIds = useMemo(() => Object.entries(reviewData).filter(([, item]) => new Date(item.dueAt).getTime() <= Date.now()).map(([id]) => Number(id)).filter(id => progress.includes(id)).sort((a,b) => new Date(reviewData[a].dueAt).getTime() - new Date(reviewData[b].dueAt).getTime()), [reviewData, progress]);
  const challengeScore = useMemo(() => challengeScore, [dailyChallenge, challengeAnswers]);
  const recordRecall = (id: number, remembered: boolean) => {
    setReviewData(old => {
      const current = old[id] || { box: 0, dueAt: new Date().toISOString(), seen: 0, correct: 0, lastReviewedAt: null };
      const box = remembered ? Math.min(REVIEW_INTERVALS.length - 1, current.box + 1) : 0;
      return { ...old, [id]: { box, dueAt: remembered ? addDays(REVIEW_INTERVALS[box]) : new Date(Date.now() + 10 * 60000).toISOString(), seen: current.seen + 1, correct: current.correct + (remembered ? 1 : 0), lastReviewedAt: new Date().toISOString() } };
    });
  };
  const displayedNames = useMemo(() => names.filter(name => {
    const searchable = (name.id + ' ' + name.arabic + ' ' + name.transliteration + ' ' + shownTransliteration(name) + ' ' + name.translation).toLocaleLowerCase();
    const matches = searchable.includes(search.toLocaleLowerCase());
    const tabMatches = activeTab === 'all' || (activeTab === 'review' ? dueReviewIds.includes(name.id) : activeTab === 'favorites' ? favorites.includes(name.id) : true);
    return matches && tabMatches;
  }), [names, search, activeTab, progress, favorites, dueReviewIds]);
  const visibleNames = displayedNames.slice(0, visibleNamesCount);
  const quizItem = names[(quizIndex * 7 + 2) % names.length] ?? names[0];
  const quizOptions = useMemo(() => quizItem ? [quizItem, ...names.filter(n => n.id !== quizItem.id).slice((quizIndex * 11) % Math.max(1, names.length - 4), (quizIndex * 11) % Math.max(1, names.length - 4) + 3)].sort((a,b) => ((a.id * 13 + quizIndex) % 17) - ((b.id * 13 + quizIndex) % 17)) : [], [quizItem, names, quizIndex]);

  const handleButtonSound = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const button = target.closest('button');
    if (button && !button.hasAttribute('data-sound-special')) playFeedbackSound('tap');
  };

  return (
    <main className="app-shell" onClickCapture={handleButtonSound}>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="99 имён Аллаха — главная"><span className="brand-mark">أ</span><span><b>{tr('99 имён Аллаха')}</b></span></a><button className="theme-toggle" onClick={() => setTheme(v=>v==='light'?'dark':'light')} aria-label="Переключить тему">{theme==='light'?'☾':'☀'}</button><select className="language-select" aria-label="Language" value={language} onChange={e => setLanguage(e.target.value as 'ru'|'en'|'ar'|'ky'|'kk')}><option value="ru">Русский</option><option value="en">English</option><option value="ar">العربية</option><option value="ky">Кыргыз тили</option><option value="kk">Қазақша</option></select>
        {user ? <div className="signed-in"><span className="user-email">{user.email}</span><button className="login-button" onClick={signOut}><LogOut size={15}/> {tr('Выйти')}</button></div> :
          <button className="login-button" onClick={() => { setAccountMode('login'); setAccountOpen(true); setError(''); setMessage(''); }}><LockKeyhole size={15}/> {tr('Войти')}</button>}
      </header>

      <section className="hero reveal" id="home">
        <div className="eyebrow"><Sparkles size={14}/> ПУТЬ ПОЗНАНИЯ</div>
        <h1 className="text-enter">{tr('Познакомься с именами')}</h1>
        <p className="hero-copy text-enter">Изучай 99 прекрасных имён Аллаха постепенно, осмысленно и с повторением — в собственном темпе. Обучение бесплатное.</p>
        <button className="primary-button" data-feedback onClick={() => displayedNames[0] && setSelected(displayedNames[0])}>{tr('Начать обучение')} <ArrowRight size={17}/></button>
        <div className="hero-art" aria-hidden="true"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><span>اللَّهُ</span></div>
        <div className="hero-caption">ٱلرَّحْمَٰنُ · ٱلرَّحِيمُ · ٱلْمَلِكُ</div>
      </section>

      <section className="progress-card reveal">
        <div className="progress-heading"><div><span className="muted-label">{tr('ТВОЙ ПУТЬ')}</span><h2>{user ? tr('Твой прогресс обучения') : tr('99 имён. Одно путешествие.')}</h2></div><span className="progress-count">{progress.length} <small>/ 99</small></span></div>
        <div className="progress-track"><span style={{ width: percent + '%' }}/></div>
        <div className="progress-foot"><span><Check size={14}/> {progress.length} {tr('изучено')}</span><span>{tr('Прогресс сохраняется на этом устройстве')}</span></div>
        <div className="daily-goal"><div><b>Ежедневная цель</b><small>{learnedToday.length} из {dailyGoal} имён сегодня</small></div><select aria-label="Ежедневная цель" value={dailyGoal} onChange={e=>setDailyGoal(Number(e.target.value))}><option value={1}>1 имя</option><option value={3}>3 имени</option><option value={5}>5 имён</option></select><div className="goal-track"><span style={{width:Math.min(100,learnedToday.length/dailyGoal*100)+'%'}}/></div></div>
      </section>

      <section className="journey-dashboard reveal" aria-label="Твоя учебная статистика">
        <div className="journey-head"><div><span className="muted-label">ТВОЯ ПРИВЫЧКА</span><h2>Маленький шаг каждый день</h2><p>Не гонись за количеством. Главное — возвращаться к знаниям.</p></div><div className="streak-counter"><span className="streak-flame">✦</span><b>{currentStreak}</b><small>дней подряд</small></div></div>
        <div className="week-activity" aria-label="Активность за последние семь дней">{weekActivity.map(day => <div className={`week-day ${day.count ? "is-active" : ""} ${day.today ? "is-today" : ""}`} key={day.key} title={day.count ? `${day.count} учебный день` : "Без занятий"}><span>{day.label}</span><i>{day.count ? <Check size={13}/> : <span/>}</i></div>)}</div>
        <div className="journey-bottom"><div className="milestone-block"><div className="milestone-label"><span>БЛИЖАЙШАЯ ЦЕЛЬ</span><b>{progress.length} / {nextMilestone}</b></div><div className="milestone-track"><span style={{width: milestoneProgress + "%"}}/></div><small>{nextMilestone === 99 ? "Финишная прямая — осталось совсем немного" : `Ещё ${nextMilestone - progress.length} ${nextMilestone - progress.length === 1 ? "имя" : "имён"} до следующего рубежа`}</small></div><div className="week-summary"><b>{activeDaysThisWeek}/7</b><small>дней с занятиями за неделю</small></div></div>
        <button className="journey-continue" data-feedback onClick={() => { if (nextName) setSelected(nextName); else if (dueReviewIds.length) { const due = names.find(item => item.id === dueReviewIds[0]); if (due) setSelected(due); } else setCatalogOpen(true); }}><span><small>{nextName ? "СЛЕДУЮЩИЙ ШАГ" : dueReviewIds.length ? "ВРЕМЯ ПОВТОРИТЬ" : "ТЫ ПРОШЁЛ ВЕСЬ СПИСОК"}</small><b>{nextName ? `Продолжить: ${nextName.translation}` : dueReviewIds.length ? "Закрепить изученное" : "Вернуться к каталогу"}</b></span><ArrowRight size={19}/></button>
      </section>

      <section className="daily-challenge reveal" aria-label="Ежедневное испытание">
        <div className="challenge-top"><div><span className="muted-label">ПЯТЬ ВОПРОСОВ КАЖДЫЙ ДЕНЬ</span><h2>Испытай свои знания</h2><p>Небольшая ежедневная проверка. Вопросы обновляются каждый день.</p></div><div className="challenge-top-actions"><div className="challenge-best"><span>РЕКОРД</span><b>{challengeBest}/5</b></div></div></div>
        {challengeAnswers.length < 5 ? <div className="challenge-play">
          <div className="challenge-progress"><span>ВОПРОС {challengeAnswers.length + 1} ИЗ 5</span><div>{Array.from({length:5}, (_, i) => <i key={i} className={i < challengeAnswers.length ? "done" : i === challengeAnswers.length ? "current" : ""}/>)}</div></div>
          <div className="challenge-question"><span className="challenge-number">0{challengeAnswers.length + 1}</span><div className="challenge-arabic" lang="ar" dir="rtl">{dailyChallenge[challengeAnswers.length]?.item.arabic}</div><div className="challenge-transliteration">{dailyChallenge[challengeAnswers.length] ? shownTransliteration(dailyChallenge[challengeAnswers.length].item) : ""}</div><p>Прочитай транскрипцию и выбери правильное значение имени</p></div>
          <div className="challenge-options">{(dailyChallenge[challengeAnswers.length]?.options || []).map(option => {
            const correctId = dailyChallenge[challengeAnswers.length]?.item.id;
            const answered = challengeCurrentAnswer !== null;
            const isCorrect = option.id === correctId;
            const isSelected = option.id === challengeCurrentAnswer;
            return <button key={option.id} disabled={answered} className={answered && isCorrect ? 'is-correct' : answered && isSelected ? 'is-wrong' : ''} data-sound-special onClick={() => { if (answered) return; setChallengeCurrentAnswer(option.id); const correct = option.id === correctId; playFeedbackSound(correct ? 'correct' : 'wrong'); if (correct) praiseFor('correct'); }}>{option.translation}</button>;
          })}</div>
          {challengeCurrentAnswer !== null && <div className={dailyChallenge[challengeAnswers.length]?.item.id === challengeCurrentAnswer ? "challenge-feedback correct" : "challenge-feedback wrong"}>
            <b>{dailyChallenge[challengeAnswers.length]?.item.id === challengeCurrentAnswer ? (language === 'kk' ? 'Дұрыс! Машаллах!' : language === 'ky' ? 'Туура! МашаАллах!' : language === 'en' ? 'Correct! MashaAllah!' : language === 'ar' ? 'صحيح! ما شاء الله!' : 'Верно! Машаллах!') : (language === 'kk' ? 'Дәл емес. Дұрыс жауап:' : language === 'ky' ? 'Туура эмес. Туура жооп:' : language === 'en' ? 'Not quite. Correct answer:' : language === 'ar' ? 'ليس تمامًا. الإجابة الصحيحة:' : 'Не совсем. Правильный ответ:')}</b>
            {dailyChallenge[challengeAnswers.length]?.options.find(option => option.id === dailyChallenge[challengeAnswers.length]?.item.id)?.translation}
            <button onClick={() => { if (challengeCurrentAnswer === null) return; const selectedAnswer = challengeCurrentAnswer; setChallengeAnswers(old => [...old, selectedAnswer]); setChallengeCurrentAnswer(null); }}>{challengeAnswers.length === 4 ? "Завершить испытание" : "Следующий вопрос"} <ArrowRight size={15}/></button>
          </div>}
        </div> : <div className="challenge-result">
          <span className="challenge-result-mark">{challengeScore === 5 ? "✦" : "✓"}</span>
          <h3>Испытание завершено</h3><b>{challengeScore} из 5 правильных ответов</b>
          <p>{challengeScore === 5 ? "Прекрасный результат. Продолжай укреплять знания." : "Хорошая работа. Вернись к именам, в которых сомневался."}</p>
          <button onClick={() => { setChallengeAnswers([]); setChallengeCurrentAnswer(null); }}>Пройти ещё раз <ArrowRight size={15}/></button>
        </div>}
        <div className="challenge-foot"><span>Твой лучший результат сохраняется на этом устройстве</span><span>{challengeAnswers.length}/5</span></div>
      </section>
      <section className="learning-section reveal" id="learning">
        <div className="section-heading"><div><span className="muted-label">{tr('ПЕРВЫЕ ШАГИ')}</span><h2>{tr('Изучай имена по порядку')}</h2></div><span className="section-total">{names.length} имён <ChevronRight size={15}/></span></div>
        {!catalogOpen && <button className="show-more-names catalog-toggle" onClick={() => setCatalogOpen(true)}>{tr('Открыть каталог имён')} <ArrowRight size={15}/></button>}
        {catalogOpen && <div className="name-list">
          <button className="catalog-close" onClick={() => setCatalogOpen(false)}>{tr('Свернуть каталог')} <X size={14}/></button>
          <div className="course-tools"><input className="name-search" aria-label="Поиск имени" value={search} onChange={e => {setSearch(e.target.value);setVisibleNamesCount(12);}} placeholder={tr('Найти имя, перевод или транскрипцию…')}/><div className="filter-tabs"><button className={activeTab === 'all' ? 'active' : ''} onClick={() => {setActiveTab('all');setVisibleNamesCount(12);}}>{tr('Все 99')}</button><button className={activeTab === 'review' ? 'active' : ''} onClick={() => {setActiveTab('review');setVisibleNamesCount(12);}}>{tr('Повторить')}</button><button className={activeTab === 'favorites' ? 'active' : ''} onClick={() => {setActiveTab('favorites');setVisibleNamesCount(12);}}>Избранное ({favorites.length})</button></div></div>
          {visibleNames.map(name => <button className="name-row" data-feedback key={name.id} onClick={() => setSelected(name)}>
            <span className="name-number">{String(name.id).padStart(2,'0')}</span><span className="name-arabic" lang="ar" dir="rtl">{name.arabic}</span>
            <span className="name-info"><b>{name.translation}</b><small>{shownTransliteration(name)}</small></span><span className="favorite-indicator">{favorites.includes(name.id)?'♥':''}</span>
            {progress.includes(name.id) ? <Check className="row-arrow learned-check" size={18}/> : <ChevronRight className="row-arrow" size={18}/>}
          </button>)}
          {displayedNames.length === 0 && <p className="empty-results">Ничего не найдено. Попробуй изменить запрос или фильтр.</p>}
          {displayedNames.length > visibleNames.length && <button className="show-more-names" onClick={() => setVisibleNamesCount(count => count + 12)}>Показать ещё имена ({displayedNames.length - visibleNames.length})</button>}
          {false && publishedCount < 99 && <button className="locked-row locked-row-button" onClick={() => setShowAllInfo(true)}>
            <span className="lock-circle"><LockKeyhole size={16}/></span><span><b>Следующие имена</b><small>Новые уроки будут добавляться после проверки источников</small></span><span className="locked-count">ещё {99 - (publishedCount || 3)}</span>
          </button>}
        </div>}
        {!supabase && <p className="setup-warning">Сервис аккаунтов пока не подключён к опубликованной версии сайта.</p>}
      </section>

      <details className="compact-details reveal"><summary><span><b>Проверить знания</b><small>Короткий тест по именам</small></span><ChevronRight size={18}/></summary><section className="practice-section" id="practice">
        <div className="section-heading"><div><span className="muted-label">ЗАКРЕПЛЕНИЕ ЗНАНИЙ</span><h2>Проверь, что запомнил</h2></div><span className="section-total">Мини-тест</span></div>
        {quizIndex < 5 && quizItem ? <div className="quiz-card">
          <div className="challenge-progress"><span>ВОПРОС {quizIndex + 1} ИЗ 5</span><div>{Array.from({length:5}, (_, i) => <i key={i} className={i < quizIndex ? "done" : i === quizIndex ? "current" : ""}/>)}</div></div>
          <span className="muted-label">КАК ПЕРЕВОДИТСЯ ИМЯ?</span><div className="quiz-arabic" lang="ar" dir="rtl">{quizItem.arabic}</div><p className="quiz-translit">{shownTransliteration(quizItem)}</p>
          <div className="quiz-options">{quizOptions.map(option => {
            const answered = quizAnswer !== null;
            const isCorrect = option.id === quizItem.id;
            const isSelected = option.id === quizAnswer;
            return <button key={option.id} disabled={answered} className={answered && isCorrect ? 'correct' : answered && isSelected ? 'incorrect' : ''} data-sound-special onClick={() => { if (answered) return; setQuizAnswer(option.id); const correct = option.id === quizItem.id; playFeedbackSound(correct ? 'correct' : 'wrong'); if (correct) praiseFor('correct'); }}>{option.translation}</button>;
          })}</div>
          {quizAnswer !== null && <div className={quizAnswer === quizItem.id ? 'challenge-feedback correct' : 'challenge-feedback wrong'}>
            <b>{quizAnswer === quizItem.id ? (language === 'kk' ? 'Дұрыс! Машаллах!' : language === 'ky' ? 'Туура! МашаАллах!' : language === 'en' ? 'Correct! MashaAllah!' : language === 'ar' ? 'صحيح! ما شاء الله!' : 'Верно! Машаллах!') : (language === 'kk' ? 'Дәл емес. Дұрыс жауап:' : language === 'ky' ? 'Туура эмес. Туура жооп:' : language === 'en' ? 'Not quite. Correct answer:' : language === 'ar' ? 'ليس تمامًا. الإجابة الصحيحة:' : 'Не совсем. Правильный ответ:')}</b>
            {quizItem.translation}
          </div>}
          {quizAnswer !== null && <button className="quiz-next" onClick={() => { setQuizAnswers(old => [...old, quizAnswer]); setQuizIndex(i => i + 1); setQuizAnswer(null); }}>{quizIndex === 4 ? 'Показать результат' : 'Следующий вопрос'} <ArrowRight size={15}/></button>}
        </div> : <div className="challenge-result">
          <span className="challenge-result-mark">{quizAnswers.filter((answer, index) => answer === names[(index * 7 + 2) % names.length]?.id).length === 5 ? "✦" : "✓"}</span>
          <h3>Тест завершён</h3>
          <b>{quizAnswers.filter((answer, index) => answer === names[(index * 7 + 2) % names.length]?.id).length} из 5 правильных ответов</b>
          <p>{quizAnswers.filter((answer, index) => answer === names[(index * 7 + 2) % names.length]?.id).length === 5 ? "Прекрасный результат. Продолжай укреплять знания." : "Хорошая работа. Повтори имена, в которых ошибся, и попробуй ещё раз."}</p>
          <button onClick={() => { setQuizIndex(0); setQuizAnswer(null); setQuizAnswers([]); }}>Пройти ещё раз <ArrowRight size={15}/></button>
        </div>}
      </section></details>
      <details className="compact-details reveal"><summary><span><b>Повторение и запоминание</b><small>{dueReviewIds.length ? dueReviewIds.length + ' имён ждут повторения' : 'Интервальные повторения помогут закрепить знания'}</small></span><ChevronRight size={18}/></summary><section className="review-system-section">
        <div className="review-system-intro"><span className="muted-label">ИНТЕРВАЛЬНОЕ ПОВТОРЕНИЕ</span><h2>Запоминай надолго</h2><p>После изучения имя попадает в очередь повторения. Если вспомнил правильно — следующий интервал увеличивается. Если забыл — имя вернётся через 10 минут.</p></div>
        <div className="review-stats"><div><b>{dueReviewIds.length}</b><span>пора повторить</span></div><div><b>{Object.keys(reviewData).length}</b><span>в расписании</span></div><div><b>{Object.values(reviewData).reduce((sum,item)=>sum+item.correct,0)}</b><span>успешных повторений</span></div></div>
        {dueReviewIds.length ? <div className="review-queue">{dueReviewIds.slice(0,8).map(id => { const item = names.find(n=>n.id===id); return item ? <button key={id} className="review-queue-row" data-feedback onClick={()=>setSelected(item)}><span className="review-queue-arabic" lang="ar" dir="rtl">{item.arabic}</span><span><b>{item.translation}</b><small>Повторить сейчас</small></span><ArrowRight size={16}/></button> : null; })}</div> : <div className="review-empty"><Check size={19}/><b>На сегодня всё повторено</b><span>Изученные имена появятся здесь, когда наступит срок повторения.</span></div>}
        <p className="review-storage-note">Расписание хранится на этом устройстве. Чтобы не потерять его, не очищай данные браузера. Синхронизация расписания между устройствами пока не подключена.</p>
      </section></details>
      <details className="compact-details reveal"><summary><span><b>Методика обучения</b><small>Как запоминать и повторять</small></span><ChevronRight size={18}/></summary><section className="principles-section" id="method">
        <div className="section-heading"><div><span className="muted-label">КАК УЧИТЬ ЭФФЕКТИВНО</span><h2>Не просто запоминай — понимай</h2></div></div>
        <div className="principle-grid">{studyPrinciples.map((item, i) => <article className="principle-card" key={item.title}><span>0{i+1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      </section></details>
      <details className="compact-details reveal"><summary><span><b>Источники и достоверность</b><small>На чём основаны материалы</small></span><ChevronRight size={18}/></summary><section className="references-section">
        <span className="muted-label">ОСНОВА ИСТОЧНИКОВ</span><h2>Изучай по Корану и Сунне</h2>
        <p className="references-intro">Коран утверждает, что Аллаху принадлежат прекрасные имена и велит обращаться к Нему посредством них. В достоверном хадисе говорится о 99 именах, однако сам хадис не приводит один бесспорный пронумерованный перечень. В разных списках есть расхождения.</p>
        <div className="reference-list">{coreReferences.map(ref => <a key={ref.label} href={ref.url} target="_blank" rel="noreferrer"><b>{ref.label}</b><span>{ref.detail}</span><ArrowRight size={15}/></a>)}</div>
        <p className="editorial-note">Важная оговорка: этот сайт — учебный инструмент, а не фетва. Состав и нумерация популярных списков различаются. Имена, для которых требуется отдельная проверка доказательства, помечены в уроке. Перед окончательной публикацией каждой формулировки необходима проверка квалифицированным редактором исламских наук.</p>
      </section></details>
      <details className="compact-details reveal"><summary><span><b>О создателе</b><small>Немного о Рамазане и других проектах</small></span><ChevronRight size={18}/></summary>
        <section className="creator-section"><div className="creator-mark">ر</div><div className="creator-content"><h2>Ассаляму алейкум!</h2><p>Меня зовут <b>Рамазан</b>. Я создал этот бесплатный сайт, чтобы каждый желающий мог изучать 99 прекрасных имён Аллаха — спокойно, красиво и в удобное время.</p><p>Пусть этот проект станет причиной пользы для нас и для тех, с кем мы им поделимся.</p><span className="creator-signature">С уважением, Рамазан</span></div></section>
        <section className="book-section"><div className="book-icon"><BookOpen size={22}/></div><div className="book-copy"><span className="muted-label">ЕЩЁ ОДИН МОЙ ПРОЕКТ</span><h2>Книга «Очищение нафса»</h2><p>Также я работаю над книгой о воспитании души и очищении сердца.</p><a className="book-link" href={BOOK_URL} target="_blank" rel="noreferrer">Перейти к книге <ArrowRight size={15}/></a></div></section>
      </details>
      <details className="compact-details reveal support-details" id="support"><summary><span><b>Помощь и поддержка</b><small>Ответы на вопросы и возможность поддержать проект</small></span><ChevronRight size={18}/></summary>
        <section className="support-content">
          <div className="support-heading"><span className="support-symbol">♡</span><div><span className="muted-label">МЫ РАДЫ ТВОЕЙ ПОДДЕРЖКЕ</span><h2>Пусть знания распространяются</h2><p>Этот сайт создан бесплатно, чтобы каждый мог изучать прекрасные имена Аллаха. Ты можешь помочь проекту продолжать развиваться.</p></div></div>
          <div className="support-options">
            <article><span className="support-option-icon">♥</span><div><h3>Финансовая поддержка</h3><p>Если сайт принёс тебе пользу и у тебя есть желание, можешь добровольно поддержать его развитие. Это необязательно — все учебные материалы остаются бесплатными.</p><a className="donation-button" href="https://web.tribute.tg/d/T75" target="_blank" rel="noreferrer">Поддержать проект <span>♥</span></a></div></article>
            <article><span className="support-option-icon">↗</span><div><h3>Поделись сайтом</h3><p>Расскажи о проекте близким и друзьям. Возможно, благодаря твоей рекомендации кто-то начнёт изучать имена Аллаха.</p><button className="support-share-button" onClick={shareSite}><Share2 size={15}/> Поделиться сайтом</button></div></article>
          </div>
          <p className="support-note">Поддержка полностью добровольная. Доступ к изучению, повторению и тестам не зависит от пожертвований.</p>
        </section>
      </details>
      {praise && <div className="praise-toast" role="status" aria-live="polite"><span>✦</span>{praise}<span>✦</span></div>}
      {notice && <p className="share-notice" role="status">{notice}</p>}
      <footer><span>99 имён Аллаха · Учись с намерением и постоянством</span><div className="footer-actions"><button onClick={shareSite}><Share2 size={14}/> Поделиться</button><button onClick={() => setSaveOpen(true)}><Bookmark size={14}/> Сохранить</button></div></footer>

      {welcomeOpen && <div className="modal-backdrop welcome-backdrop" onClick={closeWelcome}><section className="info-modal welcome-modal" role="dialog" aria-modal="true" aria-labelledby="welcome-title" onClick={e => e.stopPropagation()}>
        <button className="modal-x" aria-label="Закрыть" onClick={closeWelcome}><X size={19}/></button>
        <div className="welcome-bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <span className="muted-label welcome-eyebrow">ДОБРО ПОЖАЛОВАТЬ</span>
        <h2 id="welcome-title">Ассаляму алейкум!</h2>
        <p className="welcome-greeting">Меня зовут <b>Рамазан</b>. Я создал этот бесплатный сайт, чтобы помочь тебе изучать 99 прекрасных имён Аллаха.</p>
        <p className="welcome-intention"><b>Перед началом сделай намерение:</b> изучать имена Аллаха ради Его довольства, лучше узнавать своего Господа и применять эти знания в жизни.</p>
        <p className="welcome-motivation">Изучай по одному имени, вдумывайся в его смысл и регулярно повторяй. Постоянство важнее спешки.</p>
        <p>Делись знаниями — пусть они принесут пользу и другим.</p>
        <div className="welcome-divider"></div>
        <span className="muted-label welcome-support-label">ПОДДЕРЖАТЬ ПРОЕКТ</span>
        <h3>Помоги этому знанию распространяться</h3>
        <p>Если сайт приносит пользу, можешь добровольно поддержать его развитие.</p>
        <a className="donation-button welcome-donation" href="https://web.tribute.tg/d/T75" target="_blank" rel="noreferrer">Поддержать проект <span>♥</span></a>
        <button className="welcome-continue" onClick={closeWelcome}>Перейти к изучению <ArrowRight size={16}/></button>
        <span className="welcome-signature">С уважением, Рамазан</span>
      </section></div>}

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="lesson-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={() => setSelected(null)}>Закрыть</button>
        <div className="lesson-topline"><span className="muted-label">ИМЯ {String(selected.id).padStart(2,'0')} ИЗ 99</span><span className="lesson-progress-line">{progress.length} / 99 изучено</span></div>
        <div className="lesson-arabic" lang="ar" dir="rtl">{selected.arabic}</div><div className="lesson-quick-actions compact-icon-actions"><button className={favorites.includes(selected.id)?'is-favorite':''} data-feedback onClick={()=>toggleFavorite(selected.id)} aria-label={favorites.includes(selected.id)?'Убрать из избранного':'В избранное'} title={favorites.includes(selected.id)?'Убрать из избранного':'В избранное'}><Heart size={18} fill={favorites.includes(selected.id)?'currentColor':'none'}/></button><button onClick={()=>shareName(selected)} aria-label="Поделиться карточкой" title="Поделиться карточкой"><Share2 size={18}/></button></div>
        <h2 className="text-enter">{selected.translation}</h2>
        <p className="lesson-translit text-enter">{shownTransliteration(selected)}</p>
        <div className="lesson-meaning"><span className="muted-label">ЗНАЧЕНИЕ ИМЕНИ</span><p className="lesson-description text-enter">{selected.explanation}</p></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {progress.includes(selected.id) ? <><p className="already-learned"><Check size={16}/> Изучено</p>{dueReviewIds.includes(selected.id) && <div className="recall-compact"><button aria-label="Вспомнил" title="Вспомнил" data-feedback onClick={()=>{recordRecall(selected.id,true);setNotice('Повторение отмечено. Следующее — через ' + REVIEW_INTERVALS[Math.min(REVIEW_INTERVALS.length-1,(reviewData[selected.id]?.box ?? 0)+1)] + ' дн.');setSelected(null);}}><Check size={16}/></button><button aria-label="Повторить позже" title="Повторить позже" data-feedback onClick={()=>{recordRecall(selected.id,false);setNotice('Имя вернётся на повторение через 10 минут.');setSelected(null);}}><ArrowRight size={16}/></button></div>}</> : <button className="primary-button full" data-feedback disabled={busy} onClick={markLearned}>{busy ? 'Сохраняем…' : 'Изучил'} <Check size={17}/></button>}
        <div className="lesson-navigation">
          <button className="lesson-nav-button" data-feedback disabled={selected.id <= 1} onClick={() => { setError(''); setSelected(completeNames.find(n => n.id === selected.id - 1) || null); }}>← Предыдущее</button>
          <span>{selected.id} из 99</span>
          <button className="lesson-nav-button lesson-next" data-feedback disabled={selected.id >= 99} onClick={() => { setError(''); setSelected(completeNames.find(n => n.id === selected.id + 1) || null); }}>Следующее <ArrowRight size={15}/></button>
        </div>
      </section></div>}

      {accountOpen && <div className="modal-backdrop" onClick={() => setAccountOpen(false)}><section className="info-modal account-modal" role="dialog" aria-modal="true" aria-label="Аккаунт" onClick={e => e.stopPropagation()}>
        <button className="modal-x" aria-label="Закрыть" onClick={() => setAccountOpen(false)}><X size={19}/></button><div className="info-modal-icon"><UserRound size={21}/></div>
        <h2>{accountMode === 'signup' ? 'Бесплатная регистрация' : accountMode === 'login' ? 'Войти в аккаунт' : 'Восстановить пароль'}</h2>
        <p>Создай аккаунт по электронной почте. Обучение бесплатное, а прогресс будет связан с твоим аккаунтом.</p>
        <form onSubmit={submitAccount} className="account-form"><label htmlFor="account-email">Электронная почта</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"/>
          {accountMode !== 'reset' && <><label htmlFor="account-password">Пароль (не менее 6 символов)</label><input id="account-password" type="password" minLength={6} autoComplete={accountMode === 'signup' ? 'new-password' : 'current-password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Не менее 6 символов"/></>}
          {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-message" role="status">{message}</p>}
          <button className="primary-button full" disabled={busy}>{busy ? 'Подожди…' : accountMode === 'signup' ? 'Создать бесплатный аккаунт' : accountMode === 'login' ? 'Войти' : 'Отправить ссылку'} <ArrowRight size={16}/></button>
        </form>
        <div className="account-switch">{accountMode !== 'login' && <button onClick={() => {setAccountMode('login');setError('');setMessage('');}}>Уже есть аккаунт? Войти</button>}{accountMode !== 'signup' && <button onClick={() => {setAccountMode('signup');setError('');setMessage('');}}>Создать аккаунт</button>}{accountMode === 'login' && <button onClick={() => {setAccountMode('reset');setError('');setMessage('');}}>Забыли пароль?</button>}</div>
        <p className="privacy-note"><Mail size={14}/> Почта нужна для входа и восстановления доступа. Номер телефона не требуется.</p>
      </section></div>}

      {showAllInfo && <div className="modal-backdrop" onClick={() => setShowAllInfo(false)}><section className="info-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}><button className="modal-x" onClick={() => setShowAllInfo(false)}><X size={19}/></button><div className="info-modal-icon"><BookOpen size={21}/></div><h2>Готовим полный курс из 99 имён</h2><p>Каждый урок должен содержать точное написание, значение, объяснение и надёжные ссылки на исламские источники. Мы не будем публиковать непроверенные сведения ради количества.</p><button className="primary-button full" onClick={() => setShowAllInfo(false)}>Понятно</button></section></div>}

      {saveOpen && <div className="modal-backdrop" onClick={() => setSaveOpen(false)}><section className="info-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}><button className="modal-x" onClick={() => setSaveOpen(false)}><X size={19}/></button><div className="info-modal-icon"><Bookmark size={21}/></div><h2>Сохрани сайт, чтобы вернуться</h2><p><b>На iPhone:</b> нажми «Поделиться» в Safari, затем выбери «На экран Домой» или «Добавить закладку».</p><p><b>В других браузерах:</b> добавь страницу в закладки.</p><button className="primary-button full" onClick={() => setSaveOpen(false)}>Понятно</button></section></div>}

    </main>
  );
}
