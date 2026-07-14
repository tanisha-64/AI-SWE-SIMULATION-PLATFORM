import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import ReadinessGauge from '../components/dashboard/ReadinessGauge';
import { analyticsService } from '../api/services';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { Award, Loader2, TrendingUp, Target } from 'lucide-react';

interface Analytics {
  total_problems_solved: number;
  total_submissions: number;
  accuracy_percentage: number;
  debugging_challenges_solved: number;
  category_breakdown: Record<string, { solved: number; accuracy: number }>;
  strengths: string[];
  weaknesses: string[];
  consistency_score: number;
  avg_code_quality_score: number;
  industry_readiness_score: number;
}

interface Badge {
  name: string;
  description: string;
  earned_at: string;
}

const COLORS = ['#6366f1', '#c084fc', '#f472b6', '#22c55e', '#eab308', '#3b82f6'];

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsService.getMyAnalytics(), analyticsService.getBadges()]).then(
      ([a, b]) => {
        setAnalytics(a.data);
        setBadges(b.data);
        setLoading(false);
      }
    );
  }, []);

  if (loading || !analytics) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const categoryData = Object.entries(analytics.category_breakdown || {}).map(([name, stats]) => ({
    name,
    value: stats.solved,
  }));

  const radarData = Object.entries(analytics.category_breakdown || {}).map(([name, stats]) => ({
    category: name,
    accuracy: stats.accuracy,
  }));

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">Your Analytics</h1>
          <p className="text-gray-400 mb-8">Deep insights into your placement readiness</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ReadinessGauge score={analytics.industry_readiness_score} />

            {/* Category Distribution Pie */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> Problems by Category
              </p>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm py-12 text-center">Solve problems to see distribution</p>
              )}
            </div>

            {/* Radar Chart — Accuracy by Category */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Accuracy by Skill
              </p>
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

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Submissions', value: analytics.total_submissions },
              { label: 'Debug Challenges Solved', value: analytics.debugging_challenges_solved },
              { label: 'Consistency Score', value: `${analytics.consistency_score.toFixed(0)}%` },
              { label: 'Avg Code Quality', value: `${analytics.avg_code_quality_score.toFixed(1)}/10` },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4"
              >
                <p className="text-2xl font-bold gradient-text">{m.value}</p>
                <p className="text-gray-500 text-xs mt-1">{m.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" /> Achievements
            </p>
            {badges.length === 0 ? (
              <p className="text-gray-500 text-sm">Keep practicing to earn your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map((b, i) => (
                  <motion.div
                    key={b.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, type: 'spring' }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl mb-1">🏆</div>
                    <p className="text-xs font-semibold text-amber-300">{b.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{b.description}</p>
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