import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import JellyBlobs from '../components/ui/JellyBlobs';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import {
  Code2, Sparkles, Activity, MessageSquareText, Bot, Zap,
  ArrowRight, Link2,
} from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Execution Trace Visualizer',
    desc: 'Watch your code execute line-by-line with animated variable states — like a built-in debugger.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Sparkles,
    title: 'AI Code Review',
    desc: 'Every submission gets a senior-engineer-style review — complexity analysis, bugs, and optimization tips.',
    color: 'from-primary to-purple-500',
  },
  {
    icon: MessageSquareText,
    title: 'Socratic AI Tutor',
    desc: 'A mentor that guides you to the answer with questions — not just hands you the solution.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Bot,
    title: 'Autonomous Career Agent',
    desc: 'An AI agent that analyzes your weaknesses, finds problems, and builds your personalized roadmap.',
    color: 'from-amber-500 to-orange-500',
  },
];

const ROTATING_WORDS = ['first day', 'interview', 'placement season', 'dream job'];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const [wordIndex, setWordIndex] = useState(0);
  const [stories, setStories] = useState<any[]>([]);

  // 1. Fetch Success Stories from Backend API
  useEffect(() => {
    apiClient
      .get('/success-stories/')
      .then((res) => setStories(res.data))
      .catch(() => { });
  }, []);

  // 2. GSAP Animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.9 }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      );

    const cards = featuresRef.current?.querySelectorAll('.feature-card');
    if (cards) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'back.out(1.4)',
          delay: 0.3,
        }
      );
    }
  }, []);

  // 3. Rotating Text Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-x-hidden force-dark">
      <JellyBlobs variant="subtle" />

      {/* Nav */}
      <nav className="relative z-20 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="bg-primary/20 p-1.5 rounded-lg">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          CodeMentor AI
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-medium transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div ref={heroRef} className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full text-xs text-gray-300 mb-6"
        >
          <Zap className="w-3.5 h-3.5 text-primary" />
          AI-Native Software Engineering Simulation
        </motion.div>

        <h1 ref={titleRef} className="font-display text-5xl md:text-6xl font-bold leading-tight mb-5">
          Practice like it's your{' '}
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="gradient-text inline-block"
            >
              {ROTATING_WORDS[wordIndex]}
            </motion.span>
          </AnimatePresence>{' '}
          at a real company.
        </h1>

        <p ref={subtitleRef} className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Solve real-world coding problems, debug production-like code, get AI-powered
          reviews, and track your Industry Readiness Score — all in one platform.
        </p>

        <div ref={ctaRef} className="flex items-center justify-center gap-4">
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Start Practicing Free
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="text-gray-400 hover:text-white px-6 py-3 text-sm transition-colors"
            >
              or explore as guest →
            </motion.button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
          <div>
            <p className="font-display text-3xl font-bold gradient-text">
              <AnimatedCounter value={8} suffix="+" />
            </p>
            <p className="text-gray-500 text-sm mt-1">AI Features</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold gradient-text">
              <AnimatedCounter value={100} suffix="%" />
            </p>
            <p className="text-gray-500 text-sm mt-1">Original Problems</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold gradient-text">
              <AnimatedCounter value={24} suffix="/7" />
            </p>
            <p className="text-gray-500 text-sm mt-1">AI Mentor Access</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div ref={featuresRef} className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="feature-card glass-card glow-border rounded-2xl p-6 relative overflow-hidden"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} mb-4`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories Section */}
      {stories.length > 0 && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
          <h2 className="font-display text-2xl font-bold text-center mb-8">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stories.slice(0, 3).map((s: any, idx: number) => (
              <div key={s.id || idx} className="glass-card p-5 rounded-xl border border-dark-border">
                <p className="text-sm text-gray-300 italic mb-3">"{s.quote || s.content}"</p>
                {s.company_name && (
                  <p className="text-xs text-gray-400 mb-1">
                    {s.role ? `${s.role} @ ` : ''}{s.company_name}
                  </p>
                )}
                <p className="text-xs font-semibold gradient-text">{s.author || s.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with credit */}
      <footer className="relative z-10 border-t border-dark-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 CodeMentor AI — An AI-powered software engineering simulation platform.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              Built with <span className="text-red-400">♥</span> by{' '}
              <span className="gradient-text font-semibold font-display">Tanisha</span>
            </p>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <Link2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}