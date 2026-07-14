import { motion } from 'framer-motion';
import { useState } from 'react';
import { Crown, Sparkles, Loader2, X } from 'lucide-react';
import { agentService } from '../../api/services';

export default function PremiumCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleRunAgent = async () => {
    setLoading(true);
    setError('');
    setShowModal(true);
    try {
      const res = await agentService.runCareerAdvisor();
      setResult(res.data);
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? 'This is a Premium feature. Upgrade to unlock your AI Career Agent.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-amber-500/20"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(168,85,247,0.08))',
        }}
      >
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Premium</span>
          </div>
        </div>

        <h3 className="font-display text-lg font-bold mb-2 relative">AI Career Advisor Agent</h3>
        <p className="text-gray-400 text-sm mb-4 relative">
          An autonomous agent that analyzes your performance, finds weak areas, recommends problems,
          and builds a personalized action plan — all in one click.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRunAgent}
          className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Run Career Agent
        </motion.button>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-amber-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-lg">Your Career Plan</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-gray-400 text-sm text-center">
                  Analyzing your performance, fetching recommendations, generating your plan...
                </p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-red-400 text-sm mb-2">{error}</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="bg-dark-bg rounded-xl p-4">
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{result.action_plan}</p>
                </div>

                {result.reasoning_steps && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Agent Reasoning</p>
                    <div className="space-y-1.5">
                      {result.reasoning_steps.map((step: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-xs text-gray-400"
                        >
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] shrink-0">
                            {i + 1}
                          </span>
                          {step.result}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}