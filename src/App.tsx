import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { ArrowRight, BookOpen, Check, ChevronRight, LockKeyhole, LogOut, Mail, Share2, Sparkles, X, UserRound, Bookmark, Heart, Hand, Volume2, VolumeX } from 'lucide-react';
import { names as completeNames, studyPrinciples, coreReferences } from './data/names';
import { getPronunciationAudioUrl } from './data/pronunciationAudio';
import { GamifiedPath } from './GamifiedPath';
import { DuckMascot } from './DuckMascot';

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
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([key, count]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && typeof count === 'number' && Number.isInteger(count) && count > 0).sort(([a], [b]) => a.localeCompare(b)).slice(-90).map(([key, count]) => [key, Number(count)]));
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
  'Сохраняем…':'Сақталуда…','Связанный источник:':'Қатысты дереккөз:',
  'Прослушать произношение':'Айтылуын тыңдау','Остановить':'Тоқтату','Арабская озвучка голосом устройства':'Құрылғыдағы арабша дауыс','На этом устройстве нет поддержки арабского озвучивания. Попробуй открыть сайт в другом браузере.':'Бұл құрылғы арабша дыбыстауды қолдамайды. Сайтты басқа браузерден ашып көр.','Не удалось воспроизвести произношение. Проверь голосовые настройки устройства.':'Айтылымды ойнату мүмкін болмады. Құрылғының дауыс параметрлерін тексер.'
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

Object.assign(languageText.ky, {
 'ПУТЬ ПОЗНАНИЯ':'ТААНЫП-БИЛҮҮ ЖОЛУ','Ежедневная цель':'Күнүмдүк максат','ТВОЯ ПРИВЫЧКА':'СЕНИН АДАТЫҢ','Маленький шаг каждый день':'Күн сайын кичинекей кадам','Не гонись за количеством. Главное — возвращаться к знаниям.':'Санга умтулба. Эң негизгиси — билимге кайра кайтуу.','дней подряд':'күн катары менен','ОСТАЛОСЬ ИЗУЧИТЬ':'ҮЙРӨНҮҮ КАЛДЫ','ПОРА ПОВТОРИТЬ':'КАЙТАЛОО УБАГЫ','ЦЕЛЬ НА СЕГОДНЯ':'БҮГҮНКҮ МАКСАТ','БЛИЖАЙШАЯ ЦЕЛЬ':'ЖАКЫНКЫ МАКСАТ','ПЯТЬ ВОПРОСОВ КАЖДЫЙ ДЕНЬ':'КҮН САЙЫН БЕШ СУРОО','Испытай свои знания':'Билимиңди сына','Небольшая ежедневная проверка. Вопросы обновляются каждый день.':'Күнүмдүк чакан текшерүү. Суроолор күн сайын жаңыланат.','РЕКОРД':'РЕКОРД','Прочитай транскрипцию и выбери правильное значение имени':'Транскрипцияны окуп, ысымдын туура маанисин танда.','Завершить испытание':'Сынакты аяктоо','Следующий вопрос':'Кийинки суроо','Испытание завершено':'Сынак аяктады','Прекрасный результат. Продолжай укреплять знания.':'Мыкты жыйынтык. Билимиңди бекемдей бер.','Хорошая работа. Вернись к именам, в которых сомневался.':'Жакшы аракет. Күмөн санаган ысымдарыңа кайра кайт.','Пройти ещё раз':'Кайра өтүү','Твой лучший результат сохраняется на этом устройстве':'Эң жакшы жыйынтыгың ушул түзмөктө сакталат','Избранное':'Тандалгандар','Ничего не найдено. Попробуй изменить запрос или фильтр.':'Эч нерсе табылган жок. Издөөнү же чыпканы өзгөртүп көр.','Показать ещё имена':'Дагы ысымдарды көрсөтүү','Следующие имена закрыты':'Кийинки ысымдар жабык','Пройди итоговый экзамен, чтобы открыть следующий этап':'Кийинки этапты ачуу үчүн жыйынтыктоочу сынактан өт.','Проверить знания':'Билимиңди текшер','Короткий тест по именам':'Ысымдар боюнча кыска тест','ЗАКРЕПЛЕНИЕ ЗНАНИЙ':'БИЛИМДИ БЕКЕМДӨӨ','Проверь, что запомнил':'Эмнени эстеп калганыңды текшер','Мини-тест':'Кыска тест','КАК ПЕРЕВОДИТСЯ ИМЯ?':'БУЛ ЫСЫМ КАНДАЙ КОТОРУЛАТ?','Показать результат':'Жыйынтыкты көрсөтүү','Тест завершён':'Тест аяктады','Повторение и запоминание':'Кайталоо жана жаттоо','Методика обучения':'Үйрөнүү ыкмасы','Источники и достоверность':'Булактар жана ишенимдүүлүк','О создателе':'Долбоордун автору',
  "день подряд": "күн катары менен",
  "дня подряд": "күн катары менен",

  "Язык": "Тил",
});
Object.assign(languageText.kk, {
 'ПУТЬ ПОЗНАНИЯ':'ТАНЫМ ЖОЛЫ','Ежедневная цель':'Күнделікті мақсат','ТВОЯ ПРИВЫЧКА':'СЕНІҢ ӘДЕТІҢ','Маленький шаг каждый день':'Күн сайын кішкентай қадам','Не гонись за количеством. Главное — возвращаться к знаниям.':'Сан қуалама. Ең бастысы — білімге қайта оралу.','дней подряд':'күн қатарынан','ОСТАЛОСЬ ИЗУЧИТЬ':'ҮЙРЕНУ ҚАЛДЫ','ПОРА ПОВТОРИТЬ':'ҚАЙТАЛАУ УАҚЫТЫ','ЦЕЛЬ НА СЕГОДНЯ':'БҮГІНГІ МАҚСАТ','БЛИЖАЙШАЯ ЦЕЛЬ':'ЖАҚЫН МАҚСАТ','ПЯТЬ ВОПРОСОВ КАЖДЫЙ ДЕНЬ':'КҮН САЙЫН БЕС СҰРАҚ','Испытай свои знания':'Біліміңді сына','Небольшая ежедневная проверка. Вопросы обновляются каждый день.':'Күнделікті шағын тексеру. Сұрақтар күн сайын жаңартылады.','РЕКОРД':'ҮЗДІК НӘТИЖЕ','Прочитай транскрипцию и выбери правильное значение имени':'Транскрипцияны оқып, есімнің дұрыс мағынасын таңда.','Завершить испытание':'Сынақты аяқтау','Следующий вопрос':'Келесі сұрақ','Испытание завершено':'Сынақ аяқталды','Прекрасный результат. Продолжай укреплять знания.':'Тамаша нәтиже. Біліміңді нығайта бер.','Хорошая работа. Вернись к именам, в которых сомневался.':'Жақсы жұмыс. Күмәнданған есімдеріңе қайта орал.','Пройти ещё раз':'Қайта өту','Твой лучший результат сохраняется на этом устройстве':'Ең үздік нәтижең осы құрылғыда сақталады','Избранное':'Таңдаулылар','Ничего не найдено. Попробуй изменить запрос или фильтр.':'Ештеңе табылмады. Іздеу сұрауын немесе сүзгіні өзгертіп көр.','Показать ещё имена':'Тағы есімдерді көрсету','Следующие имена закрыты':'Келесі есімдер жабық','Пройди итоговый экзамен, чтобы открыть следующий этап':'Келесі кезеңді ашу үшін қорытынды емтиханнан өт.','Проверить знания':'Біліміңді тексер','Короткий тест по именам':'Есімдер бойынша қысқа тест','ЗАКРЕПЛЕНИЕ ЗНАНИЙ':'БІЛІМДІ БЕКІТУ','Проверь, что запомнил':'Нені есте сақтағаныңды тексер','Мини-тест':'Қысқа тест','КАК ПЕРЕВОДИТСЯ ИМЯ?':'БҰЛ ЕСІМНІҢ МАҒЫНАСЫ ҚАНДАЙ?','Показать результат':'Нәтижені көрсету','Тест завершён':'Тест аяқталды','Повторение и запоминание':'Қайталау және есте сақтау','Методика обучения':'Оқу әдісі','Источники и достоверность':'Дереккөздер мен сенімділік','О создателе':'Жоба авторы',
  "день подряд": "күн қатарынан",
  "дня подряд": "күн қатарынан",

  "Язык": "Тіл",
});
Object.assign(languageText.en, {
  'Слушать произношение': 'Listen to pronunciation',
  'Остановить озвучивание': 'Stop audio',
  'Запись произношения взята из открытого пакета; проверка преподавателем ещё не подтверждена.': 'This pronunciation recording comes from an open-source package; review by a qualified Arabic teacher has not been confirmed.',
  'Для этого имени отдельная аудиозапись пока недоступна.': 'A separate audio recording for this name is not available yet.',
  'Не удалось загрузить аудиозапись. Проверь подключение и попробуй ещё раз.': 'Could not load the recording. Check your connection and try again.'
});
Object.assign(languageText.ky, {
  'Слушать произношение': 'Айтылышын угуу',
  'Остановить озвучивание': 'Үндү токтотуу',
  'Запись произношения взята из открытого пакета; проверка преподавателем ещё не подтверждена.': 'Бул айтылыш жазмасы ачык пакеттен алынган; араб тили мугалими тарабынан текшерилгени тастыкталган эмес.',
  'Для этого имени отдельная аудиозапись пока недоступна.': 'Бул ысым үчүн өзүнчө аудио жазма азырынча жок.',
  'Не удалось загрузить аудиозапись. Проверь подключение и попробуй ещё раз.': 'Аудио жазманы жүктөө мүмкүн болгон жок. Интернет байланышын текшерип, кайра аракет кыл.'
});
Object.assign(languageText.kk, {
  'Слушать произношение': 'Айтылуын тыңдау',
  'Остановить озвучивание': 'Дыбыстауды тоқтату',
  'Запись произношения взята из открытого пакета; проверка преподавателем ещё не подтверждена.': 'Бұл айтылым жазбасы ашық пакеттен алынған; білікті араб тілі ұстазының тексергені расталмаған.',
  'Для этого имени отдельная аудиозапись пока недоступна.': 'Бұл есімге арналған жеке аудиожазба әзірге жоқ.',
  'Не удалось загрузить аудиозапись. Проверь подключение и попробуй ещё раз.': 'Аудиожазбаны жүктеу мүмкін болмады. Интернет байланысын тексеріп, қайта көр.'
});
Object.assign(languageText.ar, {
  'Слушать произношение': 'استمع إلى النطق',
  'Остановить озвучивание': 'إيقاف الصوت',
  'Запись произношения взята из открытого пакета; проверка преподавателем ещё не подтверждена.': 'هذا التسجيل مأخوذ من حزمة مفتوحة المصدر؛ ولم يتم تأكيد مراجعته من معلّم عربي مؤهل.',
  'Для этого имени отдельная аудиозапись пока недоступна.': 'لا يتوفر تسجيل صوتي منفصل لهذا الاسم حتى الآن.',
  'Не удалось загрузить аудиозапись. Проверь подключение и попробуй ещё раз.': 'تعذّر تحميل التسجيل. تحقق من اتصال الإنترنت وحاول مرة أخرى.'
});

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


const loadingMessages: Record<'ru' | 'en' | 'ar' | 'ky' | 'kk', string[]> = {
  ru: ['Обучение полностью бесплатное.', 'Каждый день — маленький шаг к знаниям.', 'Проект создан для всех желающих учиться.', 'Вы можете поддержать развитие проекта.'],
  en: ['Learning is completely free.', 'Every day is a small step towards knowledge.', 'This project is open to everyone.', 'You can support the project’s development.'],
  ar: ['التعلّم مجاني بالكامل.', 'كل يوم خطوة صغيرة نحو المعرفة.', 'هذا المشروع متاح للجميع.', 'يمكنك دعم تطوير المشروع.'],
  ky: ['Окуу толугу менен акысыз.', 'Күн сайын билимге карай кичинекей кадам.', 'Долбоор үйрөнүүнү каалагандардын баарына ачык.', 'Долбоордун өнүгүшүнө колдоо көрсөтө аласыз.'],
  kk: ['Оқу толығымен тегін.', 'Күн сайын білімге қарай кішкентай қадам.', 'Жоба үйренгісі келетін баршаға ашық.', 'Жобаның дамуына қолдау көрсете аласыз.'],
};

export default function App() {
  const [language, setLanguage] = useState<'ru'|'en'|'ar'|'ky'|'kk'>(() => { try { return (localStorage.getItem('99-names-language') as 'ru'|'en'|'ar'|'ky'|'kk') || 'ru'; } catch { return 'ru'; } });
  const [initialLoading, setInitialLoading] = useState(true);
  const [preloaderLeaving, setPreloaderLeaving] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const tr = (value: string, values: Record<string, string | number> = {}) => {
    const template = language === 'ru' ? value : languageText[language][value] || value;
    return Object.entries(values).reduce((result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)), template);
  };
  const shownTransliteration = (name: NameItem) => language === 'ru' ? russianTransliterations[name.id] ?? name.transliteration : name.transliteration;
  useEffect(() => {
    let active = true;
    let startTimer: number | undefined;
    let finishTimer: number | undefined;
    const startedAt = performance.now();
    const pageReady = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>(resolve => window.addEventListener('load', () => resolve(), { once: true }));
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const fallback = new Promise<void>(resolve => window.setTimeout(resolve, 2200));

    void Promise.race([Promise.all([pageReady, fontsReady]), fallback]).then(() => {
      const remaining = Math.max(0, 750 - (performance.now() - startedAt));
      startTimer = window.setTimeout(() => {
        if (!active) return;
        setPreloaderLeaving(true);
        finishTimer = window.setTimeout(() => {
          if (active) setInitialLoading(false);
        }, 280);
      }, remaining);
    });

    return () => {
      active = false;
      if (startTimer !== undefined) window.clearTimeout(startTimer);
      if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    if (!initialLoading) return;
    const messages = loadingMessages[language];
    const interval = window.setInterval(() => {
      setLoadingMessageIndex(index => (index + 1) % messages.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [initialLoading, language]);
  useEffect(() => { try { localStorage.setItem('99-names-language', language); } catch { /* ignore */ } document.documentElement.lang = language; document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'; }, [language]);
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - lastScrollY.current;
        const focusInsideHeader = document.activeElement instanceof HTMLElement && document.activeElement.closest('.topbar') !== null;
        if (focusInsideHeader || currentY < 48) setHeaderVisible(true);
        else if (delta > 7) setHeaderVisible(false);
        else if (delta < -7) setHeaderVisible(true);
        lastScrollY.current = currentY;
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [names, setNames] = useState<NameItem[]>(previewNames);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<number[]>(loadProgress);
  const [progressLoadedFor, setProgressLoadedFor] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<Record<number, ReviewRecord>>(loadReviewData);
  const [reviewSessionId, setReviewSessionId] = useState<number | null>(null);
  const [reviewAnswerShown, setReviewAnswerShown] = useState(false);
  const [selected, setSelected] = useState<NameItem | null>(null);
  const [speakingNameId, setSpeakingNameId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    setSpeakingNameId(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, [selected?.id]);
  useEffect(() => () => { audioRef.current?.pause(); }, []);
  const [swipeHintVisible, setSwipeHintVisible] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);
  const [swipeRange, setSwipeRange] = useState<{ min: number; max: number } | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
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
  const [unlockedNameLimit, setUnlockedNameLimit] = useState<number>(() => { try { const saved = JSON.parse(localStorage.getItem('99-names-learning-path-v1') || '{}'); const passed = Array.isArray(saved.passedStages) ? saved.passedStages.filter((id: unknown) => Number.isInteger(id) && Number(id) >= 1 && Number(id) <= 11) : []; return Math.min(99, (new Set(passed).size + 1) * 9); } catch { return 9; } });
  const [learnedToday, setLearnedToday] = useState<number[]>(() => { try { const v=JSON.parse(localStorage.getItem('99-names-learned-today') || '{}'); return (v.date === new Date().toDateString() || v.date === localDayKey()) && Array.isArray(v.ids) ? v.ids.filter((id: unknown) => Number.isInteger(id) && Number(id) >= 1 && Number(id) <= 99) : []; } catch { return []; } });
  const [studyDays, setStudyDays] = useState<Record<string, number>>(loadStudyDays);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const observedDayRef = useRef(localDayKey());
  const dayKey = localDayKey(new Date(clockNow));
  const praiseTimeoutRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'learned' | 'review' | 'favorites'>('all');
  const [visibleNamesCount, setVisibleNamesCount] = useState(12);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => { try { return localStorage.getItem('99-names-welcome-seen') !== '1'; } catch { return true; } });
  const activeAppModal = reviewSessionId !== null ? 'review' : selected ? 'lesson' : accountOpen ? 'account' : welcomeOpen ? 'welcome' : showAllInfo ? 'info' : saveOpen ? 'save' : null;
  useEffect(() => {
    if (!activeAppModal) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = activeAppModal === 'review'
      ? document.querySelector<HTMLElement>('.review-session-modal')
      : activeAppModal === 'lesson'
        ? document.querySelector<HTMLElement>('.lesson-modal:not(.review-session-modal)')
        : activeAppModal === 'account'
          ? document.querySelector<HTMLElement>('.account-modal')
          : activeAppModal === 'welcome'
            ? document.querySelector<HTMLElement>('.welcome-modal')
            : document.querySelector<HTMLElement>('.info-modal');
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const getFocusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(element => element.getAttribute('aria-hidden') !== 'true');
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (activeAppModal === 'review') { setReviewSessionId(null); setReviewAnswerShown(false); }
        else if (activeAppModal === 'lesson') setSelected(null);
        else if (activeAppModal === 'account') setAccountOpen(false);
        else if (activeAppModal === 'welcome') {
          setWelcomeOpen(false);
          try { localStorage.setItem('99-names-welcome-seen', '1'); } catch { /* ignore */ }
        } else if (activeAppModal === 'info') setShowAllInfo(false);
        else if (activeAppModal === 'save') setSaveOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    const focusFrame = window.requestAnimationFrame(() => {
      const target = getFocusable()[0] ?? dialog;
      if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
      target.focus();
    });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.cancelAnimationFrame(focusFrame);
      previouslyFocused?.focus();
    };
  }, [activeAppModal, selected?.id, reviewSessionId]);
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('99-names-theme', theme); } catch {} }, [theme]);
  useEffect(() => { try { localStorage.setItem('99-names-favorites', JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => { try { localStorage.setItem('99-names-daily-goal', String(dailyGoal)); } catch {} }, [dailyGoal]);
  useEffect(() => { try { localStorage.setItem('99-names-learned-today', JSON.stringify({date:localDayKey(),ids:learnedToday})); } catch {} }, [learnedToday]);
  useEffect(() => { try { localStorage.setItem('99-names-study-days', JSON.stringify(studyDays)); } catch {} }, [studyDays]);
  const stopArabicSpeech = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    }
    setSpeakingNameId(null);
  };
  const speakArabicName = async (name: NameItem) => {
    const audioUrl = getPronunciationAudioUrl(name.id);
    if (!audioUrl) {
      setNotice(tr('Для этого имени отдельная аудиозапись пока недоступна.'));
      return;
    }
    stopArabicSpeech();
    const audio = new Audio(audioUrl);
    audio.preload = 'none';
    audioRef.current = audio;
    audio.onended = () => {
      if (audioRef.current === audio) audioRef.current = null;
      setSpeakingNameId(current => current === name.id ? null : current);
    };
    audio.onerror = () => {
      if (audioRef.current === audio) audioRef.current = null;
      setSpeakingNameId(null);
      setNotice(tr('Не удалось загрузить аудиозапись. Проверь подключение и попробуй ещё раз.'));
    };
    setSpeakingNameId(name.id);
    try {
      await audio.play();
    } catch {
      if (audioRef.current === audio) audioRef.current = null;
      setSpeakingNameId(null);
      setNotice(tr('Не удалось загрузить аудиозапись. Проверь подключение и попробуй ещё раз.'));
    }
  };
  const renderPronunciationControl = (name: NameItem) => {
    const isSpeaking = speakingNameId === name.id;
    const label = isSpeaking ? tr('Остановить озвучивание') : tr('Слушать произношение');
    const note = getPronunciationAudioUrl(name.id)
      ? tr('Запись произношения взята из открытого пакета; проверка преподавателем ещё не подтверждена.')
      : tr('Для этого имени отдельная аудиозапись пока недоступна.');
    return (
      <div className="pronunciation-control">
        <button type="button" className={`pronunciation-button${isSpeaking ? ' is-speaking' : ''}`} onClick={() => isSpeaking ? stopArabicSpeech() : void speakArabicName(name)} aria-label={label} aria-pressed={isSpeaking}>
          {isSpeaking ? <VolumeX size={18}/> : <Volume2 size={18}/>}
          <span>{label}</span>
        </button>
        <p className="pronunciation-note" aria-live="polite">{note}</p>
      </div>
    );
  };
  const toggleFavorite = (id:number) => setFavorites(old => old.includes(id) ? old.filter(x=>x!==id) : [...old,id]);
  const shareName = async (name: NameItem) => {
    const text = `${name.translation} — ${shownTransliteration(name)}\nИзучай 99 прекрасных имён Аллаха бесплатно: ${SITE_URL}`;
    try {
      const blob = await makeNameCard(name, shownTransliteration(name));
      const file = new File([blob], `allah-name-${name.id}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: name.translation, text, files: [file] });
      } else {
        downloadBlob(blob, file.name);
        if (navigator.share) await navigator.share({ title: name.translation, text, url: SITE_URL });
        else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        setNotice(tr('Карточка PNG скачана. Прикрепи её к публикации в Threads.'));
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === 'AbortError')) setNotice(tr('Не удалось поделиться. Попробуй ещё раз.'));
    }
  };
  useEffect(() => {
    const interval = window.setInterval(() => setClockNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (observedDayRef.current === dayKey) return;
    observedDayRef.current = dayKey;
    setLearnedToday([]);
  }, [dayKey]);

  const closeWelcome = () => { setWelcomeOpen(false); try { localStorage.setItem('99-names-welcome-seen', '1'); } catch { /* Welcome can be closed even when storage is unavailable. */ } };

  // Load the optional cloud/account client after the first paint so it does not delay the learning interface.
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return;
    let alive = true;
    const timer = window.setTimeout(() => {
      void import('./lib/supabase').then(({ supabase: client }) => {
        if (alive) setSupabaseClient(client);
      }).catch(() => {
        if (alive) setNotice(tr('Не удалось подключить аккаунт. Локальное изучение доступно.'));
      });
    }, 700);
    return () => { alive = false; window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;
    let alive = true;
    void Promise.resolve(supabaseClient.from('names').select('id,arabic,transliteration,translation,explanation,source_references').eq('content_status', 'published').order('id')
      .then(({ data, error: fetchError }: { data: NameItem[] | null; error: unknown }) => {
        if (!alive) return;
        if (fetchError) {
          setNotice(tr('Не удалось загрузить обновлённый каталог. Используется сохранённая версия.'));
          return;
        }
        if (data?.length) {
          const remote = data as NameItem[];
          setNames(completeNames.map(local => remote.find(item => item.id === local.id) ?? local));
        }
      }))
      .catch(() => {
        if (alive) setNotice(tr('Не удалось связаться с каталогом. Изучение доступно в автономном режиме.'));
      });
    void supabaseClient.auth.getSession().then(({ data }: { data: { session: { user: User | null } | null } }) => {
      if (alive) setUser(data.session?.user ?? null);
    }).catch(() => {
      if (alive) setNotice(tr('Не удалось проверить аккаунт. Локальный прогресс сохранён.'));
    });
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      if (alive) setUser(session?.user ?? null);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [supabaseClient]);

  useEffect(() => { try { localStorage.setItem('asma-ul-husna-progress', JSON.stringify(progress)); } catch { /* Storage unavailable */ } }, [progress]);
  useEffect(() => { try { localStorage.setItem('asma-ul-husna-review-v1', JSON.stringify(reviewData)); } catch { /* Storage unavailable */ } }, [reviewData]);
  useEffect(() => { setReviewData(old => { const missing = progress.filter(id => !old[id]); if (!missing.length) return old; const next = { ...old }; missing.forEach(id => { next[id] = { box: 0, dueAt: new Date().toISOString(), seen: 0, correct: 0, lastReviewedAt: null }; }); return next; }); }, [progress]);
  useEffect(() => {
    if (!supabaseClient || !user) { setProgressLoadedFor(null); return; }
    let alive = true;
    setProgressLoadedFor(null);
    void Promise.resolve(supabaseClient.from('user_progress').select('name_id,status').eq('user_id', user.id).then(({ data, error: loadError }: { data: Array<{ name_id: number; status: string }> | null; error: unknown }) => {
      if (!alive) return;
      if (loadError) {
        setNotice(tr('Не удалось загрузить прогресс из аккаунта. Локальные данные сохранены; попробуй обновить страницу.'));
        return;
      }
      const cloudIds = (data || []).filter((item: any) => item.status === 'learned').map((item: any) => Number(item.name_id)).filter((id: number) => Number.isInteger(id) && id >= 1 && id <= 99);
      setProgress(current => Array.from(new Set([...current, ...cloudIds])));
      setProgressLoadedFor(user.id);
    })).catch(() => {
      if (alive) setNotice(tr('Не удалось связаться с хранилищем прогресса. Локальные данные не удалены.'));
    });
    return () => { alive = false; };
  }, [user, supabaseClient]);
  useEffect(() => {
    if (!supabaseClient || !user || progressLoadedFor !== user.id || !progress.length) return;
    const rows = progress.map(name_id => ({ user_id: user.id, name_id, status: 'learned', confidence: 3, times_seen: 1, times_correct: 0, last_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
    void Promise.resolve(supabaseClient.from('user_progress').upsert(rows, { onConflict: 'user_id,name_id', ignoreDuplicates: true })
      .then(({ error: saveError }: { error: unknown }) => {
        if (saveError) setNotice(tr('Прогресс есть на этом устройстве, но не удалось синхронизировать его с аккаунтом.'));
      }))
      .catch(() => setNotice(tr('Прогресс сохранён на этом устройстве, но синхронизация временно недоступна.')));
  }, [supabaseClient, user, progressLoadedFor, progress]);

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
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(SITE_URL); setNotice(tr('Ссылка скопирована. Отправь её близким.')); }
      else setNotice(tr('Скопируй адрес сайта из строки браузера и отправь его близким.'));
    } catch (e) { if (!(e instanceof Error && e.name === 'AbortError')) setNotice(tr('Не удалось открыть меню отправки. Скопируй адрес сайта вручную.')); }
  };

  const submitAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabaseClient) { setError(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? tr('Подключение аккаунта загружается. Попробуй ещё раз через секунду.') : tr('Подключение аккаунтов ещё не настроено. Администратору сайта нужно завершить настройку Supabase.')); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      if (accountMode === 'signup') {
        const { data, error: authError } = await supabaseClient.auth.signUp({ email: email.trim(), password });
        if (authError) throw authError;
        if (data.session) { setMessage(tr('Аккаунт создан. Ты вошёл в систему.')); setAccountOpen(false); }
        else setMessage(tr('Почти готово! Проверь почту и перейди по ссылке подтверждения, чтобы активировать аккаунт.'));
      } else if (accountMode === 'login') {
        const { error: authError } = await supabaseClient.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        setAccountOpen(false); setMessage(tr('Ты успешно вошёл. Прогресс будет сохраняться в аккаунте.'));
      } else {
        const { error: authError } = await supabaseClient.auth.resetPasswordForEmail(email.trim(), { redirectTo: SITE_URL });
        if (authError) throw authError;
        setMessage(tr('Если адрес зарегистрирован, на почту придёт ссылка для смены пароля.'));
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
    if (praiseTimeoutRef.current !== null) window.clearTimeout(praiseTimeoutRef.current);
    praiseTimeoutRef.current = window.setTimeout(() => {
      setPraise('');
      praiseTimeoutRef.current = null;
    }, 2600);
  };

  useEffect(() => () => {
    if (praiseTimeoutRef.current !== null) window.clearTimeout(praiseTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!selected) {
      setSwipeHintVisible(false);
      setSwipeRange(null);
      return;
    }
    try {
      if (localStorage.getItem('99-names-swipe-hint-seen-v2') === '1') { setSwipeHintVisible(false); return; }
      setSwipeHintVisible(true);
      const timer = window.setTimeout(() => setSwipeHintVisible(false), 6000);
      return () => window.clearTimeout(timer);
    } catch { setSwipeHintVisible(true); }
  }, [selected?.id]);

  const handleLessonPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };
  const handleLessonPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || !selected) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) return;

    // A leftward finger movement advances to the next name; right returns to the previous one.
    const isSwipeLeft = dx < 0;
    const nextId = selected.id + (isSwipeLeft ? 1 : -1);
    const allowedRange = swipeRange ?? { min: 1, max: unlockedNameLimit };
    if (nextId < allowedRange.min || nextId > allowedRange.max) return;

    try { localStorage.setItem('99-names-swipe-hint-seen-v2', '1'); } catch { /* Hint can still be dismissed for this session. */ }
    setSwipeHintVisible(false);
    setSwipeDirection(isSwipeLeft ? 1 : -1);
    setError('');
    setSelected(names.find(name => name.id === nextId) || null);
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
    setNotice(tr('Имя отмечено как изученное. Первое повторение запланировано на завтра.'));
    if (supabaseClient && user) {
      try {
        const { error: saveError } = await supabaseClient.from('user_progress').upsert({
          user_id: user.id, name_id: nameId, status: 'learned', confidence: 3,
          times_seen: 1, times_correct: 0, last_reviewed_at: new Date().toISOString(),
          next_review_at: new Date(Date.now() + 86400000).toISOString(), updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,name_id' });
        if (!saveError) setNotice(tr('Готово! Имя отмечено и сохранено в аккаунте.'));
        else setNotice(tr('Имя сохранено на этом устройстве. Синхронизация аккаунта пока недоступна: каталог имён в базе ещё не заполнен.'));
      } catch { setNotice(tr('Имя сохранено на этом устройстве. Облачное сохранение временно недоступно.')); }
    }
    setBusy(false);
  };

  const signOut = async () => {
    if (!supabaseClient) return;
    try {
      const { error: signOutError } = await supabaseClient.auth.signOut();
      if (signOutError) throw signOutError;
      setMessage(tr('Ты вышел из аккаунта. Прогресс на этом устройстве сохранён.'));
    } catch {
      setError(tr('Не удалось выйти из аккаунта. Проверь подключение и попробуй ещё раз.'));
    }
  };
  const percent = Math.round((progress.length / 99) * 100);
  const nextName = names.find(name => name.id <= unlockedNameLimit && !progress.includes(name.id));
  const accessibleNames = useMemo(() => names.filter(name => name.id <= unlockedNameLimit || progress.includes(name.id)), [names, unlockedNameLimit, progress]);
  const todayKey = dayKey;
  const weekActivity = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = localDayKey(date); return { key, label: new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : language === 'ky' ? 'ky-KG' : language === 'kk' ? 'kk-KZ' : language === 'ar' ? 'ar' : 'en', { weekday: 'short' }).format(date), count: studyDays[key] || 0, today: key === todayKey }; }), [language, studyDays, todayKey]);
  const activeDaysThisWeek = weekActivity.filter(day => day.count > 0).length;
  const currentStreak = useMemo(() => { let cursor = new Date(); if (!studyDays[localDayKey(cursor)]) cursor.setDate(cursor.getDate() - 1); let streak = 0; while (studyDays[localDayKey(cursor)] && streak < 90) { streak++; cursor.setDate(cursor.getDate() - 1); } return streak; }, [studyDays, todayKey]);
  const streakLabelKey = language === 'ru'
    ? currentStreak % 10 === 1 && currentStreak % 100 !== 11
      ? 'день подряд'
      : currentStreak % 10 >= 2 && currentStreak % 10 <= 4 && (currentStreak % 100 < 12 || currentStreak % 100 > 14)
        ? 'дня подряд'
        : 'дней подряд'
    : currentStreak === 1 ? 'день подряд' : 'дней подряд';
  const nextMilestone = [1, 5, 10, 25, 50, 75, 99].find(value => value > progress.length) ?? 99;
  const milestoneProgress = Math.min(100, progress.length / nextMilestone * 100);
  const dueReviewIds = useMemo(() => Object.entries(reviewData).filter(([, item]) => new Date(item.dueAt).getTime() <= clockNow).map(([id]) => Number(id)).filter(id => progress.includes(id)).sort((a,b) => new Date(reviewData[a].dueAt).getTime() - new Date(reviewData[b].dueAt).getTime()), [reviewData, progress, clockNow]);
  const startReview = (id: number) => { setReviewSessionId(id); setReviewAnswerShown(false); };
  const recordRecall = (id: number, remembered: boolean) => {
    setReviewData(old => {
      const current = old[id] || { box: 0, dueAt: new Date().toISOString(), seen: 0, correct: 0, lastReviewedAt: null };
      const box = remembered ? Math.min(REVIEW_INTERVALS.length - 1, current.box + 1) : 0;
      return { ...old, [id]: { box, dueAt: remembered ? addDays(REVIEW_INTERVALS[box]) : new Date(Date.now() + 10 * 60000).toISOString(), seen: current.seen + 1, correct: current.correct + (remembered ? 1 : 0), lastReviewedAt: new Date().toISOString() } };
    });
  };
  const finishReview = (remembered: boolean) => {
    if (reviewSessionId === null) return;
    const currentId = reviewSessionId;
    recordRecall(currentId, remembered);
    if (!remembered) {
      setNotice(tr('Ничего страшного. Это имя вернётся через 10 минут.'));
      setReviewSessionId(null); setReviewAnswerShown(false);
      return;
    }
    const nextId = dueReviewIds.find(id => id !== currentId);
    if (nextId !== undefined) { setReviewSessionId(nextId); setReviewAnswerShown(false); }
    else { setReviewSessionId(null); setReviewAnswerShown(false); setNotice(tr('Отлично! Все доступные на сегодня повторения завершены.')); }
  };
  const displayedNames = useMemo(() => accessibleNames.filter(name => {
    const searchable = (name.id + ' ' + name.arabic + ' ' + name.transliteration + ' ' + shownTransliteration(name) + ' ' + name.translation).toLocaleLowerCase();
    const matches = searchable.includes(search.toLocaleLowerCase());
    const tabMatches = activeTab === 'all' || (activeTab === 'review' ? dueReviewIds.includes(name.id) : activeTab === 'favorites' ? favorites.includes(name.id) : true);
    return matches && tabMatches;
  }), [accessibleNames, search, activeTab, progress, favorites, dueReviewIds]);
  const visibleNames = displayedNames.slice(0, visibleNamesCount);


  return (
    <main className="app-shell" aria-busy={initialLoading}>
      {initialLoading && <div className={`site-preloader${preloaderLeaving ? ' is-leaving' : ''}`} role="status" aria-live="polite">
        <div className="site-preloader__content">
          <DuckMascot language={language} />
          <p className="site-preloader__brand">{tr('99 имён Аллаха')}</p>
          <div className="site-preloader__spinner" aria-hidden="true"><span /></div>
          <p className="site-preloader__message" key={loadingMessageIndex}>{loadingMessages[language][loadingMessageIndex]}</p>
          <p className="site-preloader__note">{language === 'en' ? 'A free learning project' : language === 'ar' ? 'مشروع تعليمي مجاني' : language === 'ky' ? 'Акысыз билим берүү долбоору' : language === 'kk' ? 'Тегін білім беру жобасы' : 'Бесплатный образовательный проект'}</p>
        </div>
      </div>}
      <header className={`topbar${headerVisible ? '' : ' topbar-hidden'}`} aria-hidden={!headerVisible} inert={!headerVisible}>
        <a className="brand" href="#home" aria-label={tr("99 имён Аллаха — главная")}><span className="brand-mark">أ</span><span><b>{tr('99 имён Аллаха')}</b></span></a><button className="theme-toggle" onClick={() => setTheme(v=>v==='light'?'dark':'light')} aria-label={tr("Переключить тему")}>{theme==='light'?'☾':'☀'}</button><select className="language-select" aria-label={tr('Язык')} value={language} onChange={e => setLanguage(e.target.value as 'ru'|'en'|'ar'|'ky'|'kk')}><option value="ru">Русский</option><option value="en">English</option><option value="ar">العربية</option><option value="ky">Кыргыз тили</option><option value="kk">Қазақша</option></select>
        {user ? <div className="signed-in"><span className="user-email">{user.email}</span><button className="login-button" onClick={signOut}><LogOut size={15}/> {tr('Выйти')}</button></div> :
          <button className="login-button" onClick={() => { setAccountMode('login'); setAccountOpen(true); setError(''); setMessage(''); }}><LockKeyhole size={15}/> {tr('Войти')}</button>}
      </header>

      <section className="hero reveal" id="home">
        <div className="eyebrow"><Sparkles size={14}/> {tr('ПУТЬ ПОЗНАНИЯ')}</div>
        <h1 className="text-enter">{tr('Познакомься с именами')}</h1>
        <p className="hero-copy text-enter">{tr('Изучай 99 прекрасных имён Аллаха постепенно, осмысленно и с повторением — в собственном темпе. Обучение бесплатное.')}</p>
        <button className="primary-button" data-feedback onClick={() => displayedNames[0] && setSelected(displayedNames[0])}>{tr('Начать обучение')} <ArrowRight size={17}/></button>
        <DuckMascot language={language} />
        
      </section>

      <section className="progress-card reveal">
        <div className="progress-heading"><div><span className="muted-label">{tr('ТВОЙ ПУТЬ')}</span><h2>{user ? tr('Твой прогресс обучения') : tr('99 имён. Одно путешествие.')}</h2></div><span className="progress-count">{progress.length} <small>/ 99</small></span></div>
        <div className="progress-track"><span style={{ width: percent + '%' }}/></div>
        <div className="progress-foot"><span><Check size={14}/> {progress.length} {tr('изучено')}</span><span>{tr('Прогресс сохраняется на этом устройстве')}</span></div>
        <div className="daily-goal"><div><b>{tr('Ежедневная цель')}</b><small>{tr("{count} из {goal} имён сегодня",{count:learnedToday.length,goal:dailyGoal})}</small></div><select aria-label={tr("Ежедневная цель")} value={dailyGoal} onChange={e=>setDailyGoal(Number(e.target.value))}><option value={1}>{tr("1 имя")}</option><option value={3}>{tr("3 имени")}</option><option value={5}>{tr("5 имён")}</option></select><div className="goal-track"><span style={{width:Math.min(100,learnedToday.length/dailyGoal*100)+'%'}}/></div></div>
      </section>

      <section className="journey-dashboard reveal" aria-label={tr('Твоя учебная статистика')}>
        <div className="journey-head"><div><span className="muted-label">{tr('ТВОЯ ПРИВЫЧКА')}</span><h2>{tr('Маленький шаг каждый день')}</h2><p>{tr('Не гонись за количеством. Главное — возвращаться к знаниям.')}</p></div><div className="streak-counter"><span className="streak-flame">✦</span><b>{currentStreak}</b><small>{tr(streakLabelKey)}</small></div></div>
        <div className="week-activity" aria-label={tr('Активность за последние семь дней')}>{weekActivity.map(day => <div className={`week-day ${day.count ? "is-active" : ""} ${day.today ? "is-today" : ""}`} key={day.key} title={day.count ? tr("{count} учебный день",{count:day.count}) : tr("Без занятий")}><span>{day.label}</span><i>{day.count ? <Check size={13}/> : <span/>}</i></div>)}</div>
        <div className="journey-stats" aria-label={tr('Текущие учебные показатели')}><div className="journey-stat"><span>{tr('ОСТАЛОСЬ ИЗУЧИТЬ')}</span><b>{Math.max(0, 99 - progress.length)}</b><small>{tr("из 99 имён")}</small></div><div className="journey-stat"><span>{tr('ПОРА ПОВТОРИТЬ')}</span><b>{dueReviewIds.length}</b><small>{dueReviewIds.length === 1 ? tr("имя ждёт повторения") : tr("имён ждут повторения")}</small></div><div className="journey-stat"><span>{tr('ЦЕЛЬ НА СЕГОДНЯ')}</span><b>{Math.min(learnedToday.length, dailyGoal)} / {dailyGoal}</b><small>{learnedToday.length >= dailyGoal ? tr("цель выполнена") : tr("изученных имён")}</small></div></div>
        <div className="journey-bottom"><div className="milestone-block"><div className="milestone-label"><span>{tr('БЛИЖАЙШАЯ ЦЕЛЬ')}</span><b>{progress.length} / {nextMilestone}</b></div><div className="milestone-track"><span style={{width: milestoneProgress + "%"}}/></div><small>{nextMilestone === 99 ? tr("Финишная прямая — осталось совсем немного") : tr("Ещё {count} имён до следующего рубежа",{count:nextMilestone-progress.length})}</small></div><div className="week-summary"><b>{activeDaysThisWeek}/7</b><small>{tr("дней с занятиями за неделю")}</small></div></div>
        <button className="journey-continue" data-feedback onClick={() => { if (nextName) setSelected(nextName); else if (dueReviewIds.length) { const due = names.find(item => item.id === dueReviewIds[0]); if (due) setSelected(due); } else setCatalogOpen(true); }}><span><small>{nextName ? tr('Следующий шаг') : dueReviewIds.length ? tr('Время повторить') : tr('Ты прошёл весь список')}</small><b dir={language === 'ar' ? 'auto' : undefined}>{nextName ? `${language === 'ru' ? 'Продолжить' : language === 'en' ? 'Continue' : language === 'ar' ? 'متابعة' : language === 'ky' ? 'Улантуу' : 'Жалғастыру'}: ${nextName.translation}` : dueReviewIds.length ? tr('Закрепить изученное') : tr('Вернуться к каталогу')}</b></span><ArrowRight size={19}/></button>
      </section>

      <GamifiedPath names={names} progress={progress} language={language} getTransliteration={(nameId) => { const name = names.find(item => item.id === nameId); return name ? shownTransliteration(name) : ''; }} onUnlockedNameLimit={setUnlockedNameLimit} onOpenName={(name) => { const lessonStart = Math.floor((name.id - 1) / 3) * 3 + 1; setSwipeRange({ min: lessonStart, max: Math.min(lessonStart + 2, 99) }); setError(''); setSelected(names.find(item => item.id === name.id) ?? null); }} />

      <section className="learning-section reveal" id="learning">
        <div className="section-heading"><div><span className="muted-label">{tr('ПЕРВЫЕ ШАГИ')}</span><h2>{tr('Изучай имена по порядку')}</h2></div><span className="section-total">{names.length} имён <ChevronRight size={15}/></span></div>{language !== 'ru' && <p className="content-language-note">{tr('Переводы значений и объяснения имён пока доступны на русском языке.')}</p>}
        {!catalogOpen && <button className="show-more-names catalog-toggle" onClick={() => setCatalogOpen(true)}>{tr('Открыть каталог имён')} <ArrowRight size={15}/></button>}
        {catalogOpen && <div className="name-list">
          <button className="catalog-close" onClick={() => setCatalogOpen(false)}>{tr('Свернуть каталог')} <X size={14}/></button>
          <div className="course-tools"><input className="name-search" aria-label={tr("Поиск имени")} value={search} onChange={e => {setSearch(e.target.value);setVisibleNamesCount(12);}} placeholder={tr('Найти имя, перевод или транскрипцию…')}/><div className="filter-tabs"><button className={activeTab === 'all' ? 'active' : ''} onClick={() => {setActiveTab('all');setVisibleNamesCount(12);}}>{tr('Все 99')}</button><button className={activeTab === 'review' ? 'active' : ''} onClick={() => {setActiveTab('review');setVisibleNamesCount(12);}}>{tr('Повторить')}</button><button className={activeTab === 'favorites' ? 'active' : ''} onClick={() => {setActiveTab('favorites');setVisibleNamesCount(12);}}>{tr('Избранное')} ({favorites.length})</button></div></div>
          {visibleNames.map(name => <button className="name-row" data-feedback key={name.id} onClick={() => setSelected(name)}>
            <span className="name-number">{String(name.id).padStart(2,'0')}</span><span className="name-arabic" lang="ar" dir="rtl">{name.arabic}</span>
            <span className="name-info" dir={language === 'ar' ? 'ltr' : undefined} lang={language === 'ar' ? 'ru' : language}><b>{name.translation}</b><small>{shownTransliteration(name)}</small></span><span className="favorite-indicator">{favorites.includes(name.id)?'♥':''}</span>
            {progress.includes(name.id) ? <Check className="row-arrow learned-check" size={18}/> : <ChevronRight className="row-arrow" size={18}/>}
          </button>)}
          {displayedNames.length === 0 && <p className="empty-results">{tr('Ничего не найдено. Попробуй изменить запрос или фильтр.')}</p>}
          {displayedNames.length > visibleNames.length && <button className="show-more-names" onClick={() => setVisibleNamesCount(count => count + 12)}>{tr('Показать ещё имена')} ({displayedNames.length - visibleNames.length})</button>}
          {unlockedNameLimit < 99 && <button className="locked-row locked-row-button" onClick={() => document.getElementById('learning-path')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <span className="lock-circle"><LockKeyhole size={16}/></span><span><b>{tr('Следующие имена закрыты')}</b><small>{tr('Пройди итоговый экзамен, чтобы открыть следующий этап')}</small></span><span className="locked-count">ещё {99 - unlockedNameLimit}</span>
          </button>}
        </div>}
        {!supabaseClient && !import.meta.env.VITE_SUPABASE_URL && <p className="setup-warning">{tr("Сервис аккаунтов пока не подключён к опубликованной версии сайта.")}</p>}
      </section>

      <details className="compact-details reveal"><summary><span><b>{tr('Повторение и запоминание')}</b><small>{dueReviewIds.length ? dueReviewIds.length + ' ' + (language === 'en' ? 'Names due for review' : language === 'ar' ? 'أسماء بانتظار المراجعة' : language === 'ky' ? 'ысым кайталоону күтөт' : language === 'kk' ? 'есім қайталауды күтуде' : 'имён ждут повторения') : tr('Интервальные повторения помогут закрепить знания')}</small></span><ChevronRight size={18}/></summary><section className="review-system-section">
        <div className="review-system-intro"><span className="muted-label">{tr('ИНТЕРВАЛЬНОЕ ПОВТОРЕНИЕ')}</span><h2>{tr('Запоминай надолго')}</h2><p>{tr('После изучения имя попадает в очередь повторения. Если вспомнил правильно — следующий интервал увеличивается. Если забыл — имя вернётся через 10 минут.')}</p></div>
        <div className="review-stats"><div><b>{dueReviewIds.length}</b><span>{tr('пора повторить')}</span></div><div><b>{Object.keys(reviewData).length}</b><span>{tr('в расписании')}</span></div><div><b>{Object.values(reviewData).reduce((sum,item)=>sum+item.correct,0)}</b><span>{tr('успешных повторений')}</span></div></div>
        {dueReviewIds.length ? <div className="review-queue">{dueReviewIds.slice(0,8).map(id => { const item = names.find(n=>n.id===id); return item ? <button key={id} className="review-queue-row" data-feedback onClick={()=>startReview(id)}><span className="review-queue-arabic" lang="ar" dir="rtl">{item.arabic}</span><span><b dir="auto" lang="ru">{item.translation}</b><small>{tr('Повторить сейчас')}</small></span><ArrowRight size={16}/></button> : null; })}</div> : <div className="review-empty"><Check size={19}/><b>{tr('На сегодня всё повторено')}</b><span>{tr('Изученные имена появятся здесь, когда наступит срок повторения.')}</span></div>}
        <p className="review-storage-note">{tr('Расписание хранится на этом устройстве. Чтобы не потерять его, не очищай данные браузера. Синхронизация расписания между устройствами пока не подключена.')}</p>
      </section></details>
      <details className="compact-details reveal"><summary><span><b>{tr('Методика обучения')}</b><small>{tr('Как запоминать и повторять')}</small></span><ChevronRight size={18}/></summary><section className="principles-section" id="method">
        <div className="section-heading"><div><span className="muted-label">{tr('КАК УЧИТЬ ЭФФЕКТИВНО')}</span><h2>{tr('Не просто запоминай — понимай')}</h2></div></div>
        <div className="principle-grid">{studyPrinciples.map((item, i) => <article className="principle-card" key={item.title}><span>0{i+1}</span><h3>{tr(item.title)}</h3><p>{tr(item.body)}</p></article>)}</div>
      </section></details>
      <details className="compact-details reveal"><summary><span><b>{tr('Источники и достоверность')}</b><small>{tr("На чём основаны материалы")}</small></span><ChevronRight size={18}/></summary><section className="references-section">
        <span className="muted-label">{tr("ОСНОВА ИСТОЧНИКОВ")}</span><h2>{tr("Изучай по Корану и Сунне")}</h2>
        <p className="references-intro">{tr("Коран утверждает, что Аллаху принадлежат прекрасные имена и велит обращаться к Нему посредством них. В достоверном хадисе говорится о 99 именах, однако сам хадис не приводит один бесспорный пронумерованный перечень. В разных списках есть расхождения.")}</p>
        <div className="reference-list">{coreReferences.map(ref => <a key={ref.label} href={ref.url} target="_blank" rel="noreferrer"><b>{tr(ref.label)}</b><span>{tr(ref.detail)}</span><ArrowRight size={15}/></a>)}</div>
        <p className="editorial-note">{tr("Важная оговорка: этот сайт — учебный инструмент, а не фетва. Состав и нумерация популярных списков различаются. Имена, для которых требуется отдельная проверка доказательства, помечены в уроке. Перед окончательной публикацией каждой формулировки необходима проверка квалифицированным редактором исламских наук.")}</p>
      </section></details>
      <details className="compact-details reveal"><summary><span><b>{tr('О создателе')}</b><small>{tr("Немного о Рамазане и других проектах")}</small></span><ChevronRight size={18}/></summary>
        <section className="creator-section"><div className="creator-mark">ر</div><div className="creator-content"><h2>{tr("Ассаляму алейкум!")}</h2><p>{tr("Меня зовут {name}. Я создал этот бесплатный сайт, чтобы каждый желающий мог изучать 99 прекрасных имён Аллаха — спокойно, красиво и в удобное время.",{name:"Рамазан"})}</p><p>{tr("Пусть этот проект станет причиной пользы для нас и для тех, с кем мы им поделимся.")}</p><span className="creator-signature">{tr("С уважением, {name}",{name:"Рамазан"})}</span></div></section>
        <section className="book-section"><div className="book-icon"><BookOpen size={22}/></div><div className="book-copy"><span className="muted-label">{tr("ЕЩЁ ОДИН МОЙ ПРОЕКТ")}</span><h2>{tr("Книга «Очищение нафса»")}</h2><p>{tr("Также я работаю над книгой о воспитании души и очищении сердца.")}</p><a className="book-link" href={BOOK_URL} target="_blank" rel="noreferrer">{tr("Перейти к книге")} <ArrowRight size={15}/></a></div></section>
      </details>
      <details className="compact-details reveal support-details" id="support"><summary><span><b>{tr("Помощь и поддержка")}</b><small>{tr("Ответы на вопросы и возможность поддержать проект")}</small></span><ChevronRight size={18}/></summary>
        <section className="support-content">
          <div className="support-heading"><span className="support-symbol">♡</span><div><span className="muted-label">{tr("МЫ РАДЫ ТВОЕЙ ПОДДЕРЖКЕ")}</span><h2>{tr("Пусть знания распространяются")}</h2><p>{tr("Этот сайт создан бесплатно, чтобы каждый мог изучать прекрасные имена Аллаха. Ты можешь помочь проекту продолжать развиваться.")}</p></div></div>
          <div className="support-options">
            <article><span className="support-option-icon">♥</span><div><h3>{tr("Финансовая поддержка")}</h3><p>{tr("Если сайт принёс тебе пользу и у тебя есть желание, можешь добровольно поддержать его развитие. Это необязательно — все учебные материалы остаются бесплатными.")}</p><a className="donation-button" href="https://web.tribute.tg/d/T75" target="_blank" rel="noreferrer">{tr("Поддержать проект")} <span>♥</span></a></div></article>
            <article><span className="support-option-icon">↗</span><div><h3>{tr("Поделись сайтом")}</h3><p>{tr("Расскажи о проекте близким и друзьям. Возможно, благодаря твоей рекомендации кто-то начнёт изучать имена Аллаха.")}</p><button className="support-share-button" onClick={shareSite}><Share2 size={15}/> {tr("Поделиться сайтом")}</button></div></article>
          </div>
          <p className="support-note">{tr("Поддержка полностью добровольная. Доступ к изучению, повторению и тестам не зависит от пожертвований.")}</p>
        </section>
      </details>
      {praise && <div className="praise-toast" role="status" aria-live="polite"><span>✦</span>{praise}<span>✦</span></div>}
      {notice && <p className="share-notice" role="status">{notice}</p>}
      <footer><span>{tr("99 имён Аллаха · Учись с намерением и постоянством")}</span><div className="footer-actions"><button onClick={shareSite}><Share2 size={14}/> {tr("Поделиться")}</button><button onClick={() => setSaveOpen(true)}><Bookmark size={14}/> {tr("Сохранить")}</button></div></footer>

      {welcomeOpen && <div className="modal-backdrop welcome-backdrop" onClick={closeWelcome}><section className="info-modal welcome-modal" role="dialog" aria-modal="true" aria-labelledby="welcome-title" onClick={e => e.stopPropagation()}>
        <button className="modal-x" aria-label={tr("Закрыть")} onClick={closeWelcome}><X size={19}/></button>
        <div className="welcome-bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <span className="muted-label welcome-eyebrow">{tr("ДОБРО ПОЖАЛОВАТЬ")}</span>
        <h2 id="welcome-title">{tr("Ассаляму алейкум!")}</h2>
        <p className="welcome-greeting">{tr("Я Рамазан. Создал этот бесплатный сайт, чтобы ты мог изучать 99 прекрасных имён Аллаха.")}</p>
        <p className="welcome-intention">{tr("Изучай постепенно, вдумывайся в смысл и старайся применять знания в жизни. Пусть это будет ради довольства Аллаха.")}</p>
        <div className="welcome-actions">
          <button className="welcome-continue" onClick={closeWelcome}>{tr("Перейти к изучению")} <ArrowRight size={16}/></button>
          <a className="donation-button welcome-donation" href="https://web.tribute.tg/d/T75" target="_blank" rel="noreferrer">{tr("Поддержать проект")} <span>♥</span></a>
        </div>
      </section></div>}

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section key={selected.id} className={`lesson-modal ${swipeDirection > 0 ? 'swipe-direction-next' : 'swipe-direction-prev'}${swipeHintVisible ? ' swipe-hint-active' : ''}`} role="dialog" aria-modal="true" aria-label={tr("Имя {id} из 99",{id:selected.id})} onClick={e => e.stopPropagation()} onPointerDown={handleLessonPointerDown} onPointerUp={handleLessonPointerUp} onPointerCancel={() => { swipeStartRef.current = null; }}>
        <button className="close-button" onClick={() => setSelected(null)}>{tr("Закрыть")}</button>
        <div className="lesson-topline"><span className="muted-label">{tr("ИМЯ {id} ИЗ 99",{id:String(selected.id).padStart(2,"0")})}</span><span className="lesson-progress-line">{tr("{count} / 99 изучено",{count:progress.length})}</span></div>
        {swipeHintVisible && <div className="swipe-hint" aria-live="polite"><Hand size={22} strokeWidth={1.8}/><span>{tr('Смахни влево — следующее имя')}</span><span className="swipe-hint-arrow">←</span></div>}
        <div className="lesson-arabic" lang="ar" dir="rtl">{selected.arabic}</div>{renderPronunciationControl(selected)}<div className="lesson-quick-actions compact-icon-actions"><button className={favorites.includes(selected.id)?'is-favorite':''} data-feedback onClick={()=>toggleFavorite(selected.id)} aria-label={favorites.includes(selected.id)?tr('Убрать из избранного'):tr('В избранное')} title={favorites.includes(selected.id)?tr('Убрать из избранного'):tr('В избранное')}><Heart size={18} fill={favorites.includes(selected.id)?'currentColor':'none'}/></button><button onClick={()=>shareName(selected)} aria-label={tr('Поделиться карточкой')} title={tr('Поделиться карточкой')}><Share2 size={18}/></button></div>
        <h2 className="text-enter" dir={language === 'ar' ? 'ltr' : undefined} lang={language === 'ar' ? 'ru' : language}>{selected.translation}</h2>
        <p className="lesson-translit text-enter">{shownTransliteration(selected)}</p>
        <div className="lesson-meaning"><span className="muted-label">{tr('ЗНАЧЕНИЕ ИМЕНИ')}</span><p className="lesson-description text-enter" dir={language === 'ar' ? 'ltr' : undefined} lang={language === 'ar' ? 'ru' : language}>{selected.explanation}</p></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {progress.includes(selected.id) ? <><p className="already-learned"><Check size={16}/> {tr('Изучено')}</p>{dueReviewIds.includes(selected.id) && <div className="recall-compact"><button aria-label={tr("Вспомнил")} title={tr("Вспомнил")} data-feedback onClick={()=>{recordRecall(selected.id,true);setNotice(tr('Повторение отмечено. Следующее — через {days} дн.',{days:REVIEW_INTERVALS[Math.min(REVIEW_INTERVALS.length-1,(reviewData[selected.id]?.box ?? 0)+1)]}));setSelected(null);}}><Check size={16}/></button><button aria-label={tr("Повторить позже")} title={tr("Повторить позже")} data-feedback onClick={()=>{recordRecall(selected.id,false);setNotice(tr('Имя вернётся на повторение через 10 минут.'));setSelected(null);}}><ArrowRight size={16}/></button></div>}</> : <button className="primary-button full" data-feedback disabled={busy} onClick={markLearned}>{busy ? tr('Сохраняем…') : tr('Изучил')} <Check size={17}/></button>}

      </section></div>}

      {reviewSessionId !== null && (() => { const item = names.find(name => name.id === reviewSessionId); return item ? <div className="modal-backdrop review-session-backdrop" onClick={() => { setReviewSessionId(null); setReviewAnswerShown(false); }}><section className="lesson-modal review-session-modal" role="dialog" aria-modal="true" aria-label={tr("Повторение имени")} onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={() => { setReviewSessionId(null); setReviewAnswerShown(false); }}>{tr('Закрыть')}</button>
        <span className="muted-label">{tr('ИНТЕРВАЛЬНОЕ ПОВТОРЕНИЕ')}</span>
        <div className="review-session-step">{tr('Имя {id} · {count} в очереди', {id: item.id, count: dueReviewIds.length})}</div>
        <div className="lesson-arabic review-session-arabic" lang="ar" dir="rtl">{item.arabic}</div>
        {renderPronunciationControl(item)}
        <p className="lesson-translit">{shownTransliteration(item)}</p>
        <h2>{tr('Вспомни значение этого имени')}</h2>
        {!reviewAnswerShown ? <button className="primary-button full" data-feedback onClick={() => setReviewAnswerShown(true)}>{tr('Показать значение')}</button> : <><div className="review-session-answer" dir={language === 'ar' ? 'ltr' : undefined} lang={language === 'ar' ? 'ru' : language}><b>{item.translation}</b><p>{item.explanation}</p></div><p className="review-session-question">{tr('Удалось вспомнить значение до подсказки?')}</p><div className="review-session-actions"><button className="review-session-remembered" data-feedback onClick={() => finishReview(true)}>{tr('Вспомнил')}</button><button className="review-session-forgot" data-feedback onClick={() => finishReview(false)} >{tr('Нужно повторить')}</button></div></>}
        <p className="review-storage-note">{tr('Честно оцени своё воспоминание — так интервалы будут подбираться точнее.')}</p>
      </section></div> : null; })()}

      {accountOpen && <div className="modal-backdrop" onClick={() => setAccountOpen(false)}><section className="info-modal account-modal" role="dialog" aria-modal="true" aria-label={tr("Аккаунт")} onClick={e => e.stopPropagation()}>
        <button className="modal-x" aria-label={tr("Закрыть")} onClick={() => setAccountOpen(false)}><X size={19}/></button><div className="info-modal-icon"><UserRound size={21}/></div>
        <h2>{accountMode === 'signup' ? tr('Бесплатная регистрация') : accountMode === 'login' ? tr('Войти в аккаунт') : tr('Восстановить пароль')}</h2>
        <p>{tr("Создай аккаунт по электронной почте. Обучение бесплатное, а прогресс будет связан с твоим аккаунтом.")}</p>
        <form onSubmit={submitAccount} className="account-form"><label htmlFor="account-email">{tr("Электронная почта")}</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"/>
          {accountMode !== 'reset' && <><label htmlFor="account-password">{tr("Пароль (не менее 6 символов)")}</label><input id="account-password" type="password" minLength={6} autoComplete={accountMode === 'signup' ? 'new-password' : 'current-password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder={tr("Не менее 6 символов")}/></>}
          {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-message" role="status">{message}</p>}
          <button className="primary-button full" disabled={busy}>{busy ? tr('Подожди…') : accountMode === 'signup' ? tr('Создать бесплатный аккаунт') : accountMode === 'login' ? tr('Войти') : tr('Отправить ссылку')} <ArrowRight size={16}/></button>
        </form>
        <div className="account-switch">{accountMode !== 'login' && <button onClick={() => {setAccountMode('login');setError('');setMessage('');}}>{tr('Уже есть аккаунт? Войти')}</button>}{accountMode !== 'signup' && <button onClick={() => {setAccountMode('signup');setError('');setMessage('');}}>{tr('Создать аккаунт')}</button>}{accountMode === 'login' && <button onClick={() => {setAccountMode('reset');setError('');setMessage('');}}>{tr('Забыли пароль?')}</button>}</div>
        <p className="privacy-note"><Mail size={14}/> {tr("Почта нужна для входа и восстановления доступа. Номер телефона не требуется.")}</p>
      </section></div>}

      {showAllInfo && <div className="modal-backdrop" onClick={() => setShowAllInfo(false)}><section className="info-modal" role="dialog" aria-modal="true" aria-label={tr("Готовим полный курс из 99 имён")} onClick={e => e.stopPropagation()}><button className="modal-x" aria-label={tr("Закрыть")} onClick={() => setShowAllInfo(false)}><X size={19}/></button><div className="info-modal-icon"><BookOpen size={21}/></div><h2>{tr("Готовим полный курс из 99 имён")}</h2><p>{tr("Каждый урок должен содержать точное написание, значение, объяснение и надёжные ссылки на исламские источники. Мы не будем публиковать непроверенные сведения ради количества.")}</p><button className="primary-button full" onClick={() => setShowAllInfo(false)}>{tr("Понятно")}</button></section></div>}

      {saveOpen && <div className="modal-backdrop" onClick={() => setSaveOpen(false)}><section className="info-modal" role="dialog" aria-modal="true" aria-label={tr("Сохрани сайт, чтобы вернуться")} onClick={e => e.stopPropagation()}><button className="modal-x" aria-label={tr("Закрыть")} onClick={() => setSaveOpen(false)}><X size={19}/></button><div className="info-modal-icon"><Bookmark size={21}/></div><h2>{tr("Сохрани сайт, чтобы вернуться")}</h2><p><b>{tr("На iPhone:")}</b> {tr("нажми «Поделиться» в Safari, затем выбери «На экран Домой» или «Добавить закладку».")}</p><p><b>{tr("В других браузерах:")}</b> {tr("добавь страницу в закладки.")}</p><button className="primary-button full" onClick={() => setSaveOpen(false)}>{tr("Понятно")}</button></section></div>}

    </main>
  );
}
