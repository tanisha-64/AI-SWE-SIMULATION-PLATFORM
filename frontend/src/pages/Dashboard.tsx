import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../api/services';
import AppLayout from '../components/layout/AppLayout';
import StatCard from '../components/dashboard/StatCard';
import ReadinessGauge from '../components/dashboard/ReadinessGauge';
import StreakCalendar from '../components/dashboard/StreakCalendar';
import { Flame, Target, Award, TrendingUp, Code, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Analytics {
  total_problems_solved: number;
  accuracy_percentage: number;
  industry_readiness_score: number;
  strengths: string[];
  weaknesses: string[];
}

interface Streak {
  current_streak: number;
  longest_streak: number;
}

interface Recommendation {
  id: number;
  title: string;
  difficulty: string;
  category: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 GADBARI FIX 1: First-time user welcome redirect so Jarvis can speak!
  useEffect(() => {
    if (user) {
      const hasSeenTour = localStorage.getItem(`hasSeenTour_${user.id}`);
      if (!hasSeenTour) {
        // Is user ke liye tour state register kar dete hain taaki baar-baar loop na bane
        localStorage.setItem(`hasSeenTour_${user.id}`, 'true');
        // Seedhe welcome page redirect, jahan Jarvis speech trigger hoga
        navigate('/welcome');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    Promise.all([
      analyticsService.getMyAnalytics(),
      analyticsService.getStreak(),
      analyticsService.getRecommendations(),
    ])
      .then(([analyticsRes, streakRes, recRes]) => {
        setAnalytics(analyticsRes.data);
        setStreak(streakRes.data);
        setRecommendations(recRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header Area with Manual Jarvis Tour Link */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user?.full_name} 👋</h1>
              <p className="text-gray-400">Ready to level up your skills today?</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(34,211,238,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/welcome')}
              className="flex items-center gap-2 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-cyan-500/5 shadow-lg shadow-cyan-500/5 self-start sm:self-center"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              🤖 Talk to Jarvis Guide
            </motion.button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={streak?.current_streak || 0}
              suffix="days"
              color="text-orange-500"
              delay={0.1}
            />
            <StatCard
              icon={Target}
              label="Problems Solved"
              value={analytics?.total_problems_solved || 0}
              color="text-blue-500"
              delay={0.15}
            />
            <StatCard
              icon={TrendingUp}
              label="Accuracy"
              value={analytics?.accuracy_percentage?.toFixed(0) || 0}
              suffix="%"
              color="text-green-500"
              delay={0.2}
            />
            <StatCard
              icon={Award}
              label="Longest Streak"
              value={streak?.longest_streak || 0}
              suffix="days"
              color="text-purple-500"
              delay={0.25}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ReadinessGauge score={analytics?.industry_readiness_score || 0} />

            <div className="lg:col-span-2">
              <StreakCalendar />
            </div>
          </div>

          {/* Strengths/Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <p className="text-green-400 text-sm font-medium mb-3">💪 Strengths</p>
              <div className="flex flex-wrap gap-2">
                {analytics?.strengths?.length ? (
                  analytics.strengths.map((s) => (
                    <span key={s} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Keep solving to discover your strengths!</span>
                )}
              </div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <p className="text-orange-400 text-sm font-medium mb-3">🎯 Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {analytics?.weaknesses?.length ? (
                  analytics.weaknesses.map((w) => (
                    <span key={w} className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm">
                      {w}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No weak areas identified yet!</span>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-4">🎯 Recommended For You</p>
            {recommendations.length === 0 ? (
              <p className="text-gray-500 text-sm">Solve a few problems to get personalized recommendations!</p>
            ) : (
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <Link
                      to={`/problems/${rec.id}`}
                      className="flex items-center justify-between p-3 bg-dark-bg rounded-xl hover:bg-dark-border transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Code className="w-4 h-4 text-primary" />
                        <span className="group-hover:text-primary transition-colors">{rec.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-dark-border rounded-full text-gray-400">
                          {rec.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${rec.difficulty === 'easy'
                              ? 'bg-green-500/10 text-green-400'
                              : rec.difficulty === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                        >
                          {rec.difficulty}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}