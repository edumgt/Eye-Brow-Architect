import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AnimatePresence } from 'framer-motion'
import MainPage from './pages/MainPage'
import CounselingPage from './pages/CounselingPage'
import MyPage from './pages/MyPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import MembershipPage from './pages/MembershipPage'
import AnalysisDashboard from './pages/AnalysisDashboard'
import SettingsPage from './pages/SettingsPage'

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainPage />} />
        <Route path="/counseling" element={<CounselingPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/dashboard" element={<AnalysisDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  )
}

export default App