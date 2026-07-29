import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { problemService } from '../api/services';
import { celebrateSuccess } from '../utils/celebrate';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, XCircle, Flame, Sparkles, PartyPopper, Lightbulb } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  mcq_options?: string[];
}

interface McqResult {
  is_correct: boolean;
  correct_index: number;
  explanation?: string;
}

export default function DailyChallenge() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<McqResult | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetchDaily();
  }, []);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await problemService.getDailyMcqs();
      if (!res.data || res.data.length === 0) {
        setAllDone(true);
      } else {
        setProblems(res.data);
      }
    } catch {
      toast.error('Could not load today\'s challenge.');
    } finally {
      setLoading(false);
    }
  };

  const currentProblem = problems[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (result) return;
    setSelected(idx);
  };

  const handleSubmit = async () => {
    if (selected === null || !currentProblem || submitting) return;
    setSubmitting(true);
    try {
      const res = await problemService.submitMcq({
        problem_id: currentProblem.id,
        selected_index: selected,
      });
      setResult(res.data);
      if (res.data.is_correct) {
        celebrateSuccess();
        setSolvedCount((c) => c + 1);
      }
    } catch {
      toast.error('Could not submit answer. Try again.');
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
          <p className="text-gray-400 mb-1">
            {solvedCount > 0
              ? `You solved ${solvedCount} question${solvedCount !== 1 ? 's' : ''} today!`
              : "You've completed all of today's questions!"}
          </p>
          <p className="text-gray-500 text-sm">Come back tomorrow for 10 fresh AI-generated questions.</p>
        </div>
      </AppLayout>
    );
  }

  const options = currentProblem.mcq_options || [];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        {/* Progress header */}
        <div className="mb-6">
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
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentProblem.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="relative bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-gray-500">{currentProblem.category}</span>
            </div>

            <h2 className="font-display text-lg md:text-xl font-semibold mb-6 leading-relaxed">
              {currentProblem.description}
            </h2>

            {options.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                This question failed to load properly.
                <button onClick={handleNext} className="block mx-auto mt-3 text-primary hover:underline">
                  Skip to next →
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {options.map((option, idx) => {
                    const isSelected = selected === idx;
                    const isCorrectAnswer = result && idx === result.correct_index;
                    const isWrongSelected = result && isSelected && !result.is_correct;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={!!result}
                        className={`relative z-10 w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${result ? 'cursor-default' : 'cursor-pointer'
                          } ${isCorrectAnswer
                            ? 'bg-green-500/15 border-green-500'
                            : isWrongSelected
                              ? 'bg-red-500/15 border-red-500'
                              : isSelected
                                ? 'bg-primary/15 border-primary'
                                : 'bg-dark-bg border-dark-border hover:border-primary/40 hover:bg-dark-border/30'
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${isCorrectAnswer
                              ? 'border-green-400 bg-green-400 text-dark-bg'
                              : isWrongSelected
                                ? 'border-red-400 bg-red-400 text-dark-bg'
                                : isSelected
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-gray-600 text-gray-400'
                            }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm text-gray-200 flex-1 font-medium">{option}</span>
                        {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
                        {isWrongSelected && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className={`mb-6 rounded-xl p-4 border ${result.is_correct
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-amber-500/5 border-amber-500/20'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                        )}
                        <p className={`text-sm font-semibold ${result.is_correct ? 'text-green-400' : 'text-amber-400'}`}>
                          {result.is_correct ? 'Correct!' : `Correct answer: ${String.fromCharCode(65 + result.correct_index)}`}
                        </p>
                      </div>
                      {result.explanation && (
                        <p className="text-gray-400 text-sm leading-relaxed">{result.explanation}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!result ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={selected === null || submitting}
                    className="relative z-10 w-full bg-gradient-to-r from-primary to-purple-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Answer'}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="relative z-10 w-full bg-dark-border hover:bg-dark-border/70 text-white font-medium py-3 rounded-xl transition-all"
                  >
                    {currentIdx + 1 >= problems.length ? 'Finish' : 'Next Question →'}
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}