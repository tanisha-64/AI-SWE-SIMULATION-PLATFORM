import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { agentService, analyticsService } from '../api/services';
import apiClient from '../api/client';
import { Crown, Sparkles, Loader2, Zap, X, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState<any>(null);
  const [agentError, setAgentError] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Success Story Form State
  const [quote, setQuote] = useState('');
  const [role, setRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [storySuccess, setStorySuccess] = useState(false);
  const [storyError, setStoryError] = useState('');

  useEffect(() => {
    analyticsService.getStreak().then((res) => setStreak(res.data)).catch(() => {});
  }, []);

  const handleRunAgent = async () => {
    setAgentLoading(true);
    setAgentError('');
    setShowResult(true);
    try {
      const res = await agentService.runCareerAdvisor();
      setAgentResult(res.data);
    } catch (err: any) {
      setAgentError(
        err.response?.status === 403
          ? 'This is a Premium feature. Upgrade to unlock the AI Career Agent.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setAgentLoading(false);
    }
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim()) return;

    setStorySubmitting(true);
    setStoryError('');
    try {
      await apiClient.post('/success-stories/', {
        quote: quote.trim(),
        role: role.trim() || undefined,
        company_name: companyName.trim() || undefined,
        author: user?.full_name || 'Anonymous',
      });
      setStorySuccess(true);
      setQuote('');
      setRole('');
      setCompanyName('');
      setTimeout(() => setStorySuccess(false), 4000);
    } catch (err: any) {
      setStoryError(err.response?.data?.detail || 'Failed to submit story. Please try again.');
    } finally {
      setStorySubmitting(false);
    }
  };

  const initials = user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile header */}
          <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">{user?.full_name}</h1>
              <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
            {streak && (
              <div className="text-center">
                <p className="font-display text-2xl font-bold gradient-text">{streak.current_streak}</p>
                <p className="text-xs text-gray-500">day streak</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Premium / Lightning Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl p-8 border border-amber-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(168,85,247,0.1))' }}
        >
          {/* Animated lightning bolts */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${20 + i * 30}%`, top: '-10%' }}
              animate={{ opacity: [0, 1, 0], y: [0, 40] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2 + i * 1.3, delay: i * 0.5 }}
            >
              <Zap className="w-8 h-8 text-amber-400/60" fill="currentColor" />
            </motion.div>
          ))}

          <motion.div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-500/15 blur-3xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Premium Feature</span>
            </div>

            <h2 className="font-display text-2xl font-bold mb-2">AI Career Advisor Agent</h2>
            <p className="text-gray-300 text-sm max-w-lg mb-6 leading-relaxed">
              An autonomous multi-step AI agent — it analyzes your performance data, identifies
              weak areas, fetches targeted problem recommendations, retrieves relevant concept
              explanations, and synthesizes it all into one personalized action plan.
            </p>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunAgent}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Run AI Career Agent
            </motion.button>
          </div>
        </motion.div>

        {/* Share Your Success Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 border border-dark-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Share Your Success Story</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            Landed an interview or a job? Share your journey to inspire other developers on the landing page!
          </p>

          {storySuccess && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Your success story has been submitted successfully!
            </div>
          )}

          {storyError && (
            <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {storyError}
            </div>
          )}

          <form onSubmit={handleStorySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Your Story / Review / Feedback <span className="text-red-400">*</span>
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="How did CodeMentor AI help you in your preparation?"
                rows={3}
                required
                className="w-full bg-dark-bg/60 border border-dark-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Role (Optional)</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SDE-1, Frontend Developer"
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Company Name (Optional)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Amazon, Google, Startup"
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={storySubmitting || !quote.trim()}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                {storySubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Story
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowResult(false)}
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
              <button onClick={() => setShowResult(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {agentLoading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-gray-400 text-sm text-center">
                  Analyzing performance, fetching recommendations, generating your plan...
                </p>
              </div>
            ) : agentError ? (
              <div className="py-8 text-center">
                <p className="text-red-400 text-sm mb-2">{agentError}</p>
              </div>
            ) : agentResult ? (
              <div className="space-y-4">
                <div className="bg-dark-bg rounded-xl p-4">
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {agentResult.action_plan}
                  </p>
                </div>
                {agentResult.reasoning_steps && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Agent Reasoning</p>
                    <div className="space-y-1.5">
                      {agentResult.reasoning_steps.map((step: any, i: number) => (
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
    </AppLayout>
  );
}