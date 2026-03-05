import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import KPIsPage from './pages/KPIsPage';
import HistoricoPage from './pages/HistoricoPage';
import TeamKPIsPage from './pages/TeamKPIsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/kpis" element={<KPIsPage />} />
        <Route path="/historico" element={<HistoricoPage />} />
        <Route path="/team-kpis" element={<TeamKPIsPage />} />
      </Routes>
    </Router>
  );
}
