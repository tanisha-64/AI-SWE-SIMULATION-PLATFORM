import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import ProblemWorkspace from './pages/ProblemWorkspace';
import McqWorkspace from './pages/McqWorkspace';
import DebugArena from './pages/DebugArena';
import DebugChallenge from './pages/DebugChallenge';
import Analytics from './pages/Analytics';
import Mentor from './pages/Mentor';
import Profile from './pages/Profile';
import CareerTracks from './pages/CareerTracks';
import CareerTrackDetail from './pages/CareerTrackDetail';
import DailyChallenge from './pages/DailyChallenge';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
          <Route path="/problems/:id" element={<ProtectedRoute><ProblemWorkspace /></ProtectedRoute>} />
          <Route path="/mcq/:id" element={<ProtectedRoute><McqWorkspace /></ProtectedRoute>} />
          <Route path="/debug-arena" element={<ProtectedRoute><DebugArena /></ProtectedRoute>} />
          <Route path="/debug-arena/:id" element={<ProtectedRoute><DebugChallenge /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/mentor" element={<ProtectedRoute><Mentor /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/career-tracks" element={<ProtectedRoute><CareerTracks /></ProtectedRoute>} />
          <Route path="/career-tracks/:id" element={<ProtectedRoute><CareerTrackDetail /></ProtectedRoute>} />
          <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;