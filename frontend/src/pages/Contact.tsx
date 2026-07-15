import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { contactService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Bug, Lightbulb, HelpCircle, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'help', label: 'Get Help', icon: HelpCircle, color: 'from-blue-500 to-cyan-500' },
  { id: 'bug', label: 'Report a Bug', icon: Bug, color: 'from-red-500 to-rose-500' },
  { id: 'feature_request', label: 'Suggest a Feature', icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
  { id: 'feedback', label: 'Share Feedback', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
];

const FAQS = [
  { q: 'How does the AI code review work?', a: 'Every submission is analyzed by an AI model for code quality, time/space complexity, potential bugs, and optimization opportunities — processed asynchronously so your results appear within seconds.' },
  { q: 'Are the problems really AI-generated?', a: 'Yes — our platform generates original problems on demand using AI, so content never runs out and stays relevant to any topic you search.' },
  { q: 'What is the Industry Readiness Score?', a: 'A composite score (0-100) based on your accuracy, consistency, problem-solving volume, code quality, and debugging skill — designed to estimate real interview readiness.' },
  { q: 'Is my data secure?', a: 'Yes. Passwords are hashed with bcrypt, all API access requires JWT authentication, and sensitive routes are rate-limited to prevent abuse.' },
];

export default function Contact() {
  const { user } = useAuth();
  const [category, setCategory] = useState('help');
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactService.submit({ name, email, category, subject, message });
      setSent(true);
      toast.success('Message sent! Check your email for confirmation.');
    } catch {
      toast.error('Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">Contact & Help</h1>
          </div>
          <p className="text-gray-400 mb-8">Have a question, found a bug, or want to suggest something? We'd love to hear from you.</p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-card border border-green-500/20 rounded-2xl p-10 text-center"
            >
              <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold mb-2">Message Sent!</h2>
              <p className="text-gray-400 text-sm mb-6">We've sent a confirmation to your email. Our team typically responds within 24-48 hours.</p>
              <button
                onClick={() => setSent(false)}
                className="text-primary hover:underline text-sm"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 mb-10">
              {/* Category selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border transition-all text-center ${
                      category === cat.id ? 'border-primary bg-primary/10' : 'border-dark-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${cat.color} mb-1.5`}>
                      <cat.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-medium">{cat.label}</p>
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Brief summary"
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </motion.button>
            </form>
          )}

          {/* FAQ */}
          <h2 className="font-display text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} className="text-primary text-lg">+</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}