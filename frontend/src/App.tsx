import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import ProblemWorkspace from './pages/ProblemWorkspace';
import DebugArena from './pages/DebugArena';
import DebugChallenge from './pages/DebugChallenge';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Mentor from './pages/Mentor';
import NotFound from './pages/NotFound';
import McqWorkspace from './pages/McqWorkspace';
import DailyChallenge from './pages/DailyChallenge';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
          <Route path="/problems/:id" element={<ProtectedRoute><ProblemWorkspace /></ProtectedRoute>} />
          <Route path="/debug-arena" element={<ProtectedRoute><DebugArena /></ProtectedRoute>} />
          <Route path="/debug-arena/:id" element={<ProtectedRoute><DebugChallenge /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/mentor" element={<ProtectedRoute><Mentor /></ProtectedRoute>} />
          <Route path="/mcq/:id" element={<ProtectedRoute><McqWorkspace /></ProtectedRoute>} />
          <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;