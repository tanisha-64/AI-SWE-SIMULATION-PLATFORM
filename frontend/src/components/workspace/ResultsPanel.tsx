import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';

interface TestResult {
  test_id: number;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  is_sample: boolean;
}

interface AIReview {
  code_quality_score?: number;
  code_quality_note?: string;
  time_complexity?: string;
  space_complexity?: string;
  bugs_found?: string | string[];
  optimization_suggestions?: string | string[];
  overall_verdict?: string;
}

interface ResultsPanelProps {
  status: string;
  passedCount: number;
  totalCount: number;
  testResults: TestResult[];
  aiReview?: AIReview | null;
  waitingForReview?: boolean;
}

export default function ResultsPanel({
  status,
  passedCount,
  totalCount,
  testResults,
  aiReview,
  waitingForReview,
}: ResultsPanelProps) {
  const statusColor =
    status === 'passed' ? 'text-green-400' : status === 'partial' ? 'text-yellow-400' : 'text-red-400';

  const formatList = (val?: string | string[]) => {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    return [val];
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-dark-bg rounded-xl p-4"
      >
        <div className="flex items-center gap-2">
          {status === 'passed' ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400" />
          )}
          <span className={`font-semibold capitalize ${statusColor}`}>{status}</span>
        </div>
        <span className="text-gray-400 text-sm">
          {passedCount}/{totalCount} test cases passed
        </span>
      </motion.div>

      <div className="space-y-2">
        {testResults.map((t, i) => (
          <motion.div
            key={t.test_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-dark-bg rounded-lg p-3 text-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              {t.passed ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="font-medium">Test {t.test_id}</span>
              {!t.is_sample && <span className="text-xs text-gray-500">(hidden)</span>}
            </div>
            {!t.passed && (
              <div className="ml-6 space-y-0.5 text-xs text-gray-400 font-mono">
                <p>Input: {t.input}</p>
                <p>Expected: {t.expected}</p>
                <p>Got: {t.actual || '—'}</p>
                {t.error && <p className="text-red-400">{t.error}</p>}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* AI Review */}
      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">AI Code Review</span>
        </div>

        {waitingForReview ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating review...
          </div>
        ) : aiReview ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 text-sm">
            {aiReview.code_quality_score !== undefined && aiReview.code_quality_score !== null && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Quality Score:</span>
                <span className="font-semibold text-primary">{aiReview.code_quality_score}/10</span>
              </div>
            )}
            {aiReview.code_quality_note && <p className="text-gray-300">{aiReview.code_quality_note}</p>}

            <div className="grid grid-cols-2 gap-3">
              {aiReview.time_complexity && (
                <div>
                  <p className="text-gray-500 text-xs">Time Complexity</p>
                  <p className="font-mono text-green-400">{aiReview.time_complexity}</p>
                </div>
              )}
              {aiReview.space_complexity && (
                <div>
                  <p className="text-gray-500 text-xs">Space Complexity</p>
                  <p className="font-mono text-blue-400">{aiReview.space_complexity}</p>
                </div>
              )}
            </div>

            {formatList(aiReview.bugs_found) && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Bugs/Edge Cases</p>
                <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                  {formatList(aiReview.bugs_found)!.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {formatList(aiReview.optimization_suggestions) && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Optimization Suggestions</p>
                <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                  {formatList(aiReview.optimization_suggestions)!.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiReview.overall_verdict && (
              <p className="italic text-gray-400 border-t border-dark-border pt-2">
                "{aiReview.overall_verdict}"
              </p>
            )}
          </motion.div>
        ) : (
          <p className="text-gray-500 text-sm">Submit your code to get an AI review.</p>
        )}
      </div>
    </div>
  );
}