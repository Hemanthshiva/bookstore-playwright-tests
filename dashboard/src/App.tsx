import { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import './App.css';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <HashRouter basename={import.meta.env.BASE_URL}>
      <div className={`app ${theme}`}>
        <header className="header">
          <div className="header-content">
            <div>
              <h1>Test report dashboard</h1>
              <p>Last 10 runs · failures & flaky tests</p>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>
        <main className="main">
          <Home />
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
