import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { problemService } from '../api/services';
import { Search, Loader2, Code, ListChecks, Briefcase, Sparkles } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  problem_type: string;
  company_style_tag?: string;
}

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searched, setSearched] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');

  useEffect(() => {
    fetchProblems();
  }, [difficultyFilter, typeFilter]);

  const fetchProblems = async () => {
    setLoading(true);
    setSearched(false);
    try {
      const params: any = {};
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (typeFilter) params.problem_type = typeFilter;
      const res = await problemService.getAll(params);
      setProblems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchProblems();
    setLoading(true);
    setSearched(true);
    try {
      const res = await problemService.search(searchQuery);
      setProblems(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    setGenerateMsg('');
    try {
      await problemService.generate({
        category: searchQuery,
        difficulty: difficultyFilter || 'medium',
        problem_type: typeFilter || 'coding',
        count: 3,
      });
      setGenerateMsg('✨ New problems generated! Refreshing...');
      const res = await problemService.search(searchQuery);
      setProblems(res.data);
    } catch (err) {
      setGenerateMsg('Generation failed. Try a different topic.');
    } finally {
      setGenerating(false);
    }
  };

  const difficultyColor = (d: string) =>
    d === 'easy' ? 'bg-green-500/10 text-green-400' : d === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400';

  const typeIcon = (type: string) => {
    if (type === 'mcq') return <ListChecks className="w-4 h-4" />;
    if (type === 'project') return <Briefcase className="w-4 h-4" />;
    return <Code className="w-4 h-4" />;
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Problems</h1>
          <p className="text-gray-400 mb-6">Practice coding, MCQs, and real-world project challenges</p>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or type any topic (e.g. 'segment trees')..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </form>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2.5 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="coding">Coding</option>
              <option value="mcq">MCQ</option>
              <option value="project">Project</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : problems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl"
            >
              <p className="text-gray-400 mb-4">
                {searched
                  ? `No problems found for "${searchQuery}" yet.`
                  : 'No problems found. Try a different filter.'}
              </p>
              {searched && searchQuery.trim() && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerateNew}
                  disabled={generating}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-lg transition-all disabled:opacity-60"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate "{searchQuery}" problems with AI
                </motion.button>
              )}
              <AnimatePresence>
                {generateMsg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-primary mt-3"
                  >
                    {generateMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {problems.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={`/problems/${p.id}`}
                    className="block bg-dark-card border border-dark-border rounded-xl p-4 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{typeIcon(p.problem_type)}</span>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{p.title}</h3>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${difficultyColor(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{p.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-dark-border rounded-full text-gray-400">
                        {p.category}
                      </span>
                      {p.company_style_tag && (
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {p.company_style_tag}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}