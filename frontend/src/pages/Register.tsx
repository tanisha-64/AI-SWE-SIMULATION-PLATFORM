import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/client';
import JellyBlobs from '../components/ui/JellyBlobs';
import { UserPlus, Loader2, MailCheck } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email: email.trim().toLowerCase(),
      password,
      full_name: fullName.trim(),
    };

    try {
      const res = await apiClient.post('/auth/register', payload);
      console.log('Register response:', res.data);
      setRegistered(true);
    } catch (err: any) {
      console.error('Register error:', err.response?.data);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '));
      } else {
        setError(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    try {
      await apiClient.post('/auth/resend-verification', { email: email.trim().toLowerCase() });
      setResendMsg('Verification email resent! Check your inbox.');
    } catch (err: any) {
      setResendMsg(err.response?.data?.detail || 'Could not resend. Try again shortly.');
    } finally {
      setResending(false);
    }
  };

  const startOver = () => {
    setRegistered(false);
    setFullName('');
    setEmail('');
    setPassword('');
    setError('');
    setResendMsg('');
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
        <JellyBlobs />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md mx-4 bg-dark-card border border-dark-border rounded-2xl p-8 text-center"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <MailCheck className="w-14 h-14 text-primary mx-auto mb-4" />
          </motion.div>
          <h1 className="text-xl font-bold mb-2">Check your inbox</h1>
          <p className="text-gray-400 text-sm mb-6">
            We sent a verification link to <span className="text-white font-medium">{email}</span>.
            Click it to activate your account. Don't forget to check spam/junk.
          </p>

          <button
            onClick={handleResend}
            disabled={resending}
            className="text-primary hover:underline text-sm disabled:opacity-50"
          >
            {resending ? 'Resending...' : "Didn't get it? Resend email"}
          </button>

          {resendMsg && <p className="text-xs text-gray-400 mt-2">{resendMsg}</p>}

          <div className="mt-6 flex flex-col gap-2">
            <Link to="/login" className="text-gray-500 hover:text-white text-sm">Back to Sign In</Link>
            <button onClick={startOver} className="text-gray-600 hover:text-gray-400 text-xs">
              Used the wrong email? Register again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
      <JellyBlobs />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="flex justify-center mb-6">
            <div className="bg-primary/20 p-4 rounded-2xl">
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          <h1 className="text-2xl font-bold text-center mb-1">Create Account</h1>
          <p className="text-gray-400 text-center mb-8">Start your placement prep journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
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
                autoComplete="email"
                placeholder="Use a real, active email — verification required"
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 chars, 1 uppercase, 1 number"
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}