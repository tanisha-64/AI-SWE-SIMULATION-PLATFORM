import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../api/services';
import AppLayout from '../components/layout/AppLayout';
import StatCard from '../components/dashboard/StatCard';
import ReadinessGauge from '../components/dashboard/ReadinessGauge';
import StreakCalendar from '../components/dashboard/StreakCalendar';
import { Flame, Target, Award, TrendingUp, Code, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

interface Analytics {
  total_problems_solved: number;
  accuracy_percentage: number;
  industry_readiness_score: number;
  strengths: string[];
  weaknesses: string[];
  category_breakdown: Record<string, { solved: number; accuracy: number }>;
  total_submissions: number;
  debugging_challenges_solved: number;
  consistency_score: number;
  avg_code_quality_score: number;
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

interface Badge {
  name: string;
  description: string;
  earned_at: string;
}

const COLORS = ['#6366f1', '#c084fc', '#f472b6', '#22c55e', '#eab308', '#3b82f6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getMyAnalytics(),
      analyticsService.getStreak(),
      analyticsService.getRecommendations(),
      analyticsService.getBadges(),
    ])
      .then(([a, s, r, b]) => {
        setAnalytics(a.data);
        setStreak(s.data);
        setRecommendations(r.data);
        setBadges(b.data);
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

  const categoryData = Object.entries(analytics?.category_breakdown || {}).map(([name, stats]) => ({
    name,
    value: stats.solved,
  }));

  const radarData = Object.entries(analytics?.category_breakdown || {}).map(([name, stats]) => ({
    category: name,
    accuracy: stats.accuracy,
  }));

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome, {user?.full_name} 👋</h1>
            <p className="text-gray-400">Ready to level up your skills today?</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Flame} label="Current Streak" value={streak?.current_streak || 0} suffix="days" color="text-orange-500" delay={0.1} />
            <StatCard icon={Target} label="Problems Solved" value={analytics?.total_problems_solved || 0} color="text-blue-500" delay={0.15} />
            <StatCard icon={TrendingUp} label="Accuracy" value={analytics?.accuracy_percentage?.toFixed(0) || 0} suffix="%" color="text-green-500" delay={0.2} />
            <StatCard icon={Award} label="Longest Streak" value={streak?.longest_streak || 0} suffix="days" color="text-purple-500" delay={0.25} />
          </div>

          {/* Readiness + Streak Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ReadinessGauge score={analytics?.industry_readiness_score || 0} />
            <div className="lg:col-span-2">
              <StreakCalendar />
            </div>
          </div>

          {/* Category charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-3">Problems by Category</p>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm py-12 text-center">Solve problems to see distribution</p>
              )}
            </div>

            <div className="glass-card rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-3">Accuracy by Skill</p>
              {radarData.length >= 3 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a2a3e" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm py-12 text-center">Need 3+ categories for radar view</p>
              )}
            </div>
          </div>

          {/* Strengths/Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <p className="text-green-400 text-sm font-medium mb-3">💪 Strengths</p>
              <div className="flex flex-wrap gap-2">
                {analytics?.strengths?.length ? analytics.strengths.map((s) => (
                  <span key={s} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">{s}</span>
                )) : <span className="text-gray-500 text-sm">Keep solving to discover your strengths!</span>}
              </div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <p className="text-orange-400 text-sm font-medium mb-3">🎯 Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {analytics?.weaknesses?.length ? analytics.weaknesses.map((w) => (
                  <span key={w} className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm">{w}</span>
                )) : <span className="text-gray-500 text-sm">No weak areas identified yet!</span>}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <p className="text-gray-400 text-sm mb-4">🏆 Achievements</p>
            {badges.length === 0 ? (
              <p className="text-gray-500 text-sm">Keep practicing to earn your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map((b, i) => (
                  <motion.div
                    key={b.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3 text-center"
                  >
                    <div className="text-xl mb-1">🏆</div>
                    <p className="text-xs font-semibold text-amber-300">{b.name}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-4">🎯 Recommended For You</p>
            {recommendations.length === 0 ? (
              <p className="text-gray-500 text-sm">Solve a few problems to get personalized recommendations!</p>
            ) : (
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <motion.div key={rec.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                    <Link to={`/problems/${rec.id}`} className="flex items-center justify-between p-3 bg-dark-bg rounded-xl hover:bg-dark-border transition-colors group">
                      <div className="flex items-center gap-3">
                        <Code className="w-4 h-4 text-primary" />
                        <span className="group-hover:text-primary transition-colors">{rec.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-dark-border rounded-full text-gray-400">{rec.category}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rec.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                          rec.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>{rec.difficulty}</span>
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