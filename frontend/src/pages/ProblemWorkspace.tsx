import { celebrateSuccess } from '../utils/celebrate';
import toast from 'react-hot-toast';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import AppLayout from '../components/layout/AppLayout';
import TraceVisualizer from '../components/workspace/TraceVisualizer';
import ResultsPanel from '../components/workspace/ResultsPanel';
import ResizableSplit from '../components/workspace/ResizableSplit';
import { problemService, submissionService } from '../api/services';
import { useTheme } from '../context/ThemeContext';
import { Play, Send, Activity, Loader2, ListChecks, Building2 } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  problem_type: string;
  company_style_tag?: string;
  test_cases?: { input: string; output: string; is_sample: boolean }[];
}

type Tab = 'testcases' | 'trace' | 'review';

export default function ProblemWorkspace() {
  const { id } = useParams();
  const { theme } = useTheme();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('# Write your solution here\n');
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('testcases');
  const [runResult, setRunResult] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [traceData, setTraceData] = useState<any>(null);
  const [tracing, setTracing] = useState(false);
  const [waitingForReview, setWaitingForReview] = useState(false);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    problemService.getById(Number(id)).then((res) => {
      setProblem(res.data);
      setLoadingProblem(false);
    });
    return () => clearInterval(pollRef.current);
  }, [id]);

  const handleRun = async () => {
    if (!problem) return;
    setRunning(true);
    setActiveTab('testcases');
    try {
      const res = await submissionService.runCode({ problem_id: problem.id, code, language: 'python' });
      setRunResult(res.data);
    } finally {
      setRunning(false);
    }
  };

  const handleTrace = async () => {
    if (!problem) return;
    setTracing(true);
    setActiveTab('trace');
    try {
      const res = await submissionService.traceCode({ problem_id: problem.id, code, language: 'python' });
      setTraceData(res.data);
    } finally {
      setTracing(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setActiveTab('review');
    setWaitingForReview(true);
    try {
      const res = await submissionService.submit({ problem_id: problem.id, code, language: 'python' });
      setSubmitResult(res.data);
      if (res.data.status === 'passed') {
        celebrateSuccess();
        toast.success('All tests passed! 🎉');
      }
      const submissionId = res.data.id;
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        const check = await submissionService.getById(submissionId);
        if (check.data.ai_review || attempts > 15) {
          setSubmitResult(check.data);
          setWaitingForReview(false);
          clearInterval(pollRef.current);
        }
      }, 2000);
    } catch {
      setWaitingForReview(false);
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

  if (loadingProblem) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!problem) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center text-gray-400">Problem not found.</div>
      </AppLayout>
    );
  }

  const displayResult = activeTab === 'testcases' ? runResult : submitResult;

  const DescriptionPanel = (
    <div className="h-full overflow-y-auto p-6 noise-texture relative">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-3 gradient-text leading-tight">
          {problem.title}
        </h1>

        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${difficultyStyle(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs px-3 py-1 bg-dark-border rounded-full text-gray-400 border border-dark-border">
            {problem.category}
          </span>
          {problem.company_style_tag && (
            <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {problem.company_style_tag}
            </span>
          )}
        </div>

        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{problem.description}</p>

        {problem.test_cases
          ?.filter((tc) => tc.is_sample)
          .map((tc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="mt-4 glass-card glow-border rounded-xl p-4"
            >
              <p className="text-xs text-gray-500 mb-1 font-mono uppercase tracking-wider">Sample Input</p>
              <pre className="text-sm font-mono text-gray-300 mb-3 whitespace-pre-wrap">{tc.input}</pre>
              <p className="text-xs text-gray-500 mb-1 font-mono uppercase tracking-wider">Sample Output</p>
              <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{tc.output}</pre>
            </motion.div>
          ))}
      </motion.div>
    </div>
  );

  const EditorPanel = (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[300px] border-b border-dark-border">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 }, fontFamily: 'JetBrains Mono' }}
        />
      </div>

      <div className="flex items-center gap-2 p-3 border-b border-dark-border bg-dark-card">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 px-4 py-2 bg-dark-border hover:bg-dark-border/70 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleTrace}
          disabled={tracing}
          className="flex items-center gap-1.5 px-4 py-2 bg-dark-border hover:bg-dark-border/70 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
        >
          {tracing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          Trace
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-sm font-medium transition-all disabled:opacity-60 ml-auto"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit
        </motion.button>
      </div>

      <div className="flex items-center gap-1 px-3 pt-2 bg-dark-card border-b border-dark-border">
        {(['testcases', 'trace', 'review'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium capitalize relative transition-colors ${activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
          >
            {tab === 'testcases' ? 'Test Results' : tab === 'trace' ? 'Execution Trace' : 'AI Review'}
            {activeTab === tab && (
              <motion.div layoutId="workspace-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-dark-card">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'trace' ? (
              tracing ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : traceData ? (
                <TraceVisualizer trace={traceData.trace} code={code} />
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">Click "Trace" to see step-by-step execution.</p>
              )
            ) : displayResult ? (
              <ResultsPanel
                status={displayResult.status || (displayResult.success ? 'passed' : 'failed')}
                passedCount={displayResult.passed_count ?? 0}
                totalCount={displayResult.total_count ?? 0}
                testResults={displayResult.results || displayResult.test_results || []}
                aiReview={displayResult.ai_review}
                waitingForReview={activeTab === 'review' && waitingForReview}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <ListChecks className="w-8 h-8 mb-2" />
                <p className="text-sm">Run or Submit your code to see results here.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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