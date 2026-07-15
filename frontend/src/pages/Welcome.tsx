import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import JellyBlobs from '../components/ui/JellyBlobs';
import JarvisOrb from '../components/onboarding/JarvisOrb';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

const SCRIPT = (name: string) => [
  `Hello ${name}. Welcome to CodeMentor AI.`,
  "I'm your onboarding guide. Let me quickly show you around.",
  "This platform helps you prepare for real software engineering interviews — with AI-generated problems, live code execution, and step-by-step debugging visualizations.",
  "You'll find a Career Tracks section tailored to your target salary band, a Daily MCQ Challenge that refreshes every day, and an AI Mentor available anytime you're stuck.",
  "Your Dashboard tracks your streak, your Industry Readiness Score, and personalized recommendations based on your weak areas.",
  "Everything here is grounded in real data — no fluff. Let's get you interview-ready.",
  "This platform was built and designed by Tanisha. Let's begin.",
];

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking } = useSpeech();
  const [lineIdx, setLineIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const hasSkippedRef = useRef(false);

  const lines = SCRIPT(user?.full_name?.split(' ')[0] || 'there');

  useEffect(() => {
    if (!started) return;
    if (lineIdx >= lines.length) {
      const timer = setTimeout(() => navigate('/dashboard'), 1500);
      return () => clearTimeout(timer);
    }

    if (muted) {
      const timer = setTimeout(() => setLineIdx((i) => i + 1), 2200);
      return () => clearTimeout(timer);
    }

    speak(lines[lineIdx], () => {
      if (!hasSkippedRef.current) {
        setTimeout(() => setLineIdx((i) => i + 1), 300);
      }
    });

    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx, started, muted]);

  const handleSkip = () => {
    hasSkippedRef.current = true;
    stop();
    navigate('/dashboard');
  };

  const handleStart = () => {
    setStarted(true);
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden flex flex-col items-center justify-center px-6">
      <JellyBlobs />

      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors z-20"
      >
        Skip intro <SkipForward className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <JarvisOrb isSpeaking={false} size={160} />
            <h1 className="font-display text-2xl font-bold mt-6 mb-2">
              Hi {user?.full_name?.split(' ')[0]}, ready?
            </h1>
            <p className="text-gray-400 text-sm mb-8 max-w-sm">
              Let me give you a quick voice-guided tour of the platform.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="bg-gradient-to-r from-primary to-purple-600 px-8 py-3 rounded-xl font-semibold"
            >
              Start Tour
            </motion.button>
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-300 text-sm mt-4 transition-colors"
            >
              Skip and go to Dashboard
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="tour"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center text-center max-w-xl"
          >
            <JarvisOrb isSpeaking={isSpeaking && !muted} size={180} />

            <div className="mt-8 h-24 flex items-center justify-center px-4">
              <AnimatePresence mode="wait">
                <motion.p
                  key={lineIdx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="font-display text-lg md:text-xl text-gray-100 leading-relaxed"
                >
                  {lines[Math.min(lineIdx, lines.length - 1)]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-6">
              {lines.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === lineIdx ? 'w-8 bg-primary' : i < lineIdx ? 'w-4 bg-primary/40' : 'w-4 bg-dark-border'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setMuted(!muted)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {muted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}