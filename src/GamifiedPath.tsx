import { useEffect, useMemo, useRef, useState } from 'react';
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

type PathState = {
  passedStages: number[];
  bestScores: Record<number, number>;
};

const STORAGE_KEY = '99-names-learning-path-v1';
const STAGE_SIZE = 9;
const LESSON_SIZE = 3;
const PASS_SCORE = 8;

function readPathState(): PathState {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<PathState>;
    return {
      passedStages: Array.isArray(raw.passedStages)
        ? [...new Set(raw.passedStages.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 11))]
        : [],
      bestScores: raw.bestScores && typeof raw.bestScores === 'object'
        ? Object.fromEntries(Object.entries(raw.bestScores).filter(([id, score]) => Number(id) >= 1 && Number(id) <= 11 && typeof score === 'number' && score >= 0 && score <= 10))
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

export function GamifiedPath({ names, progress, onOpenName, onUnlockedNameLimit }: {
  names: LearningName[];
  progress: number[];
  onOpenName: (name: LearningName) => void;
  onUnlockedNameLimit: (limit: number) => void;
}) {
  const [pathState, setPathState] = useState<PathState>(readPathState);
  const [examStage, setExamStage] = useState<number | null>(null);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const examDialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pathState)); } catch { /* Local progress remains usable for this session. */ }
  }, [pathState]);

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
      <section className="learning-path reveal" id="learning-path" aria-labelledby="learning-path-title">
        <div className="learning-path-heading">
          <div>
            <span className="muted-label">ОБУЧЕНИЕ ПО ЭТАПАМ</span>
            <h2 id="learning-path-title">Твой путь изучения</h2>
            <p>Двигайся постепенно: три коротких урока, затем проверка знаний.</p>
          </div>
          <div className="path-xp" aria-label={`Набрано ${xp} игровых очков опыта`}>
            <Sparkles size={17} />
            <b>{xp} XP</b>
            <small>опыт</small>
          </div>
        </div>

        <div className="path-overview">
          <div className="path-overview-main">
            <span>ТЕКУЩИЙ ЭТАП</span>
            <b>{activeStage.id} <small>/ 11</small></b>
            <p>{activeStage.names.filter(name => progress.includes(name.id)).length} из 9 имён изучено</p>
          </div>
          <div className="path-overview-track" aria-label={`Открыто ${unlockedCount} из 11 этапов`}>
            <span style={{ width: `${(unlockedCount / 11) * 100}%` }} />
          </div>
          <small className="path-overview-note">Открыто этапов: {unlockedCount} из 11</small>
        </div>

        <div className="path-stage-list">
          {stages.map(stage => {
            const unlocked = stage.id === 1 || pathState.passedStages.includes(stage.id - 1);
            const passed = pathState.passedStages.includes(stage.id);
            const learnedCount = stage.names.filter(name => progress.includes(name.id)).length;
            const allLearned = stage.names.length === STAGE_SIZE && learnedCount === STAGE_SIZE;
            const isCurrent = stage.id === unlockedCount;
            return (
              <article className={`path-stage-card${unlocked ? ' is-unlocked' : ' is-locked'}${passed ? ' is-passed' : ''}${isCurrent ? ' is-current' : ''}`} key={stage.id}>
                <div className="path-stage-top">
                  <span className="path-stage-number">{passed ? <Check size={17} /> : unlocked ? String(stage.id).padStart(2, '0') : <LockKeyhole size={16} />}</span>
                  <div className="path-stage-title">
                    <span>{passed ? 'ЭТАП ЗАВЕРШЁН' : unlocked ? (isCurrent ? 'ТВОЙ ТЕКУЩИЙ ЭТАП' : 'ЭТАП ДОСТУПЕН') : 'ПОКА ЗАКРЫТ'}</span>
                    <h3>Этап {stage.id}</h3>
                  </div>
                  <span className="path-stage-count">{learnedCount}/9</span>
                </div>
                <div className="path-stage-progress"><span style={{ width: `${(learnedCount / 9) * 100}%` }} /></div>
                {unlocked ? (
                  <>
                    <div className="path-lessons">
                      {stage.lessons.map((lesson, lessonIndex) => {
                        const done = lesson.length === LESSON_SIZE && lesson.every(name => progress.includes(name.id));
                        const previousDone = lessonIndex === 0 || stage.lessons[lessonIndex - 1].every(name => progress.includes(name.id));
                        const available = previousDone && lesson.length > 0;
                        const nextName = lesson.find(name => !progress.includes(name.id)) ?? lesson[0];
                        return (
                          <button
                            type="button"
                            key={lessonIndex}
                            className={`path-lesson${done ? ' is-done' : ''}`}
                            disabled={!available || !nextName}
                            onClick={() => nextName && onOpenName(nextName)}
                            aria-label={`Урок ${lessonIndex + 1}, ${done ? 'пройден' : available ? 'открыть' : 'закрыт'}`}
                          >
                            <span className="path-lesson-icon">{done ? <Check size={15} /> : available ? <BookOpen size={15} /> : <LockKeyhole size={14} />}</span>
                            <span><b>Урок {lessonIndex + 1}</b><small>{done ? 'Завершён · 3 имени' : available ? `${lesson.filter(name => progress.includes(name.id)).length}/3 изучено` : 'Сначала заверши предыдущий'}</small></span>
                            {available && !done && <ChevronRight size={16} />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="path-stage-footer">
                      {passed ? (
                        <span className="path-passed-label"><Check size={15} /> Экзамен пройден · лучший результат {pathState.bestScores[stage.id] ?? PASS_SCORE}/10</span>
                      ) : (
                        <button type="button" className="path-exam-button" disabled={!allLearned} onClick={() => startExam(stage.id)}>
                          <Trophy size={16} /> {allLearned ? 'Начать итоговый экзамен' : `До экзамена: изучи ещё ${STAGE_SIZE - learnedCount}`}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="path-locked-note"><LockKeyhole size={14} /> Пройди экзамен предыдущего этапа, чтобы открыть этот раздел.</p>
                )}
              </article>
            );
          })}
        </div>
        <p className="path-footnote">Этапы — только удобная структура обучения. Они не обозначают степень достоинства имён или духовный ранг человека. Прогресс этой версии игрового пути пока сохраняется на устройстве.</p>
      </section>

      {examStage !== null && (
        <div className="path-exam-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeExam(); }}>
          <section ref={examDialogRef} className="path-exam-modal" role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby="path-exam-title">
            <button className="path-exam-close" type="button" onClick={closeExam} aria-label="Закрыть экзамен"><X size={19} /></button>
            {result === null ? (
              <>
                <span className="muted-label">ИТОГОВАЯ ПРОВЕРКА · ЭТАП {examStage}</span>
                <h2 id="path-exam-title">Проверь, что запомнил</h2>
                <p className="path-exam-intro">10 вопросов по изученным именам. Для открытия следующего этапа нужно ответить правильно минимум на 8.</p>
                <div className="path-exam-progress"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
                <div className="path-exam-meta"><span>ВОПРОС {questionIndex + 1} ИЗ 10</span><span>{score} правильных</span></div>
                {currentQuestion && (
                  <>
                    <div className="path-exam-arabic" lang="ar" dir="rtl">{names.find(name => name.id === currentQuestion.nameId)?.arabic}</div>
                    <h3 className="path-exam-question">Какое значение соответствует этому имени?</h3>
                    <div className="path-exam-options">
                      {currentQuestion.options.map(option => (
                        <button
                          type="button"
                          key={option.id}
                          disabled={checked}
                          className={checked && option.id === currentQuestion.nameId ? 'is-correct' : checked && option.id === answer ? 'is-wrong' : answer === option.id ? 'is-selected' : ''}
                          onClick={() => setAnswer(option.id)}
                        >
                          <span>{option.translation}</span>
                          {checked && option.id === currentQuestion.nameId && <Check size={17} />}
                        </button>
                      ))}
                    </div>
                    {checked && (
                      <p className={answer === currentQuestion.nameId ? 'path-exam-feedback is-correct' : 'path-exam-feedback is-wrong'}>
                        {answer === currentQuestion.nameId ? 'Верно! Продолжай.' : `Правильный ответ: ${currentCorrect?.translation ?? 'см. карточку имени'}.`}
                      </p>
                    )}
                    <button className="path-exam-submit" type="button" disabled={answer === null} onClick={checked ? nextQuestion : submitAnswer}>
                      {checked ? (questionIndex === 9 ? 'Завершить экзамен' : 'Следующий вопрос') : 'Проверить ответ'}
                      <ChevronRight size={17} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="path-exam-result">
                <div className="path-result-icon">{result >= PASS_SCORE ? <Trophy size={30} /> : <RotateCcw size={28} />}</div>
                <span className="muted-label">РЕЗУЛЬТАТ ЭКЗАМЕНА</span>
                <h2 id="path-exam-title">{result >= PASS_SCORE ? 'Этап пройден!' : 'Попробуй ещё раз'}</h2>
                <strong>{result} из 10</strong>
                <p>{result >= PASS_SCORE ? 'Отличная работа. Следующий этап теперь открыт.' : 'Для открытия следующего этапа нужно набрать не менее 8 правильных ответов. Прогресс уроков сохранён.'}</p>
                {result >= PASS_SCORE && <div className="path-unlocked-message"><Award size={18} /> Следующий этап открыт · +20 XP</div>}
                <button className="path-exam-submit" type="button" onClick={result >= PASS_SCORE ? closeExam : () => startExam(examStage!)}>
                  {result >= PASS_SCORE ? 'Продолжить обучение' : 'Пересдать экзамен'} <ChevronRight size={17} />
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
