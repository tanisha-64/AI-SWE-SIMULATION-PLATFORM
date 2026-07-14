import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import AppLayout from '../components/layout/AppLayout';
import ResizableSplit from '../components/workspace/ResizableSplit';
import { debugService } from '../api/services';
import { useTheme } from '../context/ThemeContext';
import { celebrateSuccess } from '../utils/celebrate';
import toast from 'react-hot-toast';
import { Lightbulb, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  broken_code: string;
  language: string;
  difficulty: string;
}

export default function DebugChallenge() {
  const { id } = useParams();
  const { theme } = useTheme();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [hints, setHints] = useState<{ hint_text: string; hint_level: number }[]>([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    debugService.getById(Number(id)).then((res) => {
      setChallenge(res.data);
      setCode(res.data.broken_code);
      setLoading(false);
    });
  }, [id]);

  const handleGetHint = async () => {
    if (!challenge) return;
    setLoadingHint(true);
    try {
      const res = await debugService.getHint({ challenge_id: challenge.id, current_code: code });
      setHints((prev) => [...prev, res.data]);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    setSubmitting(true);
    try {
      const res = await debugService.submitFix({ challenge_id: challenge.id, code });
      setResult(res.data);

      if (res.data.status === 'solved') {
        celebrateSuccess();
        toast.success('Bug fixed! Great debugging 🐛✨');
      } else {
        toast.error('Not quite — check the failed tests below.');
      }
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !challenge) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const DescriptionPanel = (
    <div className="h-full overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-3 gradient-text">{challenge.title}</h1>
        <p className="text-gray-300 leading-relaxed mb-6">{challenge.description}</p>

        <button
          onClick={handleGetHint}
          disabled={loadingHint}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-all disabled:opacity-60 mb-4"
        >
          {loadingHint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
          Get a Hint ({hints.length} used)
        </button>

        <div className="space-y-3">
          <AnimatePresence>
            {hints.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="glass-card rounded-xl p-4 border-l-2 border-amber-400"
              >
                <p className="text-xs text-amber-400 font-medium mb-1">Hint {h.hint_level}</p>
                <p className="text-gray-300 text-sm">{h.hint_text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  const EditorPanel = (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[300px] border-b border-dark-border">
        <Editor
          height="100%"
          defaultLanguage={challenge.language}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 }, fontFamily: 'JetBrains Mono' }}
        />
      </div>

      <div className="p-3 border-b border-dark-border bg-dark-card">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Fix
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-dark-card">
        {result ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2">
              {result.status === 'solved' ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <span className={`font-semibold ${result.status === 'solved' ? 'text-green-400' : 'text-red-400'}`}>
                {result.status === 'solved' ? 'Bug Fixed! 🎉' : 'Not quite yet'}
              </span>
              <span className="text-gray-400 text-sm ml-auto">
                {result.passed_count}/{result.total_count} tests passed
              </span>
            </div>
            {result.test_results?.map((t: any) => (
              <div key={t.test_id} className="bg-dark-bg rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                  {t.passed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <span>Test {t.test_id}</span>
                </div>
                {!t.passed && (
                  <div className="ml-6 text-xs text-gray-400 font-mono mt-1">
                    <p>Expected: {t.expected}</p>
                    <p>Got: {t.actual || '—'}</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">Fix the code and click "Submit Fix" to test.</p>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)]">
        <ResizableSplit left={DescriptionPanel} right={EditorPanel} />
      </div>
    </AppLayout>
  );
}