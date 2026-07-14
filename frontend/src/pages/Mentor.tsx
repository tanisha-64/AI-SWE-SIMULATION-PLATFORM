import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import AvatarFace from '../components/assistant/AvatarFace';
import { chatService } from '../api/services';
import { Send, Sparkles, MessageCircleQuestion, Loader2, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
}

type Mode = 'direct' | 'socratic';

const SUGGESTIONS = [
  'Explain binary search',
  'What is dynamic programming?',
  'BFS vs DFS — when to use which?',
  'How does a hash map work internally?',
];

export default function Mentor() {
  const [mode, setMode] = useState<Mode>('direct');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [topicThread] = useState(`session-${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res =
        mode === 'direct'
          ? await chatService.ask(text)
          : await chatService.socratic(text, topicThread);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.data.answer, sources: res.data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Sorry, I ran into an issue. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => setMessages([]);

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AvatarFace size={44} isThinking={loading} />
              <div>
                <h1 className="font-display text-xl font-bold">AI Mentor</h1>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Grounded in a self-expanding knowledge base
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> New chat
              </button>
            )}
          </div>

          {/* Mode toggle */}
          <div className="inline-flex glass-card rounded-xl p-1">
            <button
              onClick={() => {
                setMode('direct');
                clearChat();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'direct' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Direct Answers
            </button>
            <button
              onClick={() => {
                setMode('socratic');
                clearChat();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'socratic' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageCircleQuestion className="w-3.5 h-3.5" /> Socratic Tutor
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={mode}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500 mt-2"
            >
              {mode === 'direct'
                ? 'Get clear, complete explanations instantly.'
                : "I'll guide you with questions first, helping you discover the answer yourself."}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <AvatarFace size={72} />
              </motion.div>
              <p className="text-gray-400 text-sm mt-4 mb-6 max-w-sm">
                Ask me anything about data structures, algorithms, or interview prep.
                I'll only answer from verified knowledge — no hallucinations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full">
                {SUGGESTIONS.map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs glass-card glow-border rounded-lg px-3 py-2.5 text-gray-300 hover:text-white transition-colors"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="shrink-0 mt-1">
                    <AvatarFace size={32} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'glass-card text-gray-200 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                  {m.sources && m.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-white/10">
                      {m.sources.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          📚 {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 mt-1">
                <AvatarFace size={32} isThinking />
              </div>
              <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-dark-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'direct' ? 'Ask a concept, e.g. "What is recursion?"' : 'What are you stuck on?'}
            className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-primary to-purple-600 px-5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </form>
      </div>
    </AppLayout>
  );
}