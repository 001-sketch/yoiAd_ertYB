import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Article } from './pages/Article';
import { Info } from './pages/Info';
import { Footer } from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-dark text-white selection:bg-primary selection:text-black">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/info/:slug" element={<Info />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
