import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, LockKeyhole, LogOut, Mail, Share2, Sparkles, X, UserRound, Bookmark } from 'lucide-react';
import { supabase } from './lib/supabase';

type NameItem = {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  explanation: string;
  source_references?: unknown[];
};

const previewNames: NameItem[] = [
  { id: 1, arabic: 'الرَّحْمَٰنُ', transliteration: 'Ar-Raḥmān', translation: 'Всемилостивый', explanation: 'Имя указывает на всеобъемлющую милость Аллаха. Милость Аллаха охватывает всё творение.' },
  { id: 2, arabic: 'الرَّحِيمُ', transliteration: 'Ar-Raḥīm', translation: 'Милующий', explanation: 'Имя указывает на милость Аллаха к Его рабам. Смысл имени раскрывается в контексте Корана и Сунны.' },
  { id: 3, arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', translation: 'Владыка', explanation: 'Аллах — истинный Владыка, Ему принадлежит совершенная власть над всем сущим.' },
];

const BOOK_URL = 'https://iamaldamov.github.io/ochishchenie-nafsa/';
const SITE_URL = 'https://iamaldamov.github.io/99-names-of-allah/';

export default function App() {
  const [names, setNames] = useState<NameItem[]>(previewNames);
  const [publishedCount, setPublishedCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<number[]>([]);
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

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.from('names').select('id,arabic,transliteration,translation,explanation,source_references').eq('content_status', 'published').order('id')
      .then(({ data, error: fetchError }) => {
        if (!alive) return;
        if (!fetchError && data && data.length) {
          setNames(data as NameItem[]);
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

  useEffect(() => {
    if (!supabase || !user) { setProgress([]); return; }
    let alive = true;
    supabase.from('user_progress').select('name_id,status').eq('user_id', user.id)
      .then(({ data }) => { if (alive && data) setProgress(data.filter((item: any) => item.status === 'learned').map((item: any) => item.name_id)); });
    return () => { alive = false; };
  }, [user]);

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
    if (!selected) return;
    if (!user) { setSelected(null); setAccountMode('signup'); setAccountOpen(true); setMessage('Создай бесплатный аккаунт, чтобы сохранять изученные имена и свой прогресс.'); return; }
    if (!supabase) return;
    setBusy(true); setError('');
    const { error: saveError } = await supabase.from('user_progress').upsert({
      user_id: user.id, name_id: selected.id, status: 'learned', confidence: 3,
      times_seen: 1, times_correct: 0, last_reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,name_id' });
    setBusy(false);
    if (saveError) { setError('Не удалось сохранить прогресс. Проверьте настройки базы данных.'); return; }
    setProgress(old => old.includes(selected.id) ? old : [...old, selected.id]);
    setSelected(null);
    setNotice('Имя отмечено как изученное. Продолжай в своём темпе.');
  };

  const signOut = async () => { if (supabase) await supabase.auth.signOut(); setProgress([]); setMessage('Ты вышел из аккаунта.'); };
  const percent = Math.round((progress.length / 99) * 100);
  const displayedNames = useMemo(() => names, [names]);

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
        <div className="progress-foot"><span><Check size={14}/> {progress.length} изучено</span><span>{user ? 'Прогресс сохраняется в аккаунте' : 'Войди, чтобы сохранять прогресс'}</span></div>
      </section>

      <section className="learning-section reveal">
        <div className="section-heading"><div><span className="muted-label">ПЕРВЫЕ ШАГИ</span><h2>Изучай имена по порядку</h2></div><span className="section-total">{publishedCount || 3} опубликовано <ChevronRight size={15}/></span></div>
        <div className="name-list">
          {displayedNames.map(name => <button className="name-row" key={name.id} onClick={() => setSelected(name)}>
            <span className="name-number">{String(name.id).padStart(2,'0')}</span><span className="name-arabic" lang="ar" dir="rtl">{name.arabic}</span>
            <span className="name-info"><b>{name.translation}</b><small>{name.transliteration}</small></span>
            {progress.includes(name.id) ? <Check className="row-arrow learned-check" size={18}/> : <ChevronRight className="row-arrow" size={18}/>}
          </button>)}
          {publishedCount < 99 && <button className="locked-row locked-row-button" onClick={() => setShowAllInfo(true)}>
            <span className="lock-circle"><LockKeyhole size={16}/></span><span><b>Следующие имена</b><small>Новые уроки будут добавляться после проверки источников</small></span><span className="locked-count">ещё {99 - (publishedCount || 3)}</span>
          </button>}
        </div>
        {!supabase && <p className="setup-warning">Сервис аккаунтов пока не подключён к опубликованной версии сайта.</p>}
      </section>

      <section className="share-section reveal">
        <div className="share-ornament" aria-hidden="true">ٱلْهَادِي</div><span className="muted-label">ПОДЕЛИСЬ ПОЛЕЗНЫМ</span>
        <h2>Сохрани этот сайт<br/><em>и поделись с близкими.</em></h2>
        <p>Возможно, благодаря твоей рекомендации ещё один человек узнает прекрасные имена Аллаха. Надеемся на награду от Аллаха за распространение полезного знания.</p>
        <div className="share-actions"><button className="primary-button" onClick={shareSite}><Share2 size={16}/> Поделиться сайтом</button><button className="save-button" onClick={() => setSaveOpen(true)}><Bookmark size={16}/> Сохранить</button></div>
        {notice && <p className="share-notice" role="status">{notice}</p>}
      </section>

      <section className="creator-section reveal"><div className="creator-mark">ر</div><div className="creator-content"><span className="muted-label">О СОЗДАТЕЛЕ</span><h2>Ассаляму алейкум!</h2><p>Меня зовут <b>Рамазан Сайгидович</b>. Я создал этот бесплатный сайт, чтобы каждый желающий мог изучать 99 прекрасных имён Аллаха — спокойно, красиво и в удобное время.</p><p>Пусть этот проект станет причиной пользы для нас и для тех, с кем мы им поделимся.</p><span className="creator-signature">С уважением, Рамазан</span></div></section>

      <section className="book-section reveal"><div className="book-icon"><BookOpen size={22}/></div><div className="book-copy"><span className="muted-label">ЕЩЁ ОДИН МОЙ ПРОЕКТ</span><h2>Книга «Очищение нафса»</h2><p>Также я работаю над книгой о воспитании души и очищении сердца. Познакомься с ней на отдельном сайте.</p><a className="book-link" href={BOOK_URL} target="_blank" rel="noreferrer">Перейти к книге <ArrowRight size={15}/></a></div></section>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="lesson-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={() => setSelected(null)}>Закрыть</button><span className="muted-label">ИМЯ {String(selected.id).padStart(2,'0')} ИЗ 99</span>
        <div className="lesson-arabic" lang="ar" dir="rtl">{selected.arabic}</div><h2>{selected.translation}</h2><p className="lesson-translit">{selected.transliteration}</p>
        <p className="lesson-description">{selected.explanation}</p>
        <div className="source-note"><CircleHelp size={15}/> Изучай значение имени вдумчиво. Ссылки на проверенные источники будут указаны в полном уроке.</div>
        {progress.includes(selected.id) ? <p className="already-learned"><Check size={16}/> Это имя уже отмечено как изученное</p> : <button className="primary-button full" disabled={busy} onClick={markLearned}>{user ? 'Отметить как изученное' : 'Создать аккаунт и сохранить прогресс'} <ArrowRight size={17}/></button>}
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

      <footer><span>asma ul husna</span><span>Учись с намерением и постоянством</span></footer>
    </main>
  );
}
