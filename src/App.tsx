import { useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, Flame, Heart, LockKeyhole, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from './lib/supabase';

const previewNames = [
  { n: '01', arabic: 'الرَّحْمَٰنُ', transliteration: 'Ar-Raḥmān', meaning: 'Всемилостивый', description: 'Тот, Чья милость всеобъемлюща и охватывает творения.' },
  { n: '02', arabic: 'الرَّحِيمُ', transliteration: 'Ar-Raḥīm', meaning: 'Милующий', description: 'Тот, Кто проявляет особую милость к Своим верующим рабам.' },
  { n: '03', arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', meaning: 'Владыка', description: 'Истинный Владыка, Кому принадлежит совершенная власть над всем сущим.' },
];

export default function App() {
  const [active, setActive] = useState(0);
  const [showLesson, setShowLesson] = useState(false);
  const current = previewNames[active];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Asma Ul Husna — главная">
          <span className="brand-mark">أ</span><span>asma <b>ul husna</b></span>
        </a>
        <button className="login-button" onClick={() => document.getElementById('account')?.scrollIntoView({ behavior: 'smooth' })}>
          <LockKeyhole size={15} /> Войти
        </button>
      </header>

      <section className="hero" id="home">
        <div className="eyebrow"><Sparkles size={14} /> ПУТЬ ПОЗНАНИЯ</div>
        <h1>Познакомься с именами<br/><em>Того, Кто создал тебя.</em></h1>
        <p className="hero-copy">Изучай 99 прекрасных имён Аллаха постепенно, осмысленно и с повторением — в собственном темпе.</p>
        <button className="primary-button" onClick={() => setShowLesson(true)}>Начать обучение <ArrowRight size={17}/></button>
        <div className="hero-art" aria-hidden="true"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><span>اللَّهُ</span></div>
      </section>

      <section className="progress-card">
        <div className="progress-heading"><div><span className="muted-label">ТВОЙ ПУТЬ</span><h2>99 имён. Одно путешествие.</h2></div><span className="progress-count">0 <small>/ 99</small></span></div>
        <div className="progress-track"><span/></div>
        <div className="progress-foot"><span><Check size={14}/> 0 изучено</span><span>Начни с первого имени</span></div>
      </section>

      <section className="learning-section">
        <div className="section-heading"><div><span className="muted-label">ПЕРВЫЕ ШАГИ</span><h2>Начни знакомство</h2></div><span className="section-total">99 имён <ChevronRight size={15}/></span></div>
        <div className="name-list">
          {previewNames.map((name, index) => (
            <button className={`name-row ${active === index ? 'selected' : ''}`} key={name.n} onClick={() => { setActive(index); setShowLesson(true); }}>
              <span className="name-number">{name.n}</span><span className="name-arabic" lang="ar" dir="rtl">{name.arabic}</span>
              <span className="name-info"><b>{name.meaning}</b><small>{name.transliteration}</small></span><ChevronRight className="row-arrow" size={18}/>
            </button>
          ))}
          <div className="locked-row"><span className="lock-circle"><LockKeyhole size={16}/></span><span><b>Следующие имена</b><small>Откроются по мере прохождения</small></span><span className="locked-count">+96</span></div>
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

      <section className="account-section" id="account">
        <div className="account-icon"><Heart size={20}/></div><div><h2>Твой прогресс останется с тобой</h2><p>{isSupabaseConfigured ? 'Войди или создай аккаунт, чтобы сохранять обучение на всех устройствах.' : 'Авторизация и синхронизация будут подключены после настройки Supabase.'}</p></div>
        <button className="secondary-button" onClick={() => alert('Подключение Supabase — следующий этап разработки.')}>Создать аккаунт <ChevronRight size={16}/></button>
      </section>

      <footer><span>asma ul husna</span><span>Учись с намерением и постоянством</span></footer>
    </main>
  );
}