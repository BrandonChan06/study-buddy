import { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LectureInput from './pages/LectureInput';
import Flashcards from './pages/Flashcards';

export const SearchContext = createContext();

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/input" element={<LectureInput />} />
            <Route path="/flashcards" element={<Flashcards />} />
          </Route>
        </Routes>
      </Router>
    </SearchContext.Provider>
  );
}

export default App;
