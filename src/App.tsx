import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, LockKeyhole, LogOut, Mail, Share2, Sparkles, X, UserRound, Bookmark } from 'lucide-react';
import { supabase } from './lib/supabase';
import { names as completeNames, studyPrinciples, coreReferences } from './data/names';

type NameItem = (typeof completeNames)[number];
const previewNames: NameItem[] = completeNames;

const BOOK_URL = 'https://iamaldamov.github.io/ochishchenie-nafsa/';
const SITE_URL = 'https://iamaldamov.github.io/99-names-of-allah/';

export default function App() {
  const [names, setNames] = useState<NameItem[]>(previewNames);
  const [publishedCount, setPublishedCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem('asma-ul-husna-progress') || '[]') as number[]; } catch { return []; } });
  const [progressReady, setProgressReady] = useState(false);
  const [selected, setSelected] = useState<NameItem | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'login' | 'signup' | 'reset'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'learned' | 'review'>('all');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [visibleNamesCount, setVisibleNamesCount] = useState(12);

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
  useEffect(() => {
    if (!supabase || !user) { setProgressReady(true); return; }
    let alive = true;
    supabase.from('user_progress').select('name_id,status').eq('user_id', user.id).then(({ data }) => {
      if (!alive) return;
      if (data) setProgress(current => Array.from(new Set([...current, ...data.filter((x: any) => x.status === 'learned').map((x: any) => Number(x.name_id))])));
      setProgressReady(true);
    });
    return () => { alive = false; };
  }, [user]);
  useEffect(() => {
    if (!supabase || !user || !progressReady || !progress.length) return;
    const rows = progress.map(name_id => ({ user_id: user.id, name_id, status: 'learned', confidence: 3, times_seen: 1, times_correct: 0, last_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
    void supabase.from('user_progress').upsert(rows, { onConflict: 'user_id,name_id' });
  }, [user, progressReady, progress]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('.reveal');
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

  const markLearned = async () => {
    if (!selected || busy) return;
    const nameId = selected.id;
    setBusy(true); setError('');
    setProgress(old => old.includes(nameId) ? old : [...old, nameId]);
    setSelected(null);
    setNotice('Имя отмечено как изученное и сохранено на этом устройстве.');
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
  const displayedNames = useMemo(() => names.filter(name => {
    const searchable = (name.id + ' ' + name.arabic + ' ' + name.transliteration + ' ' + name.translation).toLocaleLowerCase();
    const matches = searchable.includes(search.toLocaleLowerCase());
    const tabMatches = activeTab === 'all' || (activeTab === 'review' ? progress.includes(name.id) : true);
    return matches && tabMatches;
  }), [names, search, activeTab, progress]);
  const visibleNames = displayedNames.slice(0, visibleNamesCount);
  const quizItem = names[(quizIndex * 7 + 2) % names.length] ?? names[0];
  const quizOptions = useMemo(() => quizItem ? [quizItem, ...names.filter(n => n.id !== quizItem.id).slice((quizIndex * 11) % Math.max(1, names.length - 4), (quizIndex * 11) % Math.max(1, names.length - 4) + 3)].sort((a,b) => ((a.id * 13 + quizIndex) % 17) - ((b.id * 13 + quizIndex) % 17)) : [], [quizItem, names, quizIndex]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Asma Ul Husna — главная"><span className="brand-mark">أ</span><span>asma <b>ul husna</b></span></a>
        {user ? <div className="signed-in"><span className="user-email">{user.email}</span><button className="login-button" onClick={signOut}><LogOut size={15}/> Выйти</button></div> :
          <button className="login-button" onClick={() => { setAccountMode('login'); setAccountOpen(true); setError(''); setMessage(''); }}><LockKeyhole size={15}/> Войти</button>}
      </header>

      <section className="hero" id="home">
        <div className="eyebrow"><Sparkles size={14}/> ПУТЬ ПОЗНАНИЯ</div>
        <h1>Познакомься с именами<br/><em>Того, Кто создал тебя.</em></h1>
        <p className="hero-copy">Изучай 99 прекрасных имён Аллаха постепенно, осмысленно и с повторением — в собственном темпе. Обучение бесплатное.</p>
        <button className="primary-button" onClick={() => displayedNames[0] && setSelected(displayedNames[0])}>Начать обучение <ArrowRight size={17}/></button>
        <div className="hero-art" aria-hidden="true"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><span>اللَّهُ</span></div>
        <div className="hero-caption">ٱلرَّحْمَٰنُ · ٱلرَّحِيمُ · ٱلْمَلِكُ</div>
      </section>

      <section className="progress-card reveal">
        <div className="progress-heading"><div><span className="muted-label">ТВОЙ ПУТЬ</span><h2>{user ? 'Твой прогресс обучения' : '99 имён. Одно путешествие.'}</h2></div><span className="progress-count">{progress.length} <small>/ 99</small></span></div>
        <div className="progress-track"><span style={{ width: percent + '%' }}/></div>
        <div className="progress-foot"><span><Check size={14}/> {progress.length} изучено</span><span>Прогресс сохраняется на этом устройстве</span></div>
      </section>

      <section className="learning-section reveal" id="learning">
        <div className="section-heading"><div><span className="muted-label">ПЕРВЫЕ ШАГИ</span><h2>Изучай имена по порядку</h2></div><span className="section-total">{names.length} имён <ChevronRight size={15}/></span></div>
        <div className="name-list">
          <div className="course-tools"><input className="name-search" aria-label="Поиск имени" value={search} onChange={e => {setSearch(e.target.value);setVisibleNamesCount(12);}} placeholder="Найти имя, перевод или транскрипцию…"/><div className="filter-tabs"><button className={activeTab === 'all' ? 'active' : ''} onClick={() => {setActiveTab('all');setVisibleNamesCount(12);}}>Все 99</button><button className={activeTab === 'review' ? 'active' : ''} onClick={() => {setActiveTab('review');setVisibleNamesCount(12);}}>Повторить</button></div></div>
          {visibleNames.map(name => <button className="name-row" key={name.id} onClick={() => setSelected(name)}>
            <span className="name-number">{String(name.id).padStart(2,'0')}</span><span className="name-arabic" lang="ar" dir="rtl">{name.arabic}</span>
            <span className="name-info"><b>{name.translation}</b><small>{name.transliteration}</small></span>
            {progress.includes(name.id) ? <Check className="row-arrow learned-check" size={18}/> : <ChevronRight className="row-arrow" size={18}/>}
          </button>)}
          {displayedNames.length === 0 && <p className="empty-results">Ничего не найдено. Попробуй изменить запрос или фильтр.</p>}
          {displayedNames.length > visibleNames.length && <button className="show-more-names" onClick={() => setVisibleNamesCount(count => count + 12)}>Показать ещё имена ({displayedNames.length - visibleNames.length})</button>}
          {false && publishedCount < 99 && <button className="locked-row locked-row-button" onClick={() => setShowAllInfo(true)}>
            <span className="lock-circle"><LockKeyhole size={16}/></span><span><b>Следующие имена</b><small>Новые уроки будут добавляться после проверки источников</small></span><span className="locked-count">ещё {99 - (publishedCount || 3)}</span>
          </button>}
        </div>
        {!supabase && <p className="setup-warning">Сервис аккаунтов пока не подключён к опубликованной версии сайта.</p>}
      </section>

      <details className="compact-details reveal"><summary><span><b>Проверить знания</b><small>Короткий тест по именам</small></span><ChevronRight size={18}/></summary><section className="practice-section" id="practice">
        <div className="section-heading"><div><span className="muted-label">ЗАКРЕПЛЕНИЕ ЗНАНИЙ</span><h2>Проверь, что запомнил</h2></div><span className="section-total">Мини-тест</span></div>
        {quizItem && <div className="quiz-card">
          <span className="muted-label">КАК ПЕРЕВОДИТСЯ ИМЯ?</span><div className="quiz-arabic" lang="ar" dir="rtl">{quizItem.arabic}</div><p className="quiz-translit">{quizItem.transliteration}</p>
          <div className="quiz-options">{quizOptions.map(option => <button key={option.id} className={quizAnswer === option.id ? (option.id === quizItem.id ? 'correct' : 'incorrect') : ''} onClick={() => setQuizAnswer(option.id)}>{option.translation}</button>)}</div>
          {quizAnswer !== null && <p className={quizAnswer === quizItem.id ? 'quiz-feedback good' : 'quiz-feedback'}>{quizAnswer === quizItem.id ? 'Верно! Повтори смысл имени своими словами.' : 'Не совсем. Правильный ответ: ' + quizItem.translation}</p>}
          <button className="quiz-next" onClick={() => {setQuizIndex(i => i + 1);setQuizAnswer(null);}}>Следующий вопрос <ArrowRight size={15}/></button>
        </div>}
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
      <footer><span>asma ul husna · Учись с намерением и постоянством</span><div className="footer-actions"><button onClick={shareSite}><Share2 size={14}/> Поделиться</button><button onClick={() => setSaveOpen(true)}><Bookmark size={14}/> Сохранить</button></div></footer>
      <a className="floating-support" href="https://web.tribute.tg/d/T75" target="_blank" rel="noreferrer"><span>♥</span> Поддержать проект</a>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="lesson-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={() => setSelected(null)}>Закрыть</button><span className="muted-label">ИМЯ {String(selected.id).padStart(2,'0')} ИЗ 99</span>
        <div className="lesson-arabic" lang="ar" dir="rtl">{selected.arabic}</div><h2>{selected.translation}</h2><p className="lesson-translit">{selected.transliteration}</p>
        <p className="lesson-description">{selected.explanation}</p>
        {selected.verse && <p className="lesson-verse">Связанный источник: {selected.verse}</p>}
        <div className="lesson-reflection"><b>Подумай:</b> Как это имя помогает тебе лучше понять, к Кому ты обращаешься в дуа?</div>
        <div className="source-note"><CircleHelp size={15}/> Изучай значение имени вдумчиво. Сверяй смысл с указанными источниками.</div>
        <p className="lesson-progress-line">Изучено тобой: <b>{progress.length} из 99</b></p>
        {error && <p className="form-error" role="alert">{error}</p>}
        {progress.includes(selected.id) ? <p className="already-learned"><Check size={16}/> Это имя уже отмечено как изученное</p> : <button className="primary-button full" disabled={busy} onClick={markLearned}>{busy ? 'Сохраняем…' : 'Отметить как изученное'} <ArrowRight size={17}/></button>}
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
