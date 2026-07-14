import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { problemService } from '../api/services';
import { celebrateSuccess } from '../utils/celebrate';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Building2 } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  company_style_tag?: string;
  mcq_options?: string[];
}

export default function McqWorkspace() {
  const { id } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ is_correct: boolean; correct_index: number; explanation?: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    problemService.getById(Number(id)).then((res) => {
      setProblem(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async () => {
    if (selected === null || !problem) return;
    setSubmitting(true);
    try {
      const res = await problemService.submitMcq({ problem_id: problem.id, selected_index: selected });
      setResult(res.data);
      if (res.data.is_correct) {
        celebrateSuccess();
        toast.success('Correct! 🎯');
      } else {
        toast.error('Not quite — check the explanation below.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyStyle = (d: string) =>
    d === 'easy'
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : d === 'medium'
      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';

  if (loading || !problem) {
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
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <Link to="/problems" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Problems
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${difficultyStyle(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="text-xs px-2 py-1 bg-dark-border rounded-full text-gray-400">{problem.category}</span>
            {problem.company_style_tag && (
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {problem.company_style_tag}
              </span>
            )}
          </div>

          <h1 className="font-display text-xl md:text-2xl font-bold mb-6 leading-relaxed">{problem.description}</h1>

          <div className="space-y-3 mb-6">
            {problem.mcq_options?.map((option, idx) => {
              const isSelected = selected === idx;
              const isCorrect = result && idx === result.correct_index;
              const isWrongSelected = result && isSelected && !result.is_correct;

              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: result ? 1 : 1.01 }}
                  whileTap={{ scale: result ? 1 : 0.99 }}
                  onClick={() => !result && setSelected(idx)}
                  disabled={!!result}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                    isCorrect
                      ? 'bg-green-500/10 border-green-500/40'
                      : isWrongSelected
                      ? 'bg-red-500/10 border-red-500/40'
                      : isSelected
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-dark-bg border-dark-border hover:border-primary/30'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isCorrect
                        ? 'border-green-400 text-green-400'
                        : isWrongSelected
                        ? 'border-red-400 text-red-400'
                        : isSelected
                        ? 'border-primary text-primary'
                        : 'border-gray-600 text-gray-500'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm text-gray-200 flex-1">{option}</span>
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
                  {isWrongSelected && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-dark-bg rounded-xl p-4"
              >
                <p className={`text-sm font-semibold mb-1.5 ${result.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                  {result.is_correct ? '✓ Correct!' : '✗ Incorrect'}
                </p>
                {result.explanation && <p className="text-gray-400 text-sm leading-relaxed">{result.explanation}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {!result ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={selected === null || submitting}
              className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Answer'}
            </motion.button>
          ) : (
            <Link to="/problems">
              <button className="w-full bg-dark-border hover:bg-dark-border/70 text-white font-medium py-3 rounded-xl transition-all">
                Next Problem
              </button>
            </Link>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}