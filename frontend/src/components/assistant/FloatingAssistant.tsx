import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../../api/services';
import AvatarFace from './AvatarFace';
import { Send, X, Sparkles, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
}

const GREETINGS = [
  "Hey! I'm your AI Assistant 👋",
  "Stuck on something? Ask me anything!",
  "I can explain any DSA concept instantly.",
];

export default function FloatingAssistant() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [greetingIdx, setGreetingIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 2500);
    const cycle = setInterval(() => {
      setGreetingIdx((i) => (i + 1) % GREETINGS.length);
    }, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(cycle);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  if (location.pathname.startsWith('/mentor')) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input;
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatService.ask(question);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.data.answer, sources: res.data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Sorry, I couldn't process that. Try again?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Speech bubble hint */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-20 right-0 glass-card rounded-2xl rounded-br-sm px-4 py-3 w-64 shadow-xl"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={greetingIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm text-gray-200"
              >
                {GREETINGS[greetingIdx]}
              </motion.p>
            </AnimatePresence>
            <button
              onClick={() => setShowBubble(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-dark-border rounded-full flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 h-[28rem] glass-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-primary/20"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 border-b border-dark-border">
              <AvatarFace size={40} isThinking={loading} />
              <div>
                <p className="font-semibold text-sm">Assistant</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> AI Mentor · Online
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-8">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
                  Ask me about any DSA concept, debugging tip, or interview strategy!
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-dark-bg text-gray-200 rounded-bl-sm'
                      }`}
                  >
                    {m.text}
                    {m.sources && m.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.sources.map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-dark-bg rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-dark-border flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-dark p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating avatar button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setOpen(!open);
          setShowBubble(false);
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <AvatarFace size={64} />
      </motion.button>
    </div>
  );
}