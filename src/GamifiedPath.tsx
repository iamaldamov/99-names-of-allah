import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Award, BookOpen, Check, ChevronRight, LockKeyhole, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import './gamified-path.css';

type LearningName = {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
};

type LessonQuestion = {
  nameId: number;
  options: LearningName[];
};

type UiLanguage = 'ru' | 'ky' | 'kk' | 'en' | 'ar';

type PathState = {
  passedStages: number[];
  bestScores: Record<number, number>;
};

const messages: Record<Exclude<UiLanguage, 'ru'>, Record<string, string>> = {
  "en": {
    "ОБУЧЕНИЕ ПО ЭТАПАМ": "LEARNING PATH",
    "Твой путь изучения": "Your learning journey",
    "Двигайся постепенно: три коротких урока, затем проверка знаний.": "Move step by step: three short lessons, followed by a knowledge check.",
    "Набрано {xp} игровых очков опыта": "{xp} game experience points earned",
    "опыт": "XP earned",
    "ТЕКУЩИЙ ЭТАП": "CURRENT STAGE",
    "{count} из 9 имён изучено": "{count} of 9 names learned",
    "Открыто {count} из 11 этапов": "{count} of 11 stages unlocked",
    "Открыто этапов: {count} из 11": "Stages unlocked: {count} of 11",
    "ЭТАП ЗАВЕРШЁН": "STAGE COMPLETED",
    "ТВОЙ ТЕКУЩИЙ ЭТАП": "YOUR CURRENT STAGE",
    "ЭТАП ДОСТУПЕН": "STAGE AVAILABLE",
    "ПОКА ЗАКРЫТ": "LOCKED FOR NOW",
    "Этап {id}": "Stage {id}",
    "Урок {id}": "Lesson {id}",
    "Урок {id}, {status}": "Lesson {id}, {status}",
    "пройден": "completed",
    "открыть": "open",
    "закрыт": "locked",
    "Завершён · 3 имени": "Completed · 3 names",
    "{count}/3 изучено": "{count}/3 learned",
    "Сначала заверши предыдущий": "Complete the previous lesson first",
    "Экзамен пройден · лучший результат {score}/10": "Exam passed · best score {score}/10",
    "Начать итоговый экзамен": "Start final exam",
    "До экзамена: изучи ещё {count}": "Before the exam: learn {count} more",
    "Пройди экзамен предыдущего этапа, чтобы открыть этот раздел.": "Pass the previous stage exam to unlock this section.",
    "Этапы — только удобная структура обучения. Они не обозначают степень достоинства имён или духовный ранг человека. Прогресс этой версии игрового пути пока сохраняется на устройстве.": "Stages are simply a learning structure. They do not indicate the rank of the Names or a person's spiritual standing. Progress in this version is saved on this device.",
    "Закрыть экзамен": "Close exam",
    "ИТОГОВАЯ ПРОВЕРКА · ЭТАП {id}": "FINAL CHECK · STAGE {id}",
    "Проверь, что запомнил": "Test what you remember",
    "10 вопросов по изученным именам. Для открытия следующего этапа нужно ответить правильно минимум на 8.": "10 questions about the names you studied. Answer at least 8 correctly to unlock the next stage.",
    "ВОПРОС {current} ИЗ 10": "QUESTION {current} OF 10",
    "{count} правильных": "{count} correct",
    "Какое значение соответствует этому имени?": "Which meaning matches this Name?",
    "Верно! Продолжай.": "Correct! Keep going.",
    "Правильный ответ: {answer}.": "Correct answer: {answer}.",
    "Завершить экзамен": "Finish exam",
    "Следующий вопрос": "Next question",
    "Проверить ответ": "Check answer",
    "РЕЗУЛЬТАТ ЭКЗАМЕНА": "EXAM RESULT",
    "Этап пройден!": "Stage passed!",
    "Попробуй ещё раз": "Try again",
    "{score} из 10": "{score} out of 10",
    "Ты завершил все 11 этапов обучения.": "You have completed all 11 learning stages.",
    "Отличная работа. Следующий этап теперь открыт.": "Well done. The next stage is now unlocked.",
    "Для открытия следующего этапа нужно набрать не менее 8 правильных ответов. Прогресс уроков сохранён.": "You need at least 8 correct answers to unlock the next stage. Your lesson progress has been saved.",
    "Все этапы завершены · +20 XP": "All stages completed · +20 XP",
    "Следующий этап открыт · +20 XP": "Next stage unlocked · +20 XP",
    "Продолжить обучение": "Continue learning",
    "Пересдать экзамен": "Retake exam"
  },
  "ky": {
    "ОБУЧЕНИЕ ПО ЭТАПАМ": "ЭТАПТАР БОЮНЧА ҮЙРӨНҮҮ",
    "Твой путь изучения": "Үйрөнүү жолуң",
    "Двигайся постепенно: три коротких урока, затем проверка знаний.": "Акырындык менен үйрөн: үч кыска сабак, андан кийин билимди текшерүү.",
    "Набрано {xp} игровых очков опыта": "{xp} оюн тажрыйба упайы топтолду",
    "опыт": "тажрыйба упайы",
    "ТЕКУЩИЙ ЭТАП": "УЧУРДАГЫ ЭТАП",
    "{count} из 9 имён изучено": "9 ысымдын {count} үйрөнүлдү",
    "Открыто {count} из 11 этапов": "11 этаптын {count} ачылды",
    "Открыто этапов: {count} из 11": "Ачылган этаптар: {count}/11",
    "ЭТАП ЗАВЕРШЁН": "ЭТАП АЯКТАДЫ",
    "ТВОЙ ТЕКУЩИЙ ЭТАП": "УЧУРДАГЫ ЭТАБЫҢ",
    "ЭТАП ДОСТУПЕН": "ЭТАП АЧЫК",
    "ПОКА ЗАКРЫТ": "АЗЫРЫНЧА ЖАБЫК",
    "Этап {id}": "{id}-этап",
    "Урок {id}": "{id}-сабак",
    "Урок {id}, {status}": "{id}-сабак, {status}",
    "пройден": "аяктады",
    "открыть": "ачуу",
    "закрыт": "жабык",
    "Завершён · 3 имени": "Аяктады · 3 ысым",
    "{count}/3 изучено": "{count}/3 үйрөнүлдү",
    "Сначала заверши предыдущий": "Адегенде мурунку сабакты аякта",
    "Экзамен пройден · лучший результат {score}/10": "Сынак өттү · эң жакшы жыйынтык {score}/10",
    "Начать итоговый экзамен": "Жыйынтыктоочу сынакты баштоо",
    "До экзамена: изучи ещё {count}": "Сынакка чейин дагы {count} ысымды үйрөн",
    "Пройди экзамен предыдущего этапа, чтобы открыть этот раздел.": "Бул бөлүмдү ачуу үчүн мурунку этаптын сынагынан өт.",
    "Этапы — только удобная структура обучения. Они не обозначают степень достоинства имён или духовный ранг человека. Прогресс этой версии игрового пути пока сохраняется на устройстве.": "Этаптар — үйрөнүүнү жеңилдеткен түзүм гана. Алар ысымдардын даражасын же адамдын руханий деңгээлин билдирбейт. Бул версиядагы жетишкендик түзмөктө сакталат.",
    "Закрыть экзамен": "Сынакты жабуу",
    "ИТОГОВАЯ ПРОВЕРКА · ЭТАП {id}": "ЖЫЙЫНТЫК ТЕКШЕРҮҮ · {id}-ЭТАП",
    "Проверь, что запомнил": "Эмнени эстеп калганыңды текшер",
    "10 вопросов по изученным именам. Для открытия следующего этапа нужно ответить правильно минимум на 8.": "Үйрөнгөн ысымдар боюнча 10 суроо. Кийинки этапты ачуу үчүн кеминде 8 суроого туура жооп бер.",
    "ВОПРОС {current} ИЗ 10": "10 СУРООНУН {current}-СУРООСУ",
    "{count} правильных": "{count} туура жооп",
    "Какое значение соответствует этому имени?": "Бул ысымдын мааниси кайсы?",
    "Верно! Продолжай.": "Туура! Уланта бер.",
    "Правильный ответ: {answer}.": "Туура жооп: {answer}.",
    "Завершить экзамен": "Сынакты аяктоо",
    "Следующий вопрос": "Кийинки суроо",
    "Проверить ответ": "Жоопту текшерүү",
    "РЕЗУЛЬТАТ ЭКЗАМЕНА": "СЫНАКТЫН ЖЫЙЫНТЫГЫ",
    "Этап пройден!": "Этаптан өттүң!",
    "Попробуй ещё раз": "Кайра аракет кыл",
    "{score} из 10": "10 суроодон {score}",
    "Ты завершил все 11 этапов обучения.": "Сен үйрөнүүнүн бардык 11 этабын аяктадың.",
    "Отличная работа. Следующий этап теперь открыт.": "Азаматсың! Кийинки этап ачылды.",
    "Для открытия следующего этапа нужно набрать не менее 8 правильных ответов. Прогресс уроков сохранён.": "Кийинки этапты ачуу үчүн кеминде 8 туура жооп керек. Сабактардагы жетишкендигиң сакталды.",
    "Все этапы завершены · +20 XP": "Бардык этаптар аяктады · +20 XP",
    "Следующий этап открыт · +20 XP": "Кийинки этап ачылды · +20 XP",
    "Продолжить обучение": "Үйрөнүүнү улантуу",
    "Пересдать экзамен": "Сынакты кайра тапшыруу"
  },
  "kk": {
    "ОБУЧЕНИЕ ПО ЭТАПАМ": "КЕЗЕҢДЕР БОЙЫНША ОҚУ",
    "Твой путь изучения": "Сенің оқу жолың",
    "Двигайся постепенно: три коротких урока, затем проверка знаний.": "Біртіндеп үйрен: үш қысқа сабақ, содан кейін білімді тексеру.",
    "Набрано {xp} игровых очков опыта": "{xp} ойын тәжірибе ұпайы жиналды",
    "опыт": "тәжірибе ұпайы",
    "ТЕКУЩИЙ ЭТАП": "АҒЫМДАҒЫ КЕЗЕҢ",
    "{count} из 9 имён изучено": "9 есімнің {count} үйренілді",
    "Открыто {count} из 11 этапов": "11 кезеңнің {count} ашық",
    "Открыто этапов: {count} из 11": "Ашылған кезеңдер: {count}/11",
    "ЭТАП ЗАВЕРШЁН": "КЕЗЕҢ АЯҚТАЛДЫ",
    "ТВОЙ ТЕКУЩИЙ ЭТАП": "СЕНІҢ ҚАЗІРГІ КЕЗЕҢІҢ",
    "ЭТАП ДОСТУПЕН": "КЕЗЕҢ ҚОЛЖЕТІМДІ",
    "ПОКА ЗАКРЫТ": "ӘЗІРГЕ ЖАБЫҚ",
    "Этап {id}": "{id}-кезең",
    "Урок {id}": "{id}-сабақ",
    "Урок {id}, {status}": "{id}-сабақ, {status}",
    "пройден": "аяқталды",
    "открыть": "ашу",
    "закрыт": "жабық",
    "Завершён · 3 имени": "Аяқталды · 3 есім",
    "{count}/3 изучено": "{count}/3 үйренілді",
    "Сначала заверши предыдущий": "Алдымен алдыңғы сабақты аяқта",
    "Экзамен пройден · лучший результат {score}/10": "Емтихан тапсырылды · үздік нәтиже {score}/10",
    "Начать итоговый экзамен": "Қорытынды емтиханды бастау",
    "До экзамена: изучи ещё {count}": "Емтиханға дейін тағы {count} есімді үйрен",
    "Пройди экзамен предыдущего этапа, чтобы открыть этот раздел.": "Бұл бөлімді ашу үшін алдыңғы кезеңнің емтиханынан өт.",
    "Этапы — только удобная структура обучения. Они не обозначают степень достоинства имён или духовный ранг человека. Прогресс этой версии игрового пути пока сохраняется на устройстве.": "Кезеңдер — оқуды жеңілдететін құрылым ғана. Олар есімдердің дәрежесін немесе адамның рухани деңгейін білдірмейді. Бұл нұсқадағы жетістік осы құрылғыда сақталады.",
    "Закрыть экзамен": "Емтиханды жабу",
    "ИТОГОВАЯ ПРОВЕРКА · ЭТАП {id}": "ҚОРЫТЫНДЫ ТЕКСЕРУ · {id}-КЕЗЕҢ",
    "Проверь, что запомнил": "Нені есте сақтағаныңды тексер",
    "10 вопросов по изученным именам. Для открытия следующего этапа нужно ответить правильно минимум на 8.": "Үйренген есімдер бойынша 10 сұрақ. Келесі кезеңді ашу үшін кемінде 8 сұраққа дұрыс жауап бер.",
    "ВОПРОС {current} ИЗ 10": "10 СҰРАҚТЫҢ {current}-СҰРАҒЫ",
    "{count} правильных": "{count} дұрыс жауап",
    "Какое значение соответствует этому имени?": "Бұл есімнің мағынасы қандай?",
    "Верно! Продолжай.": "Дұрыс! Жалғастыр.",
    "Правильный ответ: {answer}.": "Дұрыс жауап: {answer}.",
    "Завершить экзамен": "Емтиханды аяқтау",
    "Следующий вопрос": "Келесі сұрақ",
    "Проверить ответ": "Жауапты тексеру",
    "РЕЗУЛЬТАТ ЭКЗАМЕНА": "ЕМТИХАН НӘТИЖЕСІ",
    "Этап пройден!": "Кезең аяқталды!",
    "Попробуй ещё раз": "Қайта байқап көр",
    "{score} из 10": "10 сұрақтың {score}",
    "Ты завершил все 11 этапов обучения.": "Оқудың барлық 11 кезеңін аяқтадың.",
    "Отличная работа. Следующий этап теперь открыт.": "Жарайсың! Келесі кезең ашылды.",
    "Для открытия следующего этапа нужно набрать не менее 8 правильных ответов. Прогресс уроков сохранён.": "Келесі кезеңді ашу үшін кемінде 8 дұрыс жауап қажет. Сабақтардағы жетістігің сақталды.",
    "Все этапы завершены · +20 XP": "Барлық кезең аяқталды · +20 XP",
    "Следующий этап открыт · +20 XP": "Келесі кезең ашылды · +20 XP",
    "Продолжить обучение": "Оқуды жалғастыру",
    "Пересдать экзамен": "Емтиханды қайта тапсыру"
  },
  "ar": {
    "ОБУЧЕНИЕ ПО ЭТАПАМ": "مسار التعلّم",
    "Твой путь изучения": "رحلتك في التعلّم",
    "Двигайся постепенно: три коротких урока, затем проверка знаний.": "تقدّم تدريجيًا: ثلاثة دروس قصيرة، ثم اختبار للمعرفة.",
    "Набрано {xp} игровых очков опыта": "تم جمع {xp} من نقاط الخبرة",
    "опыт": "نقاط خبرة",
    "ТЕКУЩИЙ ЭТАП": "المرحلة الحالية",
    "{count} из 9 имён изучено": "تم تعلّم {count} من 9 أسماء",
    "Открыто {count} из 11 этапов": "تم فتح {count} من 11 مرحلة",
    "Открыто этапов: {count} из 11": "المراحل المفتوحة: {count} من 11",
    "ЭТАП ЗАВЕРШЁН": "اكتملت المرحلة",
    "ТВОЙ ТЕКУЩИЙ ЭТАП": "مرحلتك الحالية",
    "ЭТАП ДОСТУПЕН": "المرحلة متاحة",
    "ПОКА ЗАКРЫТ": "مغلقة حاليًا",
    "Этап {id}": "المرحلة {id}",
    "Урок {id}": "الدرس {id}",
    "Урок {id}, {status}": "الدرس {id}، {status}",
    "пройден": "مكتمل",
    "открыть": "افتح",
    "закрыт": "مغلق",
    "Завершён · 3 имени": "مكتمل · 3 أسماء",
    "{count}/3 изучено": "تم تعلّم {count}/3",
    "Сначала заверши предыдущий": "أكمل الدرس السابق أولًا",
    "Экзамен пройден · лучший результат {score}/10": "تم اجتياز الاختبار · أفضل نتيجة {score}/10",
    "Начать итоговый экзамен": "ابدأ الاختبار النهائي",
    "До экзамена: изучи ещё {count}": "تعلّم {count} أسماء أخرى قبل الاختبار",
    "Пройди экзамен предыдущего этапа, чтобы открыть этот раздел.": "اجتز اختبار المرحلة السابقة لفتح هذا القسم.",
    "Этапы — только удобная структура обучения. Они не обозначают степень достоинства имён или духовный ранг человека. Прогресс этой версии игрового пути пока сохраняется на устройстве.": "المراحل مجرد تنظيم للتعلّم، ولا تعبّر عن منزلة الأسماء أو المرتبة الروحية للإنسان. يُحفظ التقدّم في هذه النسخة على هذا الجهاز.",
    "Закрыть экзамен": "إغلاق الاختبار",
    "ИТОГОВАЯ ПРОВЕРКА · ЭТАП {id}": "الاختبار النهائي · المرحلة {id}",
    "Проверь, что запомнил": "اختبر ما تذكّرته",
    "10 вопросов по изученным именам. Для открытия следующего этапа нужно ответить правильно минимум на 8.": "10 أسئلة حول الأسماء التي تعلمتها. أجب عن 8 أسئلة على الأقل بشكل صحيح لفتح المرحلة التالية.",
    "ВОПРОС {current} ИЗ 10": "السؤال {current} من 10",
    "{count} правильных": "{count} إجابات صحيحة",
    "Какое значение соответствует этому имени?": "ما المعنى الموافق لهذا الاسم؟",
    "Верно! Продолжай.": "صحيح! واصل.",
    "Правильный ответ: {answer}.": "الإجابة الصحيحة: {answer}.",
    "Завершить экзамен": "إنهاء الاختبار",
    "Следующий вопрос": "السؤال التالي",
    "Проверить ответ": "تحقّق من الإجابة",
    "РЕЗУЛЬТАТ ЭКЗАМЕНА": "نتيجة الاختبار",
    "Этап пройден!": "اجتزت المرحلة!",
    "Попробуй ещё раз": "حاول مرة أخرى",
    "{score} из 10": "{score} من 10",
    "Ты завершил все 11 этапов обучения.": "لقد أكملت مراحل التعلّم الإحدى عشرة.",
    "Отличная работа. Следующий этап теперь открыт.": "أحسنت. أصبحت المرحلة التالية متاحة.",
    "Для открытия следующего этапа нужно набрать не менее 8 правильных ответов. Прогресс уроков сохранён.": "تحتاج إلى 8 إجابات صحيحة على الأقل لفتح المرحلة التالية. تم حفظ تقدّم الدروس.",
    "Все этапы завершены · +20 XP": "اكتملت جميع المراحل · +20 XP",
    "Следующий этап открыт · +20 XP": "المرحلة التالية متاحة · +20 XP",
    "Продолжить обучение": "متابعة التعلّم",
    "Пересдать экзамен": "إعادة الاختبار"
  }
};

function translate(language: UiLanguage, key: string, values: Record<string, string | number> = {}): string {
  const template = language === 'ru' ? key : messages[language]?.[key] ?? key;
  return Object.entries(values).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, String(value)), template);
}

const STORAGE_KEY = '99-names-learning-path-v1';
const STAGE_SIZE = 9;
const LESSON_SIZE = 3;
const PASS_SCORE = 8;

function readPathState(): PathState {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<PathState>;
    return {
      passedStages: (() => {
        const saved = Array.isArray(raw.passedStages)
          ? [...new Set(raw.passedStages.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 11))].sort((a, b) => a - b)
          : [];
        const contiguous: number[] = [];
        for (let stage = 1; stage <= 11 && saved.includes(stage); stage += 1) contiguous.push(stage);
        return contiguous;
      })(),
      bestScores: raw.bestScores && typeof raw.bestScores === 'object' && !Array.isArray(raw.bestScores)
        ? Object.fromEntries(Object.entries(raw.bestScores).filter(([id, score]) => Number.isInteger(Number(id)) && Number(id) >= 1 && Number(id) <= 11 && Number.isInteger(score) && score >= 0 && score <= 10))
        : {},
    };
  } catch {
    return { passedStages: [], bestScores: {} };
  }
}

function shuffled<T,>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function GamifiedPath({ names, progress, onOpenName, onUnlockedNameLimit, language, user }: {
  names: LearningName[];
  progress: number[];
  onOpenName: (name: LearningName) => void;
  onUnlockedNameLimit: (limit: number) => void;
  language: UiLanguage;
  user: User | null;
}) {
  const t = (key: string, values: Record<string, string | number> = {}) => translate(language, key, values);
  const [pathState, setPathState] = useState<PathState>(readPathState);
  const [pathHydratedFor, setPathHydratedFor] = useState<string | null>(null);
  const [examStage, setExamStage] = useState<number | null>(null);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const examDialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!user) {
      setPathHydratedFor(null);
      return;
    }
    const remote = user.user_metadata?.learning_path_v1 as Partial<PathState> | undefined;
    if (remote && typeof remote === 'object') {
      const remotePassed = Array.isArray(remote.passedStages)
        ? remote.passedStages.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 11)
        : [];
      const remoteScores = remote.bestScores && typeof remote.bestScores === 'object' && !Array.isArray(remote.bestScores)
        ? remote.bestScores
        : {};
      setPathState(local => {
        const passed = [...new Set([...local.passedStages, ...remotePassed])].sort((a, b) => a - b);
        const contiguous: number[] = [];
        for (let stage = 1; stage <= 11 && passed.includes(stage); stage += 1) contiguous.push(stage);
        const bestScores = { ...local.bestScores };
        for (const [id, value] of Object.entries(remoteScores)) {
          const stageId = Number(id);
          if (Number.isInteger(stageId) && stageId >= 1 && stageId <= 11 && Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 10) {
            bestScores[stageId] = Math.max(bestScores[stageId] ?? 0, Number(value));
          }
        }
        return { passedStages: contiguous, bestScores };
      });
    }
    setPathHydratedFor(user.id);
  }, [user?.id]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pathState)); } catch { /* Local progress remains usable for this session. */ }
    if (user && supabase && pathHydratedFor === user.id) {
      void supabase.auth.updateUser({ data: { learning_path_v1: pathState } });
    }
  }, [pathState, user?.id, pathHydratedFor]);

  const unlockedCount = Math.min(11, pathState.passedStages.length + 1);
  useEffect(() => { onUnlockedNameLimit(unlockedCount * STAGE_SIZE); }, [unlockedCount, onUnlockedNameLimit]);

  const stages = useMemo(() => Array.from({ length: 11 }, (_, index) => {
    const id = index + 1;
    const stageNames = names.filter(name => name.id > index * STAGE_SIZE && name.id <= (index + 1) * STAGE_SIZE);
    const lessons = Array.from({ length: 3 }, (_, lessonIndex) => stageNames.slice(lessonIndex * LESSON_SIZE, (lessonIndex + 1) * LESSON_SIZE));
    return { id, names: stageNames, lessons };
  }), [names]);

  const completedLessons = stages.reduce((total, stage) =>
    total + stage.lessons.filter(lesson => lesson.length === LESSON_SIZE && lesson.every(name => progress.includes(name.id))).length, 0);
  const xp = completedLessons * 5 + pathState.passedStages.length * 20;
  const activeStage = stages.find(stage => stage.id === unlockedCount) ?? stages[0];
  const currentQuestion = questions[questionIndex];
  const currentCorrect = currentQuestion?.options.find(option => option.id === currentQuestion.nameId);

  const startExam = (stageId: number) => {
    const stage = stages.find(item => item.id === stageId);
    if (!stage || stage.names.length !== STAGE_SIZE || !stage.names.every(name => progress.includes(name.id))) return;
    const pool = shuffled(stage.names);
    // Nine names make ten questions, so repeat one randomly rather than always repeating question one.
    const questionNames = shuffled([...pool, pool[Math.floor(Math.random() * pool.length)]]);
    const examQuestions = Array.from({ length: 10 }, (_, index) => {
      const correct = questionNames[index];
      const distractors = shuffled(stage.names.filter(name => name.id !== correct.id)).slice(0, 3);
      return { nameId: correct.id, options: shuffled([correct, ...distractors]) };
    });
    setExamStage(stageId);
    setQuestions(examQuestions);
    setQuestionIndex(0);
    setAnswer(null);
    setChecked(false);
    setScore(0);
    setResult(null);
  };

  const submitAnswer = () => {
    if (answer === null || !currentQuestion || checked) return;
    setChecked(true);
  };

  const nextQuestion = () => {
    if (!currentQuestion || answer === null) return;
    const nextScore = score + (answer === currentQuestion.nameId ? 1 : 0);
    setScore(nextScore);
    if (questionIndex === questions.length - 1) {
      setResult(nextScore);
      if (examStage !== null) {
        setPathState(old => ({
          passedStages: nextScore >= PASS_SCORE && !old.passedStages.includes(examStage)
            ? [...old.passedStages, examStage]
            : old.passedStages,
          bestScores: { ...old.bestScores, [examStage]: Math.max(old.bestScores[examStage] ?? 0, nextScore) },
        }));
      }
      return;
    }
    setQuestionIndex(index => index + 1);
    setAnswer(null);
    setChecked(false);
  };

  const closeExam = () => {
    setExamStage(null);
    setQuestions([]);
    setResult(null);
  };

  useEffect(() => {
    if (examStage === null) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = examDialogRef.current;
    const getFocusable = () => dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'))
          .filter(element => element.getAttribute('aria-hidden') !== 'true')
      : [];
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeExam();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => {
      const initialTarget = dialog?.querySelector<HTMLElement>('.path-exam-close') ?? dialog;
      initialTarget?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.cancelAnimationFrame(focusFrame);
      previouslyFocused?.focus();
    };
  }, [examStage]);

  return (
    <>
      <section className="learning-path reveal" lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} id="learning-path" aria-labelledby="learning-path-title">
        <div className="learning-path-heading">
          <div>
            <span className="muted-label">{t('ОБУЧЕНИЕ ПО ЭТАПАМ')}</span>
            <h2 id="learning-path-title">{t('Твой путь изучения')}</h2>
            <p>{t('Двигайся постепенно: три коротких урока, затем проверка знаний.')}</p>
          </div>
          <div className="path-xp" aria-label={t('Набрано {xp} игровых очков опыта', {xp})}>
            <Sparkles size={17} />
            <b>{xp} XP</b>
            <small>{t('опыт')}</small>
          </div>
        </div>

        <div className="path-overview">
          <div className="path-overview-main">
            <span>{t('ТЕКУЩИЙ ЭТАП')}</span>
            <b>{activeStage.id} <small>/ 11</small></b>
            <p>{t('{count} из 9 имён изучено', {count: activeStage.names.filter(name => progress.includes(name.id)).length})}</p>
          </div>
          <div className="path-overview-track" aria-label={t('Открыто {count} из 11 этапов', {count: unlockedCount})}>
            <span style={{ width: `${(unlockedCount / 11) * 100}%` }} />
          </div>
          <small className="path-overview-note">{t('Открыто этапов: {count} из 11', {count: unlockedCount})}</small>
        </div>

        <article className={`path-stage-card is-unlocked is-current${pathState.passedStages.includes(activeStage.id) ? ' is-passed' : ''}`}>
          <div className="path-stage-top">
            <span className="path-stage-number">{pathState.passedStages.includes(activeStage.id) ? <Check size={17} /> : String(activeStage.id).padStart(2, '0')}</span>
            <div className="path-stage-title">
              <span>{t(pathState.passedStages.includes(activeStage.id) ? 'ЭТАП ЗАВЕРШЁН' : 'ТВОЙ ТЕКУЩИЙ ЭТАП')}</span>
              <h3>{t('Этап {id}', {id: activeStage.id})}</h3>
            </div>
            <span className="path-stage-count">{activeStage.names.filter(name => progress.includes(name.id)).length}/9</span>
          </div>
          <div className="path-stage-progress"><span style={{ width: `${(activeStage.names.filter(name => progress.includes(name.id)).length / 9) * 100}%` }} /></div>
          <div className="path-lessons">
            {activeStage.lessons.map((lesson, lessonIndex) => {
              const done = lesson.length === LESSON_SIZE && lesson.every(name => progress.includes(name.id));
              const previousDone = lessonIndex === 0 || activeStage.lessons[lessonIndex - 1].every(name => progress.includes(name.id));
              const available = previousDone && lesson.length > 0;
              const nextName = lesson.find(name => !progress.includes(name.id)) ?? lesson[0];
              return (
                <button type="button" key={lessonIndex} className={`path-lesson${done ? ' is-done' : ''}`} disabled={!available || !nextName} onClick={() => nextName && onOpenName(nextName)} aria-label={t('Урок {id}, {status}', {id: lessonIndex + 1, status: done ? 'пройден' : available ? 'открыть' : 'закрыт'})}>
                  <span className="path-lesson-icon">{done ? <Check size={15} /> : available ? <BookOpen size={15} /> : <LockKeyhole size={14} />}</span>
                  <span><b>{t('Урок {id}', {id: lessonIndex + 1})}</b><small>{done ? t('Завершён · 3 имени') : available ? t('{count}/3 изучено', {count: lesson.filter(name => progress.includes(name.id)).length}) : t('Сначала заверши предыдущий')}</small></span>
                  {available && !done && <ChevronRight size={16} />}
                </button>
              );
            })}
          </div>
          <div className="path-stage-footer">
            {pathState.passedStages.includes(activeStage.id) ? (
              <span className="path-passed-label"><Check size={15} /> {t('Экзамен пройден · лучший результат {score}/10', {score: pathState.bestScores[activeStage.id] ?? PASS_SCORE})}</span>
            ) : (
              <button type="button" className="path-exam-button" disabled={!activeStage.names.every(name => progress.includes(name.id))} onClick={() => startExam(activeStage.id)}>
                <Trophy size={16} /> {activeStage.names.every(name => progress.includes(name.id)) ? t('Начать итоговый экзамен') : t('До экзамена: изучи ещё {count}', {count: STAGE_SIZE - activeStage.names.filter(name => progress.includes(name.id)).length})}
              </button>
            )}
          </div>
        </article>
      </section>

      {examStage !== null && (
        <div className="path-exam-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeExam(); }}>
          <section ref={examDialogRef} className="path-exam-modal" role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby="path-exam-title">
            <button className="path-exam-close" type="button" onClick={closeExam} aria-label={t('Закрыть экзамен')}><X size={19} /></button>
            {result === null ? (
              <>
                <span className="muted-label">{t('ИТОГОВАЯ ПРОВЕРКА · ЭТАП {id}', {id: examStage})}</span>
                <h2 id="path-exam-title">{t('Проверь, что запомнил')}</h2>
                <p className="path-exam-intro">{t('10 вопросов по изученным именам. Для открытия следующего этапа нужно ответить правильно минимум на 8.')}</p>
                <div className="path-exam-progress"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
                <div className="path-exam-meta"><span>{t('ВОПРОС {current} ИЗ 10', {current: questionIndex + 1})}</span><span>{t('{count} правильных', {count: score})}</span></div>
                {currentQuestion && (
                  <>
                    <div className="path-exam-arabic" lang="ar" dir="rtl">{names.find(name => name.id === currentQuestion.nameId)?.arabic}</div>
                    <h3 className="path-exam-question">{t('Какое значение соответствует этому имени?')}</h3>
                    <div className="path-exam-options">
                      {currentQuestion.options.map(option => (
                        <button
                          type="button"
                          key={option.id}
                          disabled={checked}
                          className={checked && option.id === currentQuestion.nameId ? 'is-correct' : checked && option.id === answer ? 'is-wrong' : answer === option.id ? 'is-selected' : ''}
                          onClick={() => setAnswer(option.id)}
                        >
                          <span dir="auto" lang="ru">{option.translation}</span>
                          {checked && option.id === currentQuestion.nameId && <Check size={17} />}
                        </button>
                      ))}
                    </div>
                    {checked && (
                      <p dir="auto" className={answer === currentQuestion.nameId ? 'path-exam-feedback is-correct' : 'path-exam-feedback is-wrong'}>
                        {answer === currentQuestion.nameId ? t('Верно! Продолжай.') : t('Правильный ответ: {answer}.', {answer: currentCorrect?.translation ?? 'см. карточку имени'})}
                      </p>
                    )}
                    <button className="path-exam-submit" type="button" disabled={answer === null} onClick={checked ? nextQuestion : submitAnswer}>
                      {checked ? (questionIndex === 9 ? t('Завершить экзамен') : t('Следующий вопрос')) : t('Проверить ответ')}
                      <ChevronRight size={17} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="path-exam-result">
                <div className="path-result-icon">{result >= PASS_SCORE ? <Trophy size={30} /> : <RotateCcw size={28} />}</div>
                <span className="muted-label">{t('РЕЗУЛЬТАТ ЭКЗАМЕНА')}</span>
                <h2 id="path-exam-title">{result >= PASS_SCORE ? t('Этап пройден!') : t('Попробуй ещё раз')}</h2>
                <strong>{t('{score} из 10', {score: result})}</strong>
                <p>{result >= PASS_SCORE ? (examStage === 11 ? t('Ты завершил все 11 этапов обучения.') : t('Отличная работа. Следующий этап теперь открыт.')) : t('Для открытия следующего этапа нужно набрать не менее 8 правильных ответов. Прогресс уроков сохранён.')}</p>
                {result >= PASS_SCORE && <div className="path-unlocked-message"><Award size={18} /> {examStage === 11 ? t('Все этапы завершены · +20 XP') : t('Следующий этап открыт · +20 XP')}</div>}
                <button className="path-exam-submit" type="button" onClick={result >= PASS_SCORE ? closeExam : () => startExam(examStage!)}>
                  {result >= PASS_SCORE ? t('Продолжить обучение') : t('Пересдать экзамен')} <ChevronRight size={17} />
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
