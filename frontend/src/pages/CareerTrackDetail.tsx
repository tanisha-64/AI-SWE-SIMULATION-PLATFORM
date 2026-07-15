import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { careerTrackService } from '../api/services';
import { Loader2, ArrowLeft, CheckSquare, Square, Code, BookOpen, Users, Sparkles } from 'lucide-react';

interface ChecklistItem {
  id: number;
  item_text: string;
  category: string;
  is_completed: boolean;
}

interface TierDetail {
  id: number;
  name: string;
  description: string;
  dsa_topics: string[];
  required_subjects: string[];
  behavioral_focus: string[];
  checklist: ChecklistItem[];
  recommended_problems: { id: number; title: string; difficulty: string; category: string }[];
}

export default function CareerTrackDetail() {
  const { id } = useParams();
  const [tier, setTier] = useState<TierDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    careerTrackService.getTierDetail(Number(id)).then((res) => {
      setTier(res.data);
      setLoading(false);
    });
  }, [id]);

  const toggleItem = async (itemId: number) => {
    if (!tier) return;
    setTier({
      ...tier,
      checklist: tier.checklist.map((c) => (c.id === itemId ? { ...c, is_completed: !c.is_completed } : c)),
    });
    await careerTrackService.toggleChecklistItem(itemId);
  };

  if (loading || !tier) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const completedCount = tier.checklist.filter((c) => c.is_completed).length;
  const progressPct = tier.checklist.length ? (completedCount / tier.checklist.length) * 100 : 0;

  const categoryIcon = (cat: string) => {
    if (cat === 'dsa') return <Code className="w-4 h-4" />;
    if (cat === 'subject') return <BookOpen className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  const difficultyStyle = (d: string) =>
    d === 'easy' ? 'bg-green-500/10 text-green-400' : d === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400';

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <Link to="/career-tracks" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tracks
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2 gradient-text">{tier.name}</h1>
          <p className="text-gray-400 mb-6">{tier.description}</p>

          {/* Progress */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Your Progress</span>
              <span className="text-sm font-semibold text-primary">{completedCount}/{tier.checklist.length}</span>
            </div>
            <div className="h-2 bg-dark-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Topic areas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5"><Code className="w-3.5 h-3.5" /> DSA Focus</p>
              <div className="flex flex-wrap gap-1.5">
                {tier.dsa_topics.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {tier.required_subjects.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Behavioral</p>
              <div className="flex flex-wrap gap-1.5">
                {tier.behavioral_focus.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 bg-pink-500/10 text-pink-400 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
            <p className="text-sm font-semibold mb-3">Preparation Checklist</p>
            <div className="space-y-2">
              {tier.checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center gap-3 p-3 bg-dark-bg rounded-lg hover:bg-dark-border/50 transition-colors text-left"
                >
                  {item.is_completed ? (
                    <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                  <span className={`text-sm flex-1 ${item.is_completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                    {item.item_text}
                  </span>
                  <span className="text-gray-600">{categoryIcon(item.category)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recommended problems */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Recommended Problems
            </p>
            <div className="space-y-2">
              {tier.recommended_problems.map((p) => (
                <Link
                  key={p.id}
                  to={`/problems/${p.id}`}
                  className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-border/50 transition-colors"
                >
                  <span className="text-sm">{p.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-dark-border rounded-full text-gray-400">{p.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyStyle(p.difficulty)}`}>{p.difficulty}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}