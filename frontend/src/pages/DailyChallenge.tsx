import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { problemService } from '../api/services';
import { celebrateSuccess } from '../utils/celebrate';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, XCircle, Flame, Sparkles, PartyPopper } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  mcq_options?: string[];
}

export default function DailyChallenge() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ is_correct: boolean; correct_index: number; explanation?: string } | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetchDaily();
  }, []);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await problemService.getDailyMcqs();
      if (res.data.length === 0) {
        setAllDone(true);
      } else {
        setProblems(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentProblem = problems[currentIdx];

  const handleSubmit = async () => {
    if (selected === null || !currentProblem) return;
    setSubmitting(true);
    try {
      const res = await problemService.submitMcq({ problem_id: currentProblem.id, selected_index: selected });
      setResult(res.data);
      if (res.data.is_correct) {
        celebrateSuccess();
        setSolvedCount((c) => c + 1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= problems.length) {
      toast.success("You've completed today's challenge! 🎉");
      setAllDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setResult(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-400 text-sm">Generating today's challenge with AI...</p>
        </div>
      </AppLayout>
    );
  }

  if (allDone || problems.length === 0) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <PartyPopper className="w-16 h-16 text-amber-400 mb-4 mx-auto" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold mb-2">All done for today!</h1>
          <p className="text-gray-400 mb-1">You solved {solvedCount} question{solvedCount !== 1 ? 's' : ''} today.</p>
          <p className="text-gray-500 text-sm">Come back tomorrow for 10 fresh AI-generated questions.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        {/* Progress header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <h1 className="font-display text-lg font-bold">Daily MCQ Challenge</h1>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {currentIdx + 1} / {problems.length}
            </span>
          </div>
          <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              animate={{ width: `${((currentIdx + (result ? 1 : 0)) / problems.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentProblem.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="glass-card glow-border rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-gray-500">{currentProblem.category}</span>
            </div>

            <h2 className="font-display text-lg md:text-xl font-semibold mb-6 leading-relaxed">
              {currentProblem.description}
            </h2>

            <div className="space-y-3 mb-6">
              {currentProblem.mcq_options?.map((option, idx) => {
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="w-full bg-dark-border hover:bg-dark-border/70 text-white font-medium py-3 rounded-xl transition-all"
              >
                {currentIdx + 1 >= problems.length ? 'Finish' : 'Next Question →'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}