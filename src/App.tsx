import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import StoryScreen from './pages/StoryScreen';
import HistoryScreen from './pages/HistoryScreen';
import CharactersScreen from './pages/CharactersScreen';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Main />
    </HashRouter>
  );
};

const Main: React.FC = () => {
  const location = useLocation();
  const showBottomNav = location.pathname !== '/story';

  return (
    <div className="h-screen w-screen flex flex-col items-center bg-gradient-to-b from-orange-50 to-amber-100 font-sans">
      <main className="flex-grow w-full max-w-md mx-auto overflow-y-auto no-scrollbar">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/story" element={<StoryScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/characters" element={<CharactersScreen />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default App;
