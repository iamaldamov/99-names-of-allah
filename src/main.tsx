import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Register the site worker from the GitHub Pages subpath (not the domain root).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(error => console.warn('Service worker registration failed:', error));
  }, { once: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);