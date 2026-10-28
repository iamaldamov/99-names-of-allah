import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronRight, CircleHelp, LockKeyhole, Share2, Bookmark, BookOpen, Sparkles, X } from 'lucide-react';

const previewNames = [
  { n: '01', arabic: 'الرَّحْمَٰنُ', transliteration: 'Ar-Raḥmān', meaning: 'Всемилостивый', description: 'Тот, Чья милость всеобъемлюща и охватывает творения.' },
  { n: '02', arabic: 'الرَّحِيمُ', transliteration: 'Ar-Raḥīm', meaning: 'Милующий', description: 'Тот, Кто проявляет особую милость к Своим верующим рабам.' },
  { n: '03', arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', meaning: 'Владыка', description: 'Истинный Владыка, Кому принадлежит совершенная власть над всем сущим.' },
];

const BOOK_URL = 'https://iamaldamov.github.io/ochishchenie-nafsa/';
const SITE_URL = 'https://iamaldamov.github.io/99-names-of-allah/';

export default function App() {
  const [active, setActive] = useState(0);
  const [showLesson, setShowLesson] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showSaveInfo, setShowSaveInfo] = useState(false);
  const [notice, setNotice] = useState('');
  const current = previewNames[active];

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const shareSite = async () => {
    const shareData = { title: '99 прекрасных имён Аллаха', text: 'Бесплатный сайт для изучения 99 прекрасных имён Аллаха. Возможно, будет полезен и тебе.', url: SITE_URL };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setNotice('Спасибо, что делишься полезным знанием.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SITE_URL);
        setNotice('Ссылка скопирована. Отправь её близким.');
      } else {
        setNotice('Скопируй адрес сайта из строки браузера и отправь его близким.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setNotice('Скопируй адрес сайта из строки браузера и отправь его близким.');
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Asma Ul Husna — главная">
          <span className="brand-mark">أ</span><span>asma <b>ul husna</b></span>
        </a>
        <button className="login-button" onClick={() => setShowAccountInfo(true)}>
          <LockKeyhole size={15} /> Войти
        </button>
      </header>

      <section className="hero" id="home">
        <div className="eyebrow"><Sparkles size={14} /> ПУТЬ ПОЗНАНИЯ</div>
        <h1>Познакомься с именами<br/><em>Того, Кто создал тебя.</em></h1>
        <p className="hero-copy">Изучай 99 прекрасных имён Аллаха постепенно, осмысленно и с повторением — в собственном темпе.</p>
        <button className="primary-button" onClick={() => setShowLesson(true)}>Начать обучение <ArrowRight size={17}/></button>
        <div className="hero-art" aria-hidden="true"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><span>اللَّهُ</span></div>
        <div className="hero-caption">ٱلرَّحْمَٰنُ · ٱلرَّحِيمُ · ٱلْمَلِكُ</div>
      </section>

      <section className="progress-card reveal">
        <div className="progress-heading"><div><span className="muted-label">ТВОЙ ПУТЬ</span><h2>99 имён. Одно путешествие.</h2></div><span className="progress-count">0 <small>/ 99</small></span></div>
        <div className="progress-track"><span/></div>
        <div className="progress-foot"><span><Check size={14}/> 0 изучено</span><span>Начни с первого имени</span></div>
      </section>

      <section className="learning-section reveal">
        <div className="section-heading"><div><span className="muted-label">ПЕРВЫЕ ШАГИ</span><h2>Начни знакомство</h2></div><span className="section-total">99 имён <ChevronRight size={15}/></span></div>
        <div className="name-list">
          {previewNames.map((name, index) => (
            <button className={`name-row ${active === index ? 'selected' : ''}`} key={name.n} onClick={() => { setActive(index); setShowLesson(true); }}>
              <span className="name-number">{name.n}</span><span className="name-arabic" lang="ar" dir="rtl">{name.arabic}</span>
              <span className="name-info"><b>{name.meaning}</b><small>{name.transliteration}</small></span><ChevronRight className="row-arrow" size={18}/>
            </button>
          ))}
          <div className="locked-row"><span className="lock-circle"><LockKeyhole size={16}/></span><span><b>Следующие имена</b><small>Полная программа обучения ещё готовится</small></span><span className="locked-count">+96</span></div>
        </div>
      </section>

      <section className="share-section reveal">
        <div className="share-ornament" aria-hidden="true">ٱلْهَادِي</div>
        <span className="muted-label">ПОДЕЛИСЬ ПОЛЕЗНЫМ</span>
        <h2>Сохрани этот сайт<br/><em>и поделись с близкими.</em></h2>
        <p>Возможно, благодаря твоей рекомендации ещё один человек узнает прекрасные имена Аллаха. Надеемся на награду от Аллаха за распространение полезного знания.</p>
        <div className="share-actions">
          <button className="primary-button" onClick={shareSite}><Share2 size={16}/> Поделиться сайтом</button>
          <button className="save-button" onClick={() => setShowSaveInfo(true)}><Bookmark size={16}/> Сохранить</button>
        </div>
        {notice && <p className="share-notice" role="status">{notice}</p>}
      </section>

      <section className="creator-section reveal">
        <div className="creator-mark">ر</div>
        <div className="creator-content">
          <span className="muted-label">О СОЗДАТЕЛЕ</span>
          <h2>Ассаляму алейкум!</h2>
          <p>Меня зовут <b>Рамазан Сайгидович</b>. Я создал этот бесплатный сайт, чтобы каждый желающий мог изучать 99 прекрасных имён Аллаха — спокойно, красиво и в удобное время.</p>
          <p>Пусть этот проект станет причиной пользы для нас и для тех, с кем мы им поделимся.</p>
          <span className="creator-signature">С уважением, Рамазан</span>
        </div>
      </section>

      <section className="book-section reveal">
        <div className="book-icon"><BookOpen size={22}/></div>
        <div className="book-copy">
          <span className="muted-label">ЕЩЁ ОДИН МОЙ ПРОЕКТ</span>
          <h2>Книга «Очищение нафса»</h2>
          <p>Также я работаю над книгой о воспитании души и очищении сердца. Познакомься с ней на отдельном сайте.</p>
          <a className="book-link" href={BOOK_URL} target="_blank" rel="noreferrer">Перейти к книге <ArrowRight size={15}/></a>
        </div>
      </section>

      {showLesson && <div className="modal-backdrop" role="presentation" onClick={() => setShowLesson(false)}>
        <section className="lesson-modal" role="dialog" aria-modal="true" aria-label="Урок" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={() => setShowLesson(false)}>Закрыть</button>
          <span className="muted-label">ИМЯ {current.n} ИЗ 99</span>
          <div className="lesson-arabic" lang="ar" dir="rtl">{current.arabic}</div>
          <h2>{current.meaning}</h2><p className="lesson-translit">{current.transliteration}</p>
          <p className="lesson-description">{current.description}</p>
          <div className="source-note"><CircleHelp size={15}/> Объяснения будут дополнены проверенными ссылками на исламские источники.</div>
          <button className="primary-button full" onClick={() => setShowLesson(false)}>Продолжить изучение <ArrowRight size={17}/></button>
        </section>
      </div>}

      {(showAccountInfo || showSaveInfo) && <div className="modal-backdrop" role="presentation" onClick={() => { setShowAccountInfo(false); setShowSaveInfo(false); }}>
        <section className="info-modal" role="dialog" aria-modal="true" aria-label={showAccountInfo ? 'Вход в аккаунт' : 'Сохранить сайт'} onClick={e => e.stopPropagation()}>
          <button className="modal-x" aria-label="Закрыть" onClick={() => { setShowAccountInfo(false); setShowSaveInfo(false); }}><X size={19}/></button>
          {showAccountInfo ? <>
            <div className="info-modal-icon"><LockKeyhole size={21}/></div>
            <h2>Личный кабинет готовится</h2>
            <p>Сейчас сайт открыт для свободного изучения без регистрации. Вход и сохранение прогресса на разных устройствах появятся после подключения аккаунтов.</p>
          </> : <>
            <div className="info-modal-icon"><Bookmark size={21}/></div>
            <h2>Сохрани сайт, чтобы вернуться</h2>
            <p><b>На iPhone:</b> нажми «Поделиться» в Safari, затем выбери «На экран Домой» или «Добавить закладку».</p>
            <p><b>В других браузерах:</b> добавь страницу в закладки.</p>
          </>}
          <button className="primary-button full" onClick={() => { setShowAccountInfo(false); setShowSaveInfo(false); }}>Понятно</button>
        </section>
      </div>}

      <footer><span>asma ul husna</span><span>Учись с намерением и постоянством</span></footer>
    </main>
  );
}
