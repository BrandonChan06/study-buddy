import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LectureInput from './pages/LectureInput';
import Flashcards from './pages/Flashcards';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="input" element={<LectureInput />} />
          <Route path="flashcards" element={<Flashcards />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
