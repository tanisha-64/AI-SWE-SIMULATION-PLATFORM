import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { debugService } from '../api/services';
import { Bug, Loader2, Terminal, Zap, ShieldAlert, Skull } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  language: string;
}

const difficultyConfig: Record<string, { color: string; icon: any }> = {
  easy: { color: 'text-green-400 border-green-500/30 bg-green-500/5', icon: Zap },
  medium: { color: 'text-amber-400 border-amber-500/30 bg-amber-500/5', icon: ShieldAlert },
  hard: { color: 'text-red-400 border-red-500/30 bg-red-500/5', icon: Skull },
};

export default function DebugArena() {
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;

    const fetchUntilFull = async () => {
      setLoading(true);
      while (attempts < maxAttempts) {
        const res = await debugService.getDaily();
        setAllChallenges(res.data);
        if (res.data.length >= 5) break;
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setLoading(false);
    };

    fetchUntilFull();
  }, []);

  const challenges = filter ? allChallenges.filter((c) => c.difficulty === filter) : allChallenges;

  return (
    <AppLayout>
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <motion.div
          className="absolute inset-x-0 h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"
          animate={{ y: ['0%', '2000%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10 p-6 md:p-8 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card rounded-2xl p-5 mb-6 font-mono border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 ml-2">debug_arena.sh</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Terminal className="w-4 h-4 text-red-400" />
                <span className="text-gray-400">
                  <span className="text-red-400">$</span> scanning for vulnerabilities...{' '}
                  <span className="text-green-400">{allChallenges.length} bugs found today</span>
                </span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 bg-primary inline-block"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                <Bug className="w-6 h-6 text-red-400" />
              </div>
              <h1 className="font-display text-3xl font-bold">Debugging Arena</h1>
            </div>
            <p className="text-gray-400 mb-6">
              Today's debugging challenges. Fresh set every day.
            </p>

            <div className="flex gap-2 mb-8">
              {['', 'easy', 'medium', 'hard'].map((d) => (
                <motion.button
                  key={d}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${filter === d
                    ? 'bg-primary text-white border-primary'
                    : 'bg-dark-card border-dark-border text-gray-400 hover:text-white hover:border-primary/30'
                    }`}
                >
                  {d === '' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                </motion.button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-3 py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-gray-500 text-sm">Generating today's challenges with AI...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-20 text-gray-500 font-mono">
                &gt; no threats match this filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((c, i) => {
                  const config = difficultyConfig[c.difficulty] || difficultyConfig.medium;
                  const DiffIcon = config.icon;
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link to={`/debug-arena/${c.id}`}>
                        <motion.div
                          whileHover={{ y: -6, scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className={`relative glass-card rounded-xl p-5 h-full border overflow-hidden group ${config.color}`}
                        >
                          <div className="relative flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <DiffIcon className="w-4 h-4" />
                              <span className="text-xs font-mono uppercase tracking-wider opacity-70">
                                {c.difficulty} threat
                              </span>
                            </div>
                            <span className="text-xs font-mono text-gray-600">#{String(c.id).padStart(3, '0')}</span>
                          </div>

                          <h3 className="relative font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                            {c.title}
                          </h3>
                          <p className="relative text-gray-400 text-sm line-clamp-2 font-mono">
                            {c.description}
                          </p>

                          <div className="relative mt-4 flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                            <Bug className="w-3 h-3" />
                            <span>{c.language}</span>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}