import { BrowserRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import './App.css';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="app">
        <header className="header">
          <h1>Test report dashboard</h1>
          <p>Last 10 runs · failures & flaky tests</p>
        </header>
        <main className="main">
          <Home />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
