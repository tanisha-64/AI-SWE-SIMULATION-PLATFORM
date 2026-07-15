import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/client';
import JellyBlobs from '../components/ui/JellyBlobs';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    apiClient
      .post('/auth/verify-email', { token })
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification failed.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
      <JellyBlobs />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-dark-card border border-dark-border rounded-2xl p-8 max-w-md mx-4 text-center"
      >
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-xl font-bold mb-2">Email Verified!</h1>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <Link to="/login" className="inline-block bg-primary hover:bg-primary-dark px-6 py-2.5 rounded-lg font-medium transition-all">
              Sign In Now
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <Link to="/register" className="text-primary hover:underline text-sm">Try registering again</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}